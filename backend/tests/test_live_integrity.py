"""Simulated provider tests, never evidence of live inference."""
import asyncio
import httpx
import pytest
from app.config import settings
from app.services.errors import ResearchServiceError
from app.services.nemotron import NemotronService, CandidateClaim
from app.services.tavily import TavilyService
from app.services import orchestrator as pipeline
from app.services.synthesis import synthesize_report
from app.services.verifier import verify_quote_in_text
from app.storage.memory_store import run_store
from app.schemas.research import ResearchClaim, ResearchEvidence


def model_response(content):
    return httpx.MockTransport(lambda req: httpx.Response(200, json={"choices": [{"message": {"content": content}}]}))


@pytest.mark.asyncio
@pytest.mark.parametrize("key", ["", "your_nebius_api_key_here"])
async def test_missing_credentials_never_generate_substitute_success(key):
    with pytest.raises(ResearchServiceError):
        await NemotronService(api_key=key).classify_support("claim", "text")
    with pytest.raises(ResearchServiceError):
        await TavilyService(api_key=key).search("query")


@pytest.mark.asyncio
@pytest.mark.parametrize("status", [401, 429, 500])
async def test_vendor_failure_never_returns_fake_sources_or_support(status, caplog):
    transport = httpx.MockTransport(lambda req: httpx.Response(status, text="PRIVATE-VENDOR-BODY secret-key"))
    for service, method, args in [(TavilyService("test-key", transport), "search", ("q",)),
                                  (NemotronService("test-key", model_id="nvidia/test-nemotron", transport=transport), "classify_support", ("claim", "text"))]:
        with pytest.raises(ResearchServiceError) as err:
            await getattr(service, method)(*args)
        assert "PRIVATE" not in str(err.value)
    assert "PRIVATE" not in caplog.text and "secret-key" not in caplog.text


@pytest.mark.asyncio
@pytest.mark.parametrize("content", ['garbage', '{}', '{"assessment":"supported_by_excerpt"}', '{"assessment":"verified","explanation":"ok"}'])
async def test_invalid_support_output_is_an_error(content):
    service = NemotronService("test-key", model_id="nvidia/test-nemotron", transport=model_response(content))
    with pytest.raises(ResearchServiceError):
        await service.classify_support("claim", "excerpt")


@pytest.mark.asyncio
async def test_live_adapter_parses_valid_output_without_fallback():
    service = NemotronService("test-key", model_id="nvidia/test-nemotron", transport=model_response('["q1","q2"]'))
    assert await service.generate_plan("question") == ["q1", "q2"]
    service.transport = model_response('{"assessment":"unsupported","explanation":"Wrong dataset."}')
    assert (await service.classify_support("claim", "excerpt"))["assessment"] == "unsupported"
    service.transport = model_response('{"claims":[{"text":"AdapterX uses 5 MB.","excerpt":"AdapterX uses 5 MB."}]}')
    assert (await service.extract_claims("question", "AdapterX uses 5 MB."))[0].method is None


@pytest.mark.asyncio
async def test_search_requires_actual_retrieved_text_and_deduplicates():
    def respond(request):
        assert b'"include_raw_content":true' in request.content
        return httpx.Response(200, json={"results": [
            {"title": "Read", "url": "https://papers.test/a#section", "raw_content": "actual text"},
            {"title": "Duplicate", "url": "https://papers.test/a", "raw_content": "text"},
            {"title": "Snippet only", "url": "https://papers.test/b", "content": "search snippet"},
            {"title": "Unsafe", "url": "javascript:alert(1)", "raw_content": "x"}]})
    result = await TavilyService("test-key", httpx.MockTransport(respond)).search("q")
    assert len(result) == 2 and result[0]["raw_text"] == "actual text"
    assert result[1]["raw_text"] == "" and result[1]["access_status"] == "unavailable"


def report_inputs():
    excerpt = "AdapterX on DatasetZ achieved 5 MB memory; small sample."
    claim = ResearchClaim(id="c1", text=excerpt, assessment="supported_by_excerpt", evidence_ids=["e1"])
    evidence = ResearchEvidence(id="e1", source_id="s1", claim_id="c1", excerpt=excerpt)
    candidate = CandidateClaim(text=excerpt, excerpt=excerpt, method="AdapterX", dataset="DatasetZ", metric="memory", result="5", units="MB", limitation="small sample")
    return claim, evidence, candidate


def test_comparison_is_linked_and_unknown_values_are_not_invented():
    claim, evidence, candidate = report_inputs()
    report = synthesize_report("memory question", [claim], [evidence], {"c1": candidate})
    assert report.comparison[0].method == "AdapterX" and report.comparison[0].result == "5"
    assert report.comparison[0].claim_ids == ["c1"] and report.comparison[0].comparability_warning
    assert "[c1]" in report.summary
    candidate.result = "99"
    assert synthesize_report("q", [claim], [evidence], {"c1": candidate}).comparison[0].result is None
    candidate.dataset = "InventedDataset"
    report = synthesize_report("q", [claim], [evidence], {"c1": candidate})
    assert report.comparison[0].dataset is None and report.comparison[0].result is None


def test_unsupported_or_unlinked_claims_never_become_comparison_findings():
    claim, evidence, candidate = report_inputs()
    claim.assessment = "unsupported"
    report = synthesize_report("q", [claim], [evidence], {"c1": candidate})
    assert not report.comparison and "Insufficient" in report.summary
    claim.assessment = "supported_by_excerpt"
    assert not synthesize_report("q", [claim], [], {"c1": candidate}).comparison


