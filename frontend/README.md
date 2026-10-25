# Citezy frontend

Phase 0-4 frontend with a Midnight Editorial landing and functional mock research workbench. No backend or live AI calls.

Requires Node.js 20.9+ and npm. From frontend/: `npm ci`, copy `.env.example` to `.env.local`, then `npm run dev`. On PowerShell with script restrictions use `npm.cmd`. Open http://localhost:3000.

Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Serve the production build with `npm start`.

Use mock mode for fictional deterministic simulation. Real mode requires NEXT_PUBLIC_API_BASE_URL and a separately running FastAPI backend, never falls back to mock, and needs backend CORS. Public env values must not include secrets. No deployment or live integration has been verified. See ../docs/API_HANDOFF.md for pending decisions.

Typography uses local Inter/Segoe UI/system fallback, with no external font downloads. Phase 4 includes a native evidence dialog and visibility-aware polling with cancellation.

## Data client usage

Import `getResearchApi` from `@/lib/api/factory` in future client UI. It selects one shared adapter. `startRun({ question })` returns the ID; `getRun(id, signal?)` returns typed data. All UI must use the adapter rather than import fixtures. Inject `now`, `stageDurationMs`, and `outcome` into `MockResearchApi` to test deterministic progress and completed/partial/failed/cancelled cases. A demo run reaches its terminal outcome after six 2-second intervals.

Use `inspectIntegrity(run)` for reference diagnostics and `resolveEvidence(run, claimId, evidenceId)` before showing an excerpt. An unavailable result must be rendered honestly. All mock sources, numbers and quotations are fictional. Future UI using them must visibly say Demo / simulated data.

External error messages are fixed by the HTTP client. Do not render arbitrary run error text as HTML. Real responses are validated against the provisional FE schema; changes require Dev 1 agreement. No automatic transport retries are performed. The Phase 4 GET poller owns bounded backoff, visibility/terminal handling and AbortSignal cleanup. POST retries risk duplicate runs.

Verification and remaining integration decisions: [Phase 0-2 record](../docs/IMPLEMENTATION_PHASE_0_2.md).

## Phase 3 landing preview

Keep `NEXT_PUBLIC_DATA_MODE=mock` for this phase. The landing uses the Phase 2 shared adapter through a mock-only guard; real or invalid mode is rejected before any backend request. The real adapter remains available for future integration and never silently falls back to mock.

Open `/`, choose an example or enter a focused question, and submit. Ctrl/Cmd+Enter also submits. The current demo-only limit is 10-500 trimmed characters; final backend limits still require Dev 1 approval. Submission is locked until navigation, and an error permits explicit retry without clearing the question.

A successful mock start navigates to `/research/{id}`. Phase 4 replaces the original receipt with six functional tabs: Overview, Research Report, Sources, Evidence, Comparison and Activity. The adapter simulates progress and produces fictional linked results. Requests live in memory and become unavailable after reload; the workspace shows a recovery message.

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` from frontend/. The suite includes submission validation, duplicate prevention, retry, navigation and mock-only mode checks. See ../docs/IMPLEMENTATION_PHASE_3.md for browser checks, screenshots and known limits.

## Living Research Interface

Phase 3 now includes a pointer-reactive hero, a five-stage scroll-controlled explainer and an interactive fictional evidence preview. Scroll position illustrates Question/Search/Read/Verify/Report; it does not represent AI progress. Select a claim to inspect its linked mock source and excerpt. Arrow keys, Home/End and Tab are supported. The preview uses an isolated deterministic MockResearchApi run; user submission remains separate. Reduced-motion CSS and pointer guards are included. No new libraries were added.

See [interactive implementation and QA record](../docs/IMPLEMENTATION_PHASE_3_LIVING.md) for exact files, checks, screenshots and limitations.

## Phase 4 workspace

Use mock mode, submit a question, and follow adapter status in Activity (about 12 seconds to complete). Overview counts open Sources/Evidence; source detail links select matching evidence; report citations open an accessible inspector. Comparison supports sorting and expandable method details. Arrow keys/Home/End navigate workspace tabs; filters and selections persist across tabs. New research returns to an enabled form. No new libraries were added.

See [Phase 4 implementation and manual QA](../docs/IMPLEMENTATION_PHASE_4.md), including the navigation audit, test results, screenshots, known browser-automation limitation and remaining live-integration requirements. Phase 4 is prepared for review on `feat/frontend`; no Phase 4 merge is authorized.

## Phase 4.5 - visual dan interaksi

Landing kini memiliki komposisi editorial baru dan Evidence Constellation interaktif. Pilih node untuk menelusuri Question -> Claim -> Excerpt -> Source; pada mobile graph menjadi grid tombol. Workspace memiliki sidebar collapse/expand, drawer navigasi mobile dan kontrol tutup/buka panel evidence. Klik klaim laporan dapat membuka inspector melalui ID evidence yang tersedia. Semua data tetap DEMO ONLY; adapter dan kontrak API tidak berubah, tanpa dependency baru.

Lihat [laporan Phase 4.5](../docs/IMPLEMENTATION_PHASE_4_5.md) untuk audit, file, cara mencoba, hasil pengujian, screenshot dan batasan. Implementasi disiapkan untuk review pada feat/frontend; merge membutuhkan instruksi terpisah.
## Phase 4.6 - Living Interface 2.0

Motion disatukan dengan token 140/220/360ms, hero berinterpolasi dengan beberapa layer, progres scroll narasi, reveal jalur graph, indikator tab bergerak, FLIP sidebar, transisi dialog/drawer dan panel evidence dengan tinggi tetap. Input menandai contoh terpilih; Source Explorer mengumumkan jumlah hasil; Activity menghitung progress dari step adapter, bukan confidence atau progress buatan.

Fallback route memakai loading.tsx Next.js asli. Semua data tetap DEMO ONLY. Tidak ada library baru, backend atau kontrak API yang diubah. Lihat [laporan Phase 4.6](../docs/IMPLEMENTATION_PHASE_4_6.md) untuk file, pengujian, batasan dan cara mencoba. Implementasi Phase 4.6 siap direview pada feat/frontend; merge memerlukan instruksi terpisah.