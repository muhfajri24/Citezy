# Dev 2 release report — 10 November 2026

> **Vercel follow-up, 10 November 2026:** Vercel workspace access is now granted; production frontend and explicit UI demo are deployed. Desktop browser flow, inspector, recovery and downloads were verified on the fictional demo. Production now disables submit and explains unavailability until a backend URL is configured. C3, live end-to-end acceptance, mobile/zoom/assistive-technology checks and authentic live footage remain pending. See [VERCEL_RELEASE.md](VERCEL_RELEASE.md). Earlier unavailable-hosting/browser statements below describe the initial pass.


Owner: Dev 2 (`muhfajri24`). Source baseline: `feat/frontend` aa2c7bc; implementation branch: `fix/citezy-live-evidence`; PR target: `dev`. `main` is unchanged.

## Outcome

Frontend implementation and the authorized C2/C7 integrity fixes are complete as a review candidate. **Dev 2's full release Definition of Done is not yet satisfied**: C3 runtime access, public hosting, reachable-browser QA and authentic live footage are blocked. Do not close #17–#20 as Done or describe the application as deployed/live-ready.

## Completed implementation

- C2: removed Tavily example.org fallback, Nemotron auto-supported fallback and fallback planner. Missing configuration, vendor errors and malformed outputs have safe error codes.
- C7: replaced hardcoded benchmark rows with typed claim extraction plus deterministic synthesis. Claims reference exact/whitespace-normalized excerpts; only supported claims enter substantive summary findings and comparison rows. Each comparison field must be present in the same excerpt; result requires dataset, metric and units. Unsupported candidates remain auditable, absent excerpts are rejected, missing fields stay null, cross-source conditions are qualified.
- Necessary pipeline support: query all returned subquestions, deduplicate URLs, use retrieved raw source text rather than search snippets, enforce the configured total timeout, record failed stages and preserve prior supported findings on later failure.
- Quote semantics: case changes no longer count as verbatim; normalized matches have null original offset.
- Frontend: safe allowlisted pipeline failure explanations, caller cancellation/stale-navigation protection for abandoned submissions, bounded Retry-After polling, HTTPS/mixed-content configuration rejection, Markdown and CSV exports retaining mode/status/limits; CSV formula injection protection.
- Release preparation: corrected root/frontend/backend READMEs, MIT license, CI workflow, standalone output and frontend Dockerfile, deployment/browser/demo runbook, sanitized runtime checker and reproducible production HTTP smoke script.

## Verification actually executed

| Check | Result | Scope |
| --- | --- | --- |
| Backend pytest | 32 passed | Includes simulated provider success/failure, invalid output, fake excerpt rejection, comparison grounding, prior-evidence partial recovery, timeout and sanitized exceptions |
| Frontend ESLint | PASS | Current source |
| Frontend strict typecheck | PASS | Current source |
| Frontend Vitest | 252 passed / 20 files | Contract, validation, polling, error mapping, cancellation, evidence, UI SSR, export |
| Next production build | PASS | Real-mode build using loopback backend URL for local smoke; not deployed |
| Production HTTP smoke | PASS / 10 checks | Actual Node and FastAPI child services, HTTP routes/CORS headers, real POST→failed poll with deliberately empty providers; no live AI |
| C3 checker | BLOCKED (exit 2) | NEBIUS_API_KEY, TAVILY_API_KEY, exact model ID absent; no provider calls made |
| Git diff whitespace check | PASS | No generated dependency/build output is committed |

Commands: `python -m pytest -q` in backend; `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` in frontend; backend-virtualenv `python scripts/smoke_local.py` from root. Sanitized JSON evidence is under `docs/evidence/`.

## Remaining Dev 2 acceptance gates

| Issue | Implementation evidence | Remaining gate |
| --- | --- | --- |
| #6 | Phase 2 fixes were included in merged PR #22 | Tracker reconciliation only |
| #14 | Landing/examples/submission, 3–1000-codepoint validation, duplicate lock, cancellation; prior PR #22 | Final contract sign-off remains shared #2 |
| #15 | Six tabs, truthful status, visibility/terminal cleanup, bounded backoff, safe failures; prior PR #23 + current tests | Implemented; new changes await PR review |
| #16 | Evidence inspector, ID integrity, safe links, support labels, focus helpers; current regression tests + historical Phase 5/6 browser records | Implemented; new release browser regression still part of #19 |
| #17 | JSON comparison, missing data, safe sources and responsive CSS implemented | New release 200% zoom, contrast, OS reduced motion, screen-reader and responsive browser acceptance not executed |
| #18 | Phase 7A contract adaptation and current HTTP/adapter checks implemented | Real model/search credentials, Dev 1 sign-off, live report/browser end-to-end |
| #19 | Tests/build/HTTP smoke/docs/license/deployment package complete | Vercel connection, actual HTTPS backend/URL, incognito smoke, screenshots/video |
| #20 | README/license/runbook/demo storyboard prepared | Public live demo, current rule check, final video/portal evidence |
| #21 | Markdown/CSV implementation complete and tested | Browser download acceptance pending; SSE optional/deferred, polling supported |

## Concrete environmental limits

1. GitHub access is confirmed. Provider keys/model selection and hosting-account access are separate; no credentials were available in this workspace. No paid service was provisioned.
2. Browser attempt to open `http://localhost:3000` returned `net::ERR_CONNECTION_REFUSED`. Shell commands use isolated network namespaces, so a server retained by one command is not reachable by the browser/another shell. Running both services and HTTP checks inside one owned smoke process succeeded. That does **not** substitute for browser QA.
3. Vercel was discovered but not connected during this work. A connection was offered. The repository retains Next.js/FastAPI; no unrelated hosting architecture migration was made.
4. Docker was not installed; standalone Node production was smoke-tested, the Docker image was not execution-tested. No new screenshots, screen-reader results, performance score, recording or public deployment is invented.
5. Historical phase reports are kept as evidence of their respective snapshots. Their old test counts and mock-only descriptions are superseded by this report, not silently rewritten as current live proof.

## Next step

Dev 1 follows [DEV1_HANDOFF.md](DEV1_HANDOFF.md), beginning with real provider access, then production controls/deployment. Once the backend URL and credentials are available, resume Dev 2's deployed-browser checklist in [DEPLOYMENT.md](DEPLOYMENT.md). Source review completion is distinct from full release acceptance.
