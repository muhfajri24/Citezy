# Citezy backend

Live-only FastAPI research pipeline. Routes: `GET /api/health` (liveness only), `POST /api/runs` (202), `GET /api/runs/{id}` (200 or safe 404). Bad input returns safe 400. Health does not prove model/search access.

## Setup

Python 3.12+, from `backend/`:

```sh
python -m venv .venv
# Activate your platform's .venv, then:
python -m pip install -r requirements.txt
cp .env.example .env
```

Configure `NEBIUS_API_KEY`, `TAVILY_API_KEY`, and the exact `NEMOTRON_MODEL_ID` available in your account. The model ID is deliberately not guessed. The default base URL is `https://api.tokenfactory.nebius.com/v1`; use the documented regional endpoint if required by your account. Keys are server-side only.

```sh
python -m pytest -q
python -m scripts.check_runtime --live --output ../docs/evidence/runtime-check.json
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The C3 checker performs no calls when any required setting is missing and exits 2. With `--live` and complete settings it requests one bounded model plan and one search, saving only sanitized result metadata. Credits may be consumed; this work did not provision or purchase any.

## Integrity behavior

No key, provider failure, malformed model output, or invalid support assessment becomes a fixture or successful result. Planning uses all distinct returned subqueries. Search requests raw content; snippet-only results are marked unavailable for evidence. Typed extraction is bounded and excerpts must occur exactly or with normalized whitespace in retrieved text. Only exact original matches have offsets; normalized matches return null. Case changes do not count as verbatim quotes.

Numeric presence checks precede model-assisted assessment of both the atomic claim and proposed comparison fields. Supported claims become cited report findings. Comparison fields must be literal spans in the same excerpt; result is omitted if dataset/metric/units are missing. Cross-source comparability is never presumed. This conservative check does not replace scientific verification or guarantee semantic accuracy.

The total execution timeout is enforced. A failed stage is recorded. Previously supported findings can survive a later failure as partial results; unassessed claims stay unsupported. Unknown exceptions are sanitized. No vendor body, prompt or credential is logged by the adapters.

## Production limitations

MemoryRunStore is not durable or multi-worker safe. Retention/expiry, global concurrency/rate/cost controls, persistent job recovery, richer provenance, representative live evaluation and production CORS remain Dev 1 release tasks. Do not claim a public production release until [the handoff checklist](../docs/DEV1_HANDOFF.md) passes.

References: [Nebius API setup](https://dev.nebius.com/token-factory), [Tavily Search API](https://docs.tavily.com/documentation/api-reference/endpoint/search).
