# Phase 3 - Living Research Interface

## Scope
Incremental enhancement of the existing Midnight Editorial landing on feat/frontend. The existing Phase 0-2 models, fixtures, adapters, backend and API contract remain unchanged. No full Phase 4-7 implementation, polling, actual research, commit, push, merge or staging operation was performed. Existing staged and unstaged work was preserved.

## Interactive components
- Hero: staggered 240ms opacity/transform headline entrance; bounded 14px pointer response with requestAnimationFrame coalescing. Fine mouse pointers only; touch/coarse pointers and reduced-motion preferences skip pointer animation. Event/media listeners and pending frames are cleaned up.
- HowItWorks: Question -> Search -> Read -> Verify -> Report. A native IntersectionObserver updates one sticky, typed DOM visualization from scroll position. The five buttons allow mouse/keyboard navigation. The walkthrough explicitly says scroll position is not AI progress.
- Mobile story: vertical content and compact sticky visual. In short viewports the panel becomes non-sticky. Tall visual content has keyboard-focusable native overflow rather than clipping. Stage buttons align with the same activation line as the observer.
- EvidencePreview: three fictional claim tabs with matching source, exact mock excerpt, assessment and explanation. Click selects by IDs through the existing safe resolver. Up/Down/Left/Right, Home/End and Tab work. Mobile pointer selection scrolls to evidence, with an instant alternative for reduced motion.
- Stable evidence layout: three overlapping intrinsic-size panes reserve the largest needed height. Inactive panes have visibility:hidden, aria-hidden and inert; only the active source link is accessible. Selection animates opacity/transform without changing the panel height.
- Existing research form: examples, validation, loading, duplicate prevention, safe errors and mock navigation are retained.
- Microinteractions: hover/press feedback, directional CTA arrow, focus-within input border, stage indicators, selected claim borders and brief panel transitions. No continuous scroll loop or fake AI processing.

## Data and architecture
New loadLandingPreview uses an isolated instance of the existing MockResearchApi with an injected deterministic clock and duration. It obtains a completed fictional run through startRun/getRun and validates it with the existing runtime parser. The server-rendered landing passes that data to the two interactive client sections, avoiding a loading waterfall and initial layout shift. It does not consume the user's submission adapter/run IDs or silently replace a real request with mock results. All studies, excerpts, numbers and comparisons are explicitly DEMO ONLY, with example.org URLs.

No libraries or dependencies were added. CSS transitions, IntersectionObserver, matchMedia and requestAnimationFrame cover the small set of interactions without Motion for React. The full research route still contains only the existing mock submission receipt.

## Files in this enhancement
Created:
- frontend/src/components/landing/evidence-preview.tsx
- frontend/src/lib/api/landing-preview.ts
- frontend/src/lib/landing/interaction-model.ts
- frontend/src/lib/landing/interaction-model.test.ts
- docs/IMPLEMENTATION_PHASE_3_LIVING.md
- docs/screenshots/living-hero.png
- docs/screenshots/living-story-desktop.png
- docs/screenshots/living-story-mobile.png
- docs/screenshots/living-evidence-desktop.png

Changed:
- frontend/src/components/landing/hero.tsx
- frontend/src/components/landing/how-it-works.tsx
- frontend/src/components/landing/features.tsx (clarify demo versus planned workspace)
- frontend/src/app/page.tsx
- frontend/src/app/globals.css
- frontend/README.md
- docs/IMPLEMENTATION_PHASE_3.md (link this incremental record)

## Verification actually executed
From frontend/:
- npm.cmd run lint: PASS, no warnings.
- npm.cmd run typecheck: PASS.
- npm.cmd test: PASS, 94 tests in 3 files, including 25 new interaction/model cases.
- npm.cmd run build: PASS; static landing and existing dynamic research receipt.
- npm.cmd run dev and npm.cmd start: both ran successfully for browser QA.
- git diff --check: PASS.

Tests cover deterministic isolated mock data/no fetch, all three ID-linked assessments, identical claim text, missing/duplicate/mismatched/restricted evidence, scroll activation boundaries, matching desktop/mobile manual-navigation offsets, pointer bounds and zero-sized geometry. All 69 existing tests still pass.

## Browser QA performed
Development and production IAB plus a Chrome navigation cross-check:
- Mouse movement updated bounded hero CSS variables; headline animation was present.
- Actual wheel scroll changed Search -> Read -> Verify while the desktop panel stayed at top:45px.
- All five stage buttons changed the correct content; keyboard Enter worked.
- A mobile stage-jump mismatch was found, corrected by aligning scroll and observer activation lines, and covered by new regression tests.
- Claim clicks and ArrowDown/Home/Tab updated the excerpt/source/status and moved focus correctly; focus outline was visible.
- All three claim selections retained the same measured mobile panel height (599.3px at the tested width). Inactive panes had inert and aria-hidden; only one source link was exposed inside the active tabpanel.
- Narrow mobile story content that exceeded the fixed visual area remained scrollable; the focused Search visual responded to End. All stages remain reachable. Reduced-height layouts have a non-sticky fallback.
- No horizontal document overflow at widths 320/375/768/1024/1280. Measured clientWidth/scrollWidth: 305/305, 360/360, 753/753, 1009/1009, 1265/1265.
- Existing empty-question validation, example fill, Ctrl+Enter, loading/navigation and the correct submitted question were verified. Production mock submission reached /research/demo-1 with no live processing claim.
- No console errors or warnings in the exercised flows. Chrome Back returned to an enabled input after submission.
- One IAB automated Back action displayed stale receipt content after the URL changed; reload recovered. The cause is not established; the independent Chrome Back check passed. This is recorded as an environment/navigation observation, not claimed fixed.
- Production screenshots saved. Temporary viewport overrides reset.

Reduced-motion CSS and pointer guards were reviewed, but OS preference emulation, full screen-reader testing, actual 200% browser zoom and Lighthouse/Web Vitals measurement were not performed. No performance score or deployed/live integration result is claimed.

## Work preservation
The initial working tree already contained staged and unstaged Phase 3 changes. No index changes were made. package.json and package-lock.json were not edited. next-env.d.ts was temporarily aligned with production generated-type paths for the build (the known Windows EPERM issue), then restored to its exact starting bytes. All three files were compared byte-for-byte with their pre-task backups. main/dev refs and backend remain untouched.

## Try it
From frontend/, keep NEXT_PUBLIC_DATA_MODE=mock and run npm.cmd run dev. Open http://localhost:3000.
1. Move the mouse over the hero and use its CTAs/examples.
2. Scroll How Citezy works or select Question/Search/Read/Verify/Report.
3. In the evidence preview, select Cedar/Birch/Maple claims; compare the excerpt and support label. Try arrows, Home/End and Tab.
4. On mobile, select a claim to move to its evidence. Scroll the vertical story; focus the visual to scroll unusually tall content with the keyboard.
5. Submit a focused 10-500-character demo question and inspect the existing receipt.

## Readiness
Ready for frontend review and Phase 4 implementation. The preview demonstrates the interaction model only; real pipeline events, resource-safe polling, full report/workbench, method comparison, backend approval and live integration remain future work. The provisional question limits still require Dev 1 agreement. No API contract fields or endpoints changed.
