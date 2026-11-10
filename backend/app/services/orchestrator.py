"""Bounded live research pipeline; no synthetic runtime success path."""
import asyncio
import json
import time
import uuid
from ..schemas.research import ResearchRun, RunStep, ResearchSource, ResearchEvidence, ResearchClaim, now_utc_iso
from ..storage.memory_store import run_store
from .tavily import tavily_service, canonical_url
from .nemotron import nemotron_service
from .verifier import verify_quote_in_text, check_numeric_consistency
from .synthesis import synthesize_report
from .errors import ResearchServiceError
from ..config import settings


class ResearchOrchestrator:
    def __init__(self):
        self.tasks: set[asyncio.Task] = set()

    async def create_and_start_run(self, question: str) -> ResearchRun:
        run = ResearchRun(id=f"run-{uuid.uuid4().hex[:12]}", question=question, status="queued",
                          model_id=settings.NEMOTRON_MODEL_ID or None,
                          steps=[RunStep(stage=s, status="waiting") for s in
                                 ("planning", "searching", "reading", "verifying", "synthesizing")])
        await run_store.save(run)
        task = asyncio.create_task(self._execute_pipeline(run.id, question))
        self.tasks.add(task)
        task.add_done_callback(self.tasks.discard)
        return run

    async def _execute_pipeline(self, run_id: str, question: str):
        run = await run_store.get(run_id)
        if not run:
            return
        claims, evidences, candidates = [], [], {}
        active = None
        started = 0.0

        async def begin(index, detail):
            nonlocal active, started
            active, started = index, time.monotonic()
            run.status = run.steps[index].stage
            run.steps[index].status = "running"
            run.steps[index].detail = detail
            await run_store.save(run)

        async def done(detail):
            step = run.steps[active]
            step.status, step.detail = "done", detail
            step.duration_ms = int((time.monotonic() - started) * 1000)
            await run_store.save(run)

        try:
            async with asyncio.timeout(settings.MAX_EXECUTION_TIMEOUT_SECONDS):
                await begin(0, "Requesting focused queries from the configured Nemotron service.")
                queries = await nemotron_service.generate_plan(question)
                await done(f"Planned {len(queries)} search queries.")

                await begin(1, "Retrieving source text through live search.")
                raw_sources, seen = [], set()
                for query in queries:
                    for source in await tavily_service.search(query, max_results=settings.MAX_SOURCES):
                        url = canonical_url(source.get("url", ""))
                        if url and url not in seen and len(raw_sources) < settings.MAX_SOURCES:
                            seen.add(url)
                            raw_sources.append({**source, "url": url, "id": f"src-{len(raw_sources)+1}"})
                run.sources = [ResearchSource(id=s["id"], title=s["title"], url=s["url"], domain=s.get("domain"),
                                             fetched_at=now_utc_iso(), access_status=s["access_status"]) for s in raw_sources]
                await done(f"Retrieved {sum(bool(s['raw_text']) for s in raw_sources)} readable sources from {len(raw_sources)} unique URLs.")
                if not any(s["raw_text"] for s in raw_sources):
                    raise ResearchServiceError("INSUFFICIENT_SOURCES", "No readable source text was retrieved. No research findings were generated.")

                await begin(2, "Extracting atomic claims and verbatim excerpts from retrieved text.")
                for source in raw_sources:
                    if not source["raw_text"]:
                        continue
                    extracted = await nemotron_service.extract_claims(question, source["raw_text"])
                    for candidate in extracted:
                        if len(claims) >= settings.MAX_CLAIMS:
                            break
                        claim_id, ev_id = f"clm-{len(claims)+1}", f"ev-{len(evidences)+1}"
                        valid, offset = verify_quote_in_text(candidate.excerpt, source["raw_text"])
                        claims.append(ResearchClaim(id=claim_id, text=candidate.text, assessment="unsupported",
                                                    evidence_ids=[ev_id] if valid else [],
                                                    explanation="Support assessment has not completed." if valid else "Proposed quote was absent from retrieved text; excerpt rejected."))
                        if valid:
                            evidences.append(ResearchEvidence(id=ev_id, source_id=source["id"], claim_id=claim_id,
                                                              excerpt=candidate.excerpt, match_offset=offset,
                                                              explanation="Verbatim excerpt from retrieved source text; source support is not independent truth."))
                        candidates[claim_id] = candidate
                run.evidence = evidences
                await done(f"Extracted {len(claims)} candidates; retained {len(evidences)} matching excerpts.")

                await begin(3, "Checking numeric consistency and requesting model-assisted support assessment.")
                for claim in claims:
                    ev = next((e for e in evidences if e.claim_id == claim.id), None)
                    if not ev:
                        continue
                    numeric_ok, reason = check_numeric_consistency(claim.text, ev.excerpt)
                    if not numeric_ok:
                        claim.explanation = reason
                        continue
                    candidate = candidates[claim.id]
                    support_input = json.dumps({"claim": claim.text, "comparison_fields": candidate.model_dump(exclude={"text", "excerpt"}, exclude_none=True)})
                    assessment = await nemotron_service.classify_support(support_input, ev.excerpt)
                    claim.assessment = assessment["assessment"]
                    claim.explanation = assessment["explanation"]
                await done("Completed quote, numeric and model-assisted support checks.")

                await begin(4, "Assembling only evidence-linked findings and comparison fields.")
                run.report = synthesize_report(question, claims, evidences, candidates)
                await done("Assembled report; unknown fields remain unreported.")
                enough = any(c.assessment == "supported_by_excerpt" for c in claims)
                run.status = "completed" if enough else "partial"
                if not enough:
                    run.error_code = "INSUFFICIENT_EVIDENCE"
                    run.error_message = "Insufficient supported evidence; no substantive conclusion is drawn."
                run.finished_at = now_utc_iso()
                await run_store.save(run)
        except (Exception, asyncio.CancelledError) as exc:
            if active is not None:
                run.steps[active].status = "failed"
                run.steps[active].duration_ms = int((time.monotonic() - started) * 1000)
                run.steps[active].detail = "This stage did not complete."
            if isinstance(exc, ResearchServiceError):
                run.error_code, run.error_message = exc.code, exc.public_message
            elif isinstance(exc, TimeoutError):
                run.error_code, run.error_message = "PIPELINE_TIMEOUT", "Research exceeded the execution time limit."
            elif isinstance(exc, asyncio.CancelledError):
                run.error_code, run.error_message = "PIPELINE_CANCELLED", "Research execution was interrupted."
            else:
                run.error_code, run.error_message = "PIPELINE_ERROR", "Research could not complete. Please try again later."
            # Partial output includes only completed support assessments. Unassessed claims stay unsupported.
            has_verified = any(c.assessment == "supported_by_excerpt" for c in claims)
            if has_verified:
                run.report = synthesize_report(question, claims, evidences, candidates)
            run.status = "cancelled" if isinstance(exc, asyncio.CancelledError) else "partial" if has_verified else "failed"
            run.finished_at = now_utc_iso()
            await run_store.save(run)
            if isinstance(exc, asyncio.CancelledError):
                raise


orchestrator = ResearchOrchestrator()
