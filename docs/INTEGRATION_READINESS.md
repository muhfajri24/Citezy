# Frontend integration readiness — Phase 6

25 Oktober 2026. **Preparation only; no live backend integration verified.** API_HANDOFF.md remains provisional pending Dev 1 approval. No backend files, API wire fields, statuses, endpoints or environment files changed.

## Existing compatible seams

| Area | Existing behavior |
|---|---|
| Start | HttpResearchApi POST /api/runs, JSON `{ question }`, validates `{ id, status: queued/planning }`; no automatic POST retry |
| Read | GET /api/runs/{encoded-id}, cache no-store; rejects blank/dot IDs and response-ID mismatch |
| Domain | ResearchRun/report/claim/evidence/source types retained; supported_by_excerpt / partially_supported / unsupported unchanged |
| Validation | parseStartResponse/parseRun validate shape, enums, UTC timestamps, optional fields and source URL protocol |
| Integrity | Broken/duplicate references diagnosed; resolver excludes ambiguous links without inventing excerpts |
| Polling | Sequential 2-second GET; stops at terminal/unmount/hidden; bounded transient retries 2/4/8 seconds |
| Abort | GET takes AbortSignal; adapter combines caller cancellation with 10-second timeout and removes listeners |
| Errors | Fixed public messages for HTTP/network/timeout/invalid JSON/schema; no backend stack traces rendered |
| Mode separation | Real adapter never falls back to mock; browser demo persistence constructed only for mock mode |

## Not ready for live claims

ResearchInput/useResearchRun intentionally call getDemoResearchApi. Real mode is rejected visibly, not enabled automatically. UI copy and demo indicators still describe fictional mock content. Enabling real integration requires coordinated UI labeling and API mode wiring after contract sign-off; setting a URL alone does not enable the full live application.

GET /api/health is documented but absent from the current ResearchApi interface/HTTP adapter. Do not invent a health response or add a mandatory readiness dependency before Dev 1 approval. SSE/export remain future work. POST currently has an internal timeout but no caller AbortSignal in the shared interface; changing this requires joint review.

Strict source URL validation rejects malformed URLs at response parsing. Missing/invalid URLs are handled by SourceLink in direct view data, but malformed real payloads can reject the whole response. Dev 1 must agree whether unavailable URLs should be nullable, omitted, or mapped before runtime validation. Do not silently weaken the draft contract.

Backend error-envelope fields are not rendered directly; HTTP status maps to safe fixed messages. Retry-After handling is not implemented. No OpenAPI/Pydantic implementation or runnable backend files were found under backend/ during this audit. No backend scripts were executed.

## Required Dev 1 decisions and evidence

1. Provide authoritative OpenAPI/Pydantic schemas and approve routes, enums, response status codes, UTC timestamp format and opaque ID semantics.
2. Provide queued/active/completed/partial/failed/cancelled response fixtures, missing-source/report examples, and 400/404/429/5xx error envelopes.
3. Agree URL nullability, restricted-source semantics, duplicate-ID handling, evidence span meaning and report guarantees at terminal states.
4. Agree input limits (current demo 10–500), retention/expiry, polling/backoff/Retry-After and request timeouts.
5. Configure actual base URLs, HTTPS/CORS, guest access and resource limits; keep inference/search keys server-side.
6. Jointly enable real UI mode with accurate labels, then test actual start → polling → report → evidence → original source with a real run.
7. Record actual Nemotron/Nebius and Tavily runtime evidence independently. Unit HTTP mocks are not proof of live integration.

## Demo storage boundary

Mock uses versioned sessionStorage key citezy.demo.sessions.v1, at most five snapshots per tab. Original question is replaced before writing; storage contains only generated fictional run output and simulation metadata. Real adapter/configuration never accesses this wrapper. Restored active snapshots remain frozen and are labeled interrupted; status enums are preserved. This storage is not authentication, durable history, or a source of real research results.
