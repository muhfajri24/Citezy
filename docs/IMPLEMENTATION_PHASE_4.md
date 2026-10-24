# Phase 4 — Living Research Workbench

Status: implemented on `feat/frontend`, using the existing mock transport. The user subsequently authorized commit and push only; Phase 4 must not be merged yet. No backend, wire-contract, dependencies or secret configuration changes.

## Git prerequisite

Phase 3 commit `9062d67` was already pushed. PR [#22](https://github.com/muhfajri24/Citezy/pull/22) was created and merged into `dev` on 24 October 2026 at 07:24:59 UTC, merge commit `24e3d29`. GitHub reported CLEAN/MERGEABLE and no remote checks were configured. The preceding local lint, typecheck, 94 tests and build passed. `main` was not changed. The working `feat/frontend` branch was fast-forwarded to the merge commit before implementation. Existing local changes to `next-env.d.ts` and `package-lock.json` were preserved outside the Phase 3 commit and remain local.

## Scope and navigation audit

The supplied Phase 4 attachment explicitly adds functional report, source, evidence and comparison views, overlapping the older Phase 5–6 checklist. This implements those requested mock interactions; it does not imply live backend integration or final Phase 5–7 sign-off. Existing route `/research/[id]` is reused. Tabs use React state, not URL routing; switching tabs does not create browser-history entries. Search, filters, selected IDs and comparison sorting survive tab changes while the workspace is mounted.

| Element | Action and data | Active/loading/empty/error behavior |
|---|---|---|
| Landing brand / footer brand | Home `/` | Real Next Link |
| Start researching / hero CTA | Research textarea anchor | Visible focus and hover; submit lock |
| See how it works / header link | Existing storytelling section | Existing keyboard stage controls |
| Examples / submit | Fill question; adapter POST; route to run | Validation, pending feedback, safe errors; lock resets on re-entry |
| GitHub links | Actual repository URL | New-tab disclosure and safe rel |
| Workspace brand / New research | Home / research input | Form can submit again after return |
| Six workspace tabs | Distinct content and page heading | Selected indicator, roving Tab, arrows/Home/End, content transition |
| Overview counts / summary / progress | Sources / Evidence / Report / Activity | Counts derived from returned run, not invented |
| Report claim / citation | Select claim / open evidence dialog by IDs | Selected highlight; missing references shown honestly |
| Source search / access filter / selection | Filter typed metadata; inspect source | Search empty state; selected source and metadata retained |
| Source original link / related claim | Safe HTTP(S) URL / Evidence tab | Unsafe URLs rendered unavailable; safe evidence resolution |
| Evidence status / claim / previous-next | Filter and inspect linked records | All three exact support states; boundary buttons disabled |
| Comparison sort / detail / linked claim | Structured rows, method/dataset sorting, native disclosure, Evidence tab | Null → Not reported; empty state; caution visible; scrollable table |
| Activity disclosures / refresh | Returned step statuses/details and GET | Bounded retry, skeleton, terminal stop, safe error/recovery |
| Citation inspector | Native modal dialog | Close/Escape, focus return, explicit Tab wrap; scrollable mobile panel |

No sidebar or dropdown navigation existed to repair. No fake history, export, cancellation, authentication or unavailable feature button was added. The old submission receipt component is retained as historical code but is no longer routed to.

## Implementation

- `frontend/src/components/research/workspace.tsx`: six-tab shell, shared selection/filter state, accessible navigation and citation modal.
- `frontend/src/components/research/views.tsx`: Overview, Report, Activity, evidence inspector, safe source link and empty-state views.
- `frontend/src/hooks/use-research-run.ts`: effect lifecycle and document visibility subscription.
- `frontend/src/lib/research/poller.ts`: one automatic GET at a time; 2-second visible/active polling; AbortController cancellation; terminal/unmount stop; 2/4/8-second transient retries, maximum three retries; explicit manual refresh never retries POST.
- `frontend/src/lib/research/workspace-model.ts`: typed navigation and data helpers; safe URL and relationship handling.
- `frontend/src/app/research/[id]/page.tsx`: render workspace instead of receipt.
- `frontend/src/app/globals.css`: light editorial layout, responsive tabs/table/dialog, purposeful 160–180ms transitions; existing reduced-motion rule applies.
- Landing submission controller/input: reset preserved form lock when reactivated; regression test added. Features copy now describes the available demo workspace.
- Tests: poller lifecycle, workspace data/navigation, server-rendered views, submission regression; existing suites preserved.

## Verification actually executed

- `npm.cmd --prefix frontend run lint`: PASS.
- `npm.cmd --prefix frontend run typecheck`: PASS.
- `npm.cmd --prefix frontend run test`: PASS, **121 tests / 6 files**.
- `npm.cmd --prefix frontend run build`: PASS; `/` static and `/research/[id]` dynamic.
- `git diff --check`: PASS.

On Windows, build used a temporary production-types reference in `next-env.d.ts`, then restored its exact pre-build bytes. No dependency changes were needed. The pre-existing package lock change remains untouched.

Automated tests cover each mock terminal outcome, real mock stage advancement, terminal stop, visibility pause/resume, pending request abort, late-result suppression, non-overlap, bounded retry, 404 recovery/manual refresh, safe links, counts, filtering, ambiguous relationships, tab key navigation, selected excerpt/report rendering, missing evidence, failed-stage rendering and preserved-form reset. These are Node Vitest tests; browser clicks are separately verified below, not represented as DOM-unit-test coverage.

## Browser checks actually executed

Development browser: all six tabs clicked with assertions on heading/selected state and matching panel; Overview Sources quick action; Sources search → select Birch → Evidence with Birch excerpt; empty search; selected claim and support filter; previous/next boundary; report citation; comparison sort/disclosure; keyboard Home/arrows on mobile; Escape and focus return. Initial active-run Sources showed a truthful empty state until mock results arrived.

Widths tested: 320, 375, 768, 1280 px. Page scrollWidth equaled clientWidth (305, 360, 753, 1265 respectively). All six tabs remained available. Comparison overflow remained confined to its own region. Mobile inspector was scrollable and legible. Screenshots are in `docs/screenshots/phase-4-*.png`.

Chrome cross-check: dialog Tab wraps from original-source link to Close inspector; Escape restores citation focus; New research enables editing/submission again; Back restores an enabled landing form and Forward restores workspace. A prior locked-form issue was reproduced and fixed. IAB automation still sometimes reports BODY focus after the last dialog link; Chrome passes the same interaction. This cross-browser automation discrepancy remains recorded for further manual testing.

Production smoke test (`npm start`): reloading an in-memory demo run shows the missing-session state; New research creates a fresh run; Activity starts queued with waiting steps; completed Overview → Sources → selected source → Evidence also passed on the production build. No warnings/errors were captured in the exercised development IAB flow. Terminal outcomes and transient transport errors are covered by injected-adapter tests, not a public production backend test.

Not run: screen reader audit, actual OS reduced-motion toggling, Lighthouse, public deployment or real API calls. Reduced-motion code is present and reviewed. These checks do not establish live research correctness.

## Try it

1. From the repo: `npm.cmd --prefix frontend run dev`, with `NEXT_PUBLIC_DATA_MODE=mock`.
2. Open `http://localhost:3000`, choose an example and submit. Open Activity; the mock adapter reaches terminal status after approximately 12 seconds while visible.
3. Overview → Sources count → choose a source → related claim → Evidence. Select another claim or support filter and inspect its exact fictional excerpt.
4. Research Report → citation → inspector; use Tab/Shift+Tab, Escape and confirm focus returns. Comparison → sort and expand a method → inspect its claim.
5. At mobile width, scroll the tab bar and comparison table independently. Keyboard: Tab into selected workspace tab, arrows/Home/End to switch.
6. New research → edit and submit again. Reload a run to exercise missing-session recovery (mock runs are memory-only).

## Remaining boundaries

All sources, quotes and numbers are fictional and explicitly labeled DEMO ONLY. The workspace rejects non-mock mode before transport; real integration awaits Dev 1 schema/CORS/runtime approval. No report section structure beyond summary/claims exists in the contract; section links target those actual sections only. No persistent run history or reload persistence, export, SSE or server cancellation is implemented. Phase 4 is prepared for review on `feat/frontend`; merging requires a separate instruction.