def test_quote_matching_does_not_accept_changed_case_or_fake_offsets():
    assert verify_quote_in_text("\n ", "actual text") == (False, None)
    assert verify_quote_in_text("ABC", "abc") == (False, None)
    assert verify_quote_in_text("one two", "one\n   two") == (True, None)


class FakeModel:
    async def generate_plan(self, question):
        return ["first query", "second query"]
    async def extract_claims(self, question, text):
        return [report_inputs()[2]]
    async def classify_support(self, claim, excerpt):
        return {"assessment": "supported_by_excerpt", "explanation": "Simulated support for test."}


class FakeSearch:
    def __init__(self):
        self.queries = []
    async def search(self, query, max_results):
        self.queries.append(query)
        return [{"title": "Test-only source", "url": "https://papers.test/a", "domain": "papers.test", "raw_text": report_inputs()[1].excerpt, "access_status": "accessible"}]


async def run_pipeline():
    service = pipeline.ResearchOrchestrator()
    run = await service.create_and_start_run("Compare memory use")
    await asyncio.gather(*service.tasks)
    return await run_store.get(run.id)


@pytest.mark.asyncio
async def test_pipeline_queries_all_subquestions_and_grounds_report(monkeypatch):
    search = FakeSearch()
    monkeypatch.setattr(pipeline, "nemotron_service", FakeModel())
    monkeypatch.setattr(pipeline, "tavily_service", search)
    run = await run_pipeline()
    assert run.status == "completed" and len(run.sources) == 1
    assert search.queries == ["first query", "second query"]
    assert run.report.comparison[0].method == "AdapterX" and all(s.status == "done" for s in run.steps)


@pytest.mark.asyncio
async def test_pipeline_rejects_fabricated_excerpt(monkeypatch):
    class Invented(FakeModel):
        async def extract_claims(self, question, text):
            return [CandidateClaim(text="Fabricated 99x improvement", excerpt="This text is absent from source.")]
    monkeypatch.setattr(pipeline, "nemotron_service", Invented())
    monkeypatch.setattr(pipeline, "tavily_service", FakeSearch())
    run = await run_pipeline()
    assert run.status == "partial" and not run.evidence and not run.report.comparison
    assert run.report.claims[0].assessment == "unsupported"


@pytest.mark.asyncio
async def test_pipeline_provider_failure_is_failed_not_completed(monkeypatch):
    class Broken(FakeModel):
        async def classify_support(self, claim, excerpt):
            raise ResearchServiceError("MODEL_UNAVAILABLE", "Model unavailable.")
    monkeypatch.setattr(pipeline, "nemotron_service", Broken())
    monkeypatch.setattr(pipeline, "tavily_service", FakeSearch())
    run = await run_pipeline()
    assert run.status == "failed" and run.report is None
    assert run.steps[3].status == "failed" and run.error_code == "MODEL_UNAVAILABLE"


@pytest.mark.asyncio
async def test_pipeline_timeout_and_unexpected_errors_are_safe(monkeypatch):
    class Slow(FakeModel):
        async def generate_plan(self, question):
            await asyncio.sleep(1)
    monkeypatch.setattr(pipeline, "nemotron_service", Slow())
    monkeypatch.setattr(settings, "MAX_EXECUTION_TIMEOUT_SECONDS", 0.001)
    run = await run_pipeline()
    assert run.status == "failed" and run.error_code == "PIPELINE_TIMEOUT"
    class Broken(FakeModel):
        async def generate_plan(self, question):
            raise ValueError("PRIVATE-KEY exception")
    monkeypatch.setattr(pipeline, "nemotron_service", Broken())
    run = await run_pipeline()
    assert "PRIVATE" not in run.error_message and run.error_code == "PIPELINE_ERROR"


@pytest.mark.asyncio
async def test_runtime_preflight_does_not_call_services_when_credentials_missing(monkeypatch):
    from scripts.check_runtime import check
    monkeypatch.setattr(settings, "NEBIUS_API_KEY", "")
    monkeypatch.setattr(settings, "TAVILY_API_KEY", "")
    monkeypatch.setattr(settings, "NEMOTRON_MODEL_ID", "")
    evidence = await check(live=True)
    assert evidence["status"] == "blocked" and evidence["services"] == {}


@pytest.mark.asyncio
async def test_prior_verified_claims_survive_later_model_failure_as_partial(monkeypatch):
    class SecondFailure(FakeModel):
        def __init__(self):
            self.calls = 0
        async def extract_claims(self, question, text):
            return [report_inputs()[2], report_inputs()[2]]
        async def classify_support(self, claim, excerpt):
            self.calls += 1
            if self.calls == 2:
                raise ResearchServiceError("MODEL_UNAVAILABLE", "Model unavailable.")
            assert '"comparison_fields"' in claim and "DatasetZ" in claim
            return await super().classify_support(claim, excerpt)
    monkeypatch.setattr(pipeline, "nemotron_service", SecondFailure())
    monkeypatch.setattr(pipeline, "tavily_service", FakeSearch())
    run = await run_pipeline()
    assert run.status == "partial" and len(run.report.comparison) == 1
    assert run.report.claims[1].assessment == "unsupported" and run.steps[3].status == "failed"


def test_comparison_cannot_borrow_partial_numeric_or_method_tokens():
    from app.services.synthesis import grounded_value
    assert grounded_value("5", "15 MB") is None
    assert grounded_value("AdapterX", "AdapterXL") is None
    assert grounded_value("5", "5 MB") == "5"
