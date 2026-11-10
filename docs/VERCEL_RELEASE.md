# Vercel deployment follow-up — 10 November 2026

## Available URLs

| URL | Actual behavior |
| --- | --- |
| https://citezy.vercel.app/ | Production frontend, real transport mode. Backend URL is not configured; shows setup/unavailable explanation and disables research submit. No live AI claim. |
| https://citezy-1fak6nvjr-itzfajri4-9425.vercel.app/ | Explicitly fictional UI demo. Mock stages/results; no provider calls. Public no-login browser flow verified. |

Vercel project: `citezy` (`prj_3KtnkbxCQGvNVJgpeAkDP18HQHDH`), owner team `team_seSNrca15BYbKbFst4znogTa`, Node 22, root `frontend`. No paid feature/plan upgrade was activated. Project Git linking returned “add a Login Connection to your GitHub account first.” Deployment therefore used tracked frontend source files through Vercel's API; no provider secrets or local environment files were uploaded. Source remains versioned in PR #25. Automatic GitHub deployment is not configured.

## Build/source evidence

- Initial demo deployment `dpl_BVzSq6GNXBFJQW5isGxMvCfR2xB4`: READY, source baseline `32bd847d9b816e113400ccd8e9dbd375a7318a17`.
- Production availability update `dpl_2ckjmsx9B8a2SYYsVrsVdtATmqTE`: READY, source `928ace9bcb96e3f74e8326d75a18e3bcda51bf65`.
- Availability change: before, submit exposed a technical API-configuration error. Now, production explains the unavailable service before submission and disables Start Research. A missing-run sidebar status was also corrected from Opening session to Unavailable in the follow-up source.
- Local checks after availability change: lint/typecheck, 253 tests and production build pass. Backend is unchanged from the 32-test integrity suite.

Deployment verification is separate from real-research acceptance. Real keys/model ID, backend HTTPS origin and live report quality remain Dev 1 tasks.

## Browser checks actually observed

On the public fictional UI demo in a fresh cloud-browser tab:

- Home loads without account sign-in and prominently states DEMO ONLY.
- Empty submit gives a useful validation message and returns focus to the input.
- Example selection fills the question; submit navigates to the generated run route.
- Mock returned reading/synthesizing/completed stages appear, not a live-inference claim.
- Evidence ledger retains supported/partial/unsupported labels. Maple's unrelated excerpt remains unsupported; Birch's partial excerpt maps to its correct source.
- Report citation opens the correct inspector. Escape closes it and restores focus to the citation button (aria-label Inspect evidence e2 for claim c2).
- ArrowRight on Comparison tab moves selection/focus to Activity.
- Markdown and CSV buttons both produced browser download events. Content integrity/formula-safety is covered separately by unit tests; the downloaded files were not reread during this browser check.
- Terminal reload restores the explicitly fictional snapshot, redacts the original question and preserves completed status.
- Unknown run shows an unavailable state and New research/Refresh recovery, not an invented report.
- Desktop viewport: innerWidth 1363; document clientWidth and scrollWidth both 1348. No horizontal page overflow in the comparison view.
- Sampled rendered comparison text colors: main rgb(23,23,28), muted rgb(89,89,99), warning rgb(113,70,0). This is an observation, not a complete contrast/accessibility audit.
- Captured console errors were from the browser's chrome-extension metadata bridge. No application error was identified in those captured entries; this is not a claim that every possible browser error path passed.

Production was separately opened in the browser at the stable URL and verified to display the setup-pending explanation and disabled submit without displaying fictional findings.

## Not verified / remaining gates

No real Nemotron/Tavily inference, backend CORS enforcement, mobile viewport suite, 200% zoom, OS reduced-motion toggle, screen reader, full contrast audit, performance benchmark or real demo recording is claimed. Zoom keyboard attempts did not change innerWidth/devicePixelRatio, so that check is pending rather than passed. Desktop fictional-demo QA does not prove live research correctness.

## Dev 1 next action

Use the existing frontend origin `https://citezy.vercel.app` in the backend CORS configuration. Provide the real HTTPS backend origin plus sanitized Nemotron/Tavily runtime evidence in #26. Then set production `NEXT_PUBLIC_API_BASE_URL` to that origin and rebuild; real mode is already selected. Resume deployed live end-to-end and remaining accessibility/device checks before declaring #18/#19 complete.
