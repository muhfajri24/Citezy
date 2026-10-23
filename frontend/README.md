# Citezy frontend

Phase 0-2 foundation only. No backend, AI calls, research submission or workbench yet.

Requires Node.js 20.9+ and npm. From frontend/: `npm ci`, copy `.env.example` to `.env.local`, then `npm run dev`. On PowerShell with script restrictions use `npm.cmd`. Open http://localhost:3000.

Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Serve the production build with `npm start`.

Use mock mode for fictional deterministic simulation. Real mode requires NEXT_PUBLIC_API_BASE_URL and a separately running FastAPI backend, never falls back to mock, and needs backend CORS. Public env values must not include secrets. No deployment or live integration has been verified. See ../docs/API_HANDOFF.md for pending decisions.

Typography uses local Inter/Segoe UI/system fallback, with no external font downloads. Native dialog is deferred until a later phase requires it. Polling UI/hook belongs to Phase 4; adapters support cancellation now.

## Data client usage

Import `getResearchApi` from `@/lib/api/factory` in future client UI. It selects one shared adapter. `startRun({ question })` returns the ID; `getRun(id, signal?)` returns typed data. All UI must use the adapter rather than import fixtures. Inject `now`, `stageDurationMs`, and `outcome` into `MockResearchApi` to test deterministic progress and completed/partial/failed/cancelled cases. A demo run reaches its terminal outcome after six 2-second intervals.

Use `inspectIntegrity(run)` for reference diagnostics and `resolveEvidence(run, claimId, evidenceId)` before showing an excerpt. An unavailable result must be rendered honestly. All mock sources, numbers and quotations are fictional. Future UI using them must visibly say Demo / simulated data.

External error messages are fixed by the HTTP client. Do not render arbitrary run error text as HTML. Real responses are validated against the provisional FE schema; changes require Dev 1 agreement. No automatic transport retries are performed. Future GET polling owns bounded backoff and visibility/terminal handling; it must pass AbortSignal and abort on cleanup. POST retries risk duplicate runs.

Verification and remaining integration decisions: [Phase 0-2 record](../docs/IMPLEMENTATION_PHASE_0_2.md).
