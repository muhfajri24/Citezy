# Dev 1 handoff — finish the live backend and unblock release

> **Vercel follow-up, 10 November 2026:** Vercel workspace access is now granted; production frontend and explicit UI demo are deployed. Desktop browser flow, inspector, recovery and downloads were verified on the fictional demo. Production now disables submit and explains unavailability until a backend URL is configured. C3, live end-to-end acceptance, mobile/zoom/assistive-technology checks and authentic live footage remain pending. See [VERCEL_RELEASE.md](VERCEL_RELEASE.md). Earlier unavailable-hosting/browser statements below describe the initial pass.


To Dev 1: `tmuhammadsanubari-cell` (role mapping from repository tracker #1 / ownership records). From Dev 2: `muhfajri24`. Requested by repository owner, 10 November 2026. Review branch `fix/citezy-live-evidence`, based on frontend contract baseline aa2c7bc, PR target `dev`.

## Read first

C2/C7 are implemented for review; **C3 is blocked**, not complete. The previous backend could return fictional example.org sources on search failure, auto-promote support when inference failed, and return fixed 2.4x/2.3x comparison rows unrelated to the question. Those paths are removed. Do not restore them to make the demo look successful.

Current tests: 32 backend tests, 252 frontend tests, lint/typecheck/build and production HTTP smoke pass. Provider tests use simulated responses; the HTTP smoke deliberately leaves provider configuration empty and confirms a safe failed run. Neither proves real inference. See [release report](DEV2_RELEASE_REPORT.md).

## Ordered work packages

### D1-01 — Real runtime access (C3 / #7, blocking)

- Configure NEBIUS_API_KEY and TAVILY_API_KEY on the backend host privately, and select the exact available eligible Nemotron model ID from the Nebius account/catalog. Do not copy keys into chat, issues, README, browser build variables or commits.
- The old model ID and .ai endpoint were unverified. Base URL now defaults to `https://api.tokenfactory.nebius.com/v1`; set the account's documented regional endpoint if needed. No default model ID is guessed.
- From backend run `python -m scripts.check_runtime --live --output ../docs/evidence/runtime-check.json`. It exits 2 without configuration. With complete settings it performs bounded actual model/search calls. Confirm available free credits first; do not provision a paid subscription.
- Acceptance: replace the blocked record with actual sanitized evidence: model ID, result counts, readable real source URLs, execution timestamp and pass/fail. Follow with a full actual question→report run; a health 200, model_id string, mock or fixture is insufficient.

### D1-02 — Review source/claim/report quality (#9–#12)

- Inspect live raw source content, per-source candidate limits and the 16,000-character truncation. Improve relevance/full-text handling where the live sample shows a gap. All planned subquestions are now searched; sources are URL-deduplicated.
- Review typed extraction and support assessment, including the comparison fields. Fields must occur literally in the supporting excerpt, and result is omitted without dataset/metric/units. Do not relax missing evidence to a fabricated default.
- The numeric checker is a necessary string-presence check, not a full numeric-context verifier. Build representative wrong-unit/wrong-dataset/swapped-result/negation/injection tests and evaluate the model-assisted contextual decisions against manually reviewed labels.
- Add durable provenance: source content hash, query/provider request metadata, extraction/assessment timestamps and source access/truncation semantics, without logging keys or sensitive vendor bodies.
- Acceptance: demonstrate actual supported, partial/unsupported and insufficient-evidence outcomes. Every substantive finding and comparison field resolves to a retrieved excerpt. Save sanitized samples and evaluation limitations; no fabricated benchmark score.

### D1-03 — Durable run lifecycle (#8)

- MemoryRunStore currently loses all runs on restart and is process-local. Add an appropriate persistent store and retention/expiry policy, plus restart/interrupted-job recovery. Do not run multiple independent memory-store workers.
- Total execution timeout and safe stage failure/partial preservation are implemented. Review shutdown cancellation and outstanding task lifecycle; expose user cancellation only if jointly agreed with FE (no cancellation endpoint is currently promised).
- Acceptance: tests cover restart recovery, expiration→404, concurrent access, safe errors, queued→terminal lifecycle and preserved partial evidence. Document the exact retention/cancellation contract.

### D1-04 — Resource controls and backend deployment (#13)

- Add bounded active jobs, provider concurrency, per-client request protection and global credit/cost limits. Select limits that still permit legitimate no-login judge evaluation.
- Deploy the backend to an owner-controlled HTTPS host with configured private credentials. Set exact frontend CORS origins; test preflight AND actual browser enforcement. Liveness `/api/health` must not be presented as model readiness.
- Acceptance: actual backend URL/OpenAPI shared with Dev 2; rate/cost/concurrency and timeout behavior tested. No stack traces/vendor messages exposed to clients. Retention and multi-worker behavior documented.

### D1-05 — Joint contract sign-off (#2)

Keep existing routes and public fields unless coordinated. Confirm:

- POST 202, validation 400, GET 404; 3–1000 trimmed Unicode codepoints; UTC Z timestamps.
- Completed/partial/failed/cancelled semantics and which retain a report; every failed active stage gets status failed.
- Null source fields/URLs, unavailable/restricted sources and provenance mapping. Current FE still requires a safe HTTP(S) source URL; invalid URL payloads reject the run.
- Exact-match offsets point into original retrieved text; whitespace-normalized matches have null offsets.
- GET polling every two seconds, 10-second client timeout, at most three transient retries (2/4/8 seconds), Retry-After up to five minutes; POST never auto-retried and can be aborted on navigation.
- Durable retention/expiry, rate limits, CORS, guest access and production origins.

Acceptance: explicit Dev 1 review/sign-off with actual example payloads and deployment metadata, recorded in API_HANDOFF.md / issue #2. Dev 2 cannot impersonate that sign-off.

### D1-06 — Live handoff back to Dev 2 (#18–#20)

Provide:

1. HTTPS backend base URL, correct model ID and sanitized passing runtime record.
2. Completed/partial/failed run samples with genuine source URLs and excerpts; no example.org substitutes.
3. Exact production CORS origin and capacity/credit plan.
4. Contract review results and persistent-store/retention/error behavior.
5. A focused demo question that actually works, with known limitations.

Then Dev 2 completes Vercel deployment, incognito desktop/mobile/keyboard/200% zoom/reduced-motion/accessibility checks, authentic screenshots and real demo recording. Those gates remain open until performed. Existing mock screenshots and unit/HTTP tests are not a substitute.

## Existing issue mapping

Keep #7–#13 open until their own acceptance evidence exists. This PR implements substantial parts of #9–#12 but does not prove live quality or production readiness. #17–#20 remain pending/blocked for the deployment/browser/runtime gates. #21 export is implemented; SSE remains optional.

## Reproduction commands

```sh
# backend (activate its virtualenv first)
python -m pytest -q
python -m scripts.check_runtime --live --output ../docs/evidence/runtime-check.json

# frontend
npm ci
npm run lint
npm run typecheck
npm test
npm run build

# repository root, using backend's virtualenv Python
python scripts/smoke_local.py
```

Never label a blocked or simulated check PASS. Link the fix/review PR, actual test commands, sanitized outputs and deployment URL before closing each work package.
