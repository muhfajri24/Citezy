# Phase 3 - Premium Landing Page

Implemented locally on feat/frontend. No commit, push, merge, backend implementation or Phase 4 work was performed.

## Scope and design
Midnight Editorial landing: dark surfaces, restrained lime accents, editorial sans/serif display typography, original CSS/SVG evidence illustration and responsive layout. Existing semantic tokens, Button, Textarea, Badge and Card are reused. The hero uses the requested headline and Meet Citezy subheadline. Navigation and hero CTAs target the question or How it works section; real repository links open safely in new tabs. Four mechanism steps, three product-direction features and an AI-review disclaimer complete the page. The illustration and future capabilities are explicitly described as illustrative/planned, not real research output.

## Files created
- frontend/src/components/landing/brand.tsx
- frontend/src/components/landing/icons.tsx
- frontend/src/components/landing/navigation.tsx
- frontend/src/components/landing/hero.tsx
- frontend/src/components/landing/research-input.tsx
- frontend/src/components/landing/how-it-works.tsx
- frontend/src/components/landing/features.tsx
- frontend/src/components/landing/footer.tsx
- frontend/src/components/landing/submission-receipt.tsx
- frontend/src/app/research/[id]/page.tsx
- frontend/src/lib/api/demo-client.ts
- frontend/src/lib/landing/research-submission.ts
- frontend/src/lib/landing/research-submission.test.ts
- docs/IMPLEMENTATION_PHASE_3.md
- docs/screenshots/phase-3-landing-preview.png
- docs/screenshots/phase-3-landing-desktop.png
- docs/screenshots/phase-3-landing-mobile.png

Next.js also generated frontend/AGENTS.md during next dev. Its local framework-documentation instructions were read and relevant installed Next.js page/router/link guides checked. No dependencies were added.

## Files changed
- frontend/src/app/page.tsx: replace Phase 1 preview with composed landing sections.
- frontend/src/app/globals.css: scoped landing and receipt styles; retain existing light workbench tokens.
- frontend/src/components/ui/index.tsx: allow React 19 textarea ref forwarding through typed ComponentPropsWithRef for focus/error recovery.
- frontend/README.md: update run/test/mode instructions and Phase 3 limits.
- docs/API_HANDOFF.md: record provisional demo validation and mock-only boundary.

## Submission behavior
The form trims questions and validates 10-500 characters. These are provisional frontend demo limits, not an approved backend contract. Three valid CS/ML examples fill the textarea. Ctrl/Cmd+Enter also submits. A controller locks duplicate requests throughout submission/navigation; fields/examples/button disable while loading. Validation errors focus the textarea. Unexpected errors use safe fixed copy and release the lock for explicit retry without discarding the question.

The mock-only guard uses the shared Phase 2 ResearchApi factory. It rejects real/invalid mode before any backend call, instead of silently replacing real data with mock results. StartRun creates a mock run then navigates to /research/{id}.

The new route is a minimal submission receipt, not a Phase 4 workbench. It performs a one-time lookup in the existing in-memory mock adapter, displays the question and honest demo notice, and offers a return link. No polling, pipeline timeline, report or evidence inspector exists. Reloading loses in-memory requests and displays an unavailable-session recovery message. No persistence or real AI/search integration was added.

## Verification actually executed
From frontend/ with npm.cmd (PowerShell blocks npm.ps1):
- npm.cmd run lint: PASS, no warnings.
- npm.cmd run typecheck: PASS.
- npm.cmd test: PASS, 69 tests / 2 files (50 existing + 19 Phase 3 cases).
- npm.cmd run build: PASS; / is static and /research/[id] is dynamic.
- npm.cmd run dev -- --hostname 127.0.0.1: PASS for development browser QA.
- npm.cmd start -- --hostname 127.0.0.1: PASS; production HTTP / returned 200 and production browser submission succeeded.
- git diff --check: PASS.

New tests exercise blank/short/long input, boundary lengths, trimming, valid examples, no invalid submissions, URL-safe navigation, duplicate lock before and after start, explicit retry, sanitized errors, configuration/navigation failures, shared mock instance and forbidden real/invalid modes without fetch calls.

## Browser checks
IAB browser, actual rendered page and production preview:
- Nav CTA focuses the labeled textarea; all three example buttons populate it.
- Blank input shows an inline error; 501 characters show the limit error.
- Loading state disables fields, examples and submit while routing.
- Button and Ctrl+Enter submission reach /research/demo-1 and show the correct question.
- Reload of the mock receipt shows honest unavailable-session copy; recovery link returns to landing.
- Browser Back restores an enabled form.
- See how it works works through keyboard Enter. Production skip link moves actual focus to main.
- No console errors or warnings in the exercised flows.
- Responsive checks: widths 375, 768, 1024, 1280. Document scrollWidth/clientWidth were 360/360, 753/753, 1009/1009, 1265/1265 respectively in the development browser. No horizontal page overflow. A tablet illustration overflow was found and fixed before the final measurements. Mobile/tablet layout prioritizes the research input; decorative illustration is desktop only.
- Production desktop/mobile screenshots saved and desktop full-page layout visually inspected.

Actual 200% browser zoom, screen-reader interaction and reduced-motion emulation were not tested. Reduced-motion CSS is implemented. Browser-only server-failure injection was not performed; safe API failure and explicit retry are tested in the submission controller. Real backend or public deployment is not verified.

## Preserved pre-existing work and environment notes
At start, frontend/next-env.d.ts and frontend/package-lock.json had uncommitted local changes. Neither was replaced with HEAD or reset. Their exact starting bytes were backed up outside the repository. The lockfile was never edited or dependencies installed.

Two initial production build attempts compiled but failed with EPERM when Next.js tried to update next-env.d.ts from dev-type paths to production-type paths. Only this generated file was temporarily aligned with production references before building; successful production builds followed. Its exact original local bytes were restored afterward, and both files were verified against their original SHA256 hashes:
- next-env.d.ts: b8b3a344484b959af5e4e3fc1a1609dac3cb9ece0cdeb6c145be29bc4c491000
- package-lock.json: f4b0df7d465686a6346ea7ad98a8ce2501ba1179bca26f13df8fd01b1947df05

Git warns about the inaccessible user-global ignore file; repository-local status/diff checks work. Temporary browser viewport overrides were reset. No external issue/PR status updates were made during implementation.

## Run and review
From frontend/: copy .env.example to .env.local only if needed, retain NEXT_PUBLIC_DATA_MODE=mock, then npm.cmd run dev. Open http://localhost:3000. Choose an example, submit and inspect the receipt. Use the four verification commands above. Run the production build with npm.cmd start after a successful npm.cmd run build.

## Remaining decisions and Phase 4 readiness
Phase 3 is ready for local review in mock mode. Dev 1 must still approve real-mode input limits and public API contract. Phase 4 should replace/extend the receipt with the light workbench, truthful status timeline and resource-safe polling. Phase 4 has not been implemented. Landing feature descriptions do not claim those future views are available today.

## Living-interface follow-up
This record describes the initial premium landing. The subsequent pointer-reactive hero, five-stage scroll storytelling and interactive fictional evidence preview are documented in [IMPLEMENTATION_PHASE_3_LIVING.md](IMPLEMENTATION_PHASE_3_LIVING.md). The API contract and full research-route scope remain unchanged.
