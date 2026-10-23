# CITEZY — FE.md · Dev 2 Implementation Playbook

> **Status:** Approved visual direction: **D — Midnight Editorial**. **Owner:** Developer 2 (Frontend & Product Lead). **Updated:** 24 October 2026 (WIB). **Target:** functional, integrated, publicly accessible hackathon frontend before internal submission on 29 October WIB.
>
> **Read first:** `docs/MASTER_SPEC.md` (Citezy Track 2 Master Spec v2.1). **Precedence:** official competition rules > Master Spec Parts A–F > this FE execution plan > historical Appendix A. Where this FE plan adds specifics not in the Master Spec, they are **implementation recommendations**, not organizer requirements. If requirements conflict, surface the conflict rather than silently changing scope.

## 0. Instructions for Codex (mandatory)

You are the frontend implementation agent for **Citezy**, an evidence-first AI research workbench, not a generic chatbot or citation generator. Read this entire file and `docs/MASTER_SPEC.md` before modifying code. Build in **small, testable phases** from the task checklist below. Do not mark a task complete without executing its acceptance test. Do not claim live research, verified facts, or live agent progress while using mock data.

**Workflow:** inspect repository → report existing files/constraints → implement one phase → run lint/typecheck/tests/build → report changed files, commands and results, remaining blockers → proceed to next phase. Ask the human only for genuinely blocking product or environment decisions. Do not invent credentials, API responses, benchmark results, source quotations, or successful deployments. If tooling or network is unavailable, record the exact limitation and provide local verification commands.

**Hard boundary:** frontend first with **mock transport**; backend implementation belongs to Dev 1. You may write API client contracts and a mock adapter, but do not create a pretend production backend. Keep frontend usable with `NEXT_PUBLIC_DATA_MODE=mock`; real mode must call the actual FastAPI server when it exists. No authentication, billing, admin, 3D, or complex animation in MVP. Do not add large dependencies without need.

## 1. Product, judging, and MVP priorities

- Product: **Citezy** (pronounced *sight-zee*). Brand line: **“Don't just cite it. Check it.”**
- Value proposition: research question → evidence-linked report and method comparison → click a claim to inspect source excerpt, explanation and support status.
- Track: Nebius x NVIDIA Global AI Hackathon 2026, **Track 2 — Best Apps and Agents**.
- Official-rule constraints from Master Spec: working application, real runtime eligible NVIDIA/Nemotron inference via Nebius Token Factory (or eligible Nebius AI Cloud deployment), public code and open-source license, public accessible demo, English submission, <3-minute public YouTube demo, free judge testing. **No official mandated FE–BE wire format.** Verify current official rules before final submission.
- Frontend alone does **not** satisfy the AI-runtime requirement. Mock mode is a development aid; final demo must use Dev 1's live pipeline and display honest state.
- Four equally weighted judging dimensions recorded in Master Spec: technological implementation, design, potential impact, idea quality. Prioritize showing **evidence traceability** in the first minute.

**P0 user flow:** open landing → enter question → submit → see truthful run stages → read summary/claims → select citation/claim → inspect linked evidence → view source-linked comparison table → open original source. Must work without login.

**P1 only after P0:** Markdown/CSV export, SSE (polling is default), extra motion/polish. Explicitly out of scope: auth, history dashboard, billing, PDF upload, multilingual UI, collaboration.

## 2. Locked design direction — D: Midnight Editorial

### 2.1 Visual identity

**Design concept:** *dark premium entry, light editorial research workspace, electric-lime accents used sparingly*. International Gen Z, not childish; credibility and long-form readability outrank neon effects. Reference mood: refined developer tooling × modern research publication; do not copy another brand's exact layout/assets.

| Token | Value | Usage |
|---|---|---|
| `--color-landing` | `#0B0B10` | landing background |
| `--color-landing-surface` | `#18181F` | landing panels |
| `--color-paper` | `#F8F8F5` | workbench background |
| `--color-surface` | `#FFFFFF` | workbench panels |
| `--color-ink` | `#17171C` | primary light-theme text |
| `--color-muted` | `#71717A` | secondary text (check contrast) |
| `--color-lime` | `#B8F36B` | primary CTA/accent, not long body text |
| `--color-violet` | `#8B7CF6` | secondary accent, selected state |
| `--color-border` | `#E5E5E0` | light dividers |
| `--color-success` | `#26734D` | supported label, paired with text |
| `--color-warning` | `#956000` | partially supported label |
| `--color-danger` | `#B42318` | unsupported/error label |

Use semantic CSS variables and Tailwind mapping. Contrast must be verified; adjust foreground combinations to reach **WCAG AA 4.5:1 for ordinary text**. Never communicate claim status using color alone. Light report view must remain legible at 100–200% zoom.

**Typography:** Geist Sans (or Inter fallback) for UI/body; optionally a licensed editorial serif such as Instrument Serif for **large display headings only**; Geist Mono for source IDs, timestamps and pipeline stage labels. Use `next/font` where feasible and respect license/availability. Avoid excessive weights and unlicensed assets.

**Composition:** generous whitespace, strong typographic hierarchy, subtle hairline borders, restrained radius (12–16px cards; pills for citation chips), precise column grid. No floating generic AI chat bubbles. Motion 120–250ms for panel and state transitions; honor `prefers-reduced-motion`. Avoid heavy gradients, glassmorphism, autoplay, and 3D.

### 2.2 Page specifications

**`/` — Midnight landing:**
- Header: Citezy wordmark, compact product description, GitHub link when real URL exists (hide placeholder otherwise).
- Hero: **“Don't just cite it. Check it.”**; subline **“An AI research workspace that shows the evidence behind each claim.”**
- Prominent, accessible research question textarea (not a chat window), clear **Start researching** button; validate length, disable during submission, keyboard support.
- Three realistic CS/ML example questions; click fills input (do not falsely imply results are live).
- Small 3-step mechanism illustration in HTML/CSS: *Find sources → Check claims → Inspect evidence*; avoid false trust metrics/testimonials.
- Explicit subtle **Demo data** indicator whenever mock mode is enabled.
- Responsive: mobile single-column, desktop centered content; no horizontal overflow.

**`/research/[id]` — Light editorial workbench:**
- Persistent compact top bar with Citezy brand, current question (truncate accessibly), *New research* action, mock/live indicator.
- Stage timeline: `queued → planning → searching → reading → verifying → synthesizing → completed`; terminal `partial`, `failed`, `cancelled`. Render actual statuses in real mode. In mock mode simulate delays and mark **Demo simulation** clearly. Never display fake “verified 100%”.
- Desktop 12-column layout: report ~8 columns, evidence inspector ~4; sticky inspector within viewport if practical. On mobile, inspector becomes accessible drawer/sheet with focus management and close button.
- Report: summary, claim cards/inline references, support badges, source list with accessible external links. Clicking a claim/citation selects its evidence by IDs, never by string matching.
- Evidence panel: exact excerpt **only when provided by backend**, source title/domain/URL, explanation, assessment, and caveat **“Source support is not independent fact-checking.”** Show unavailable/missing evidence honestly.
- Comparison table: method, dataset, metric, result/unit, limitations, source-linked claims, comparability warning. Allow horizontal scroll on narrow screens with visible affordance; unknown fields rendered as **Not reported**, not invented.
- Failure/partial states: actionable retry/new research, retained partial evidence when returned, human-readable error without leaking secrets.
- Sources not fetched/access-restricted must be clearly labeled; do not imply full-text review.

### 2.3 Accessibility and copy rules

- English UI for international judges. Semantic landmarks, associated input labels, visible keyboard focus, skip link, meaningful button names, accessible dialog/drawer focus and Escape close, table captions/headers, live-region status announcements without spamming.
- Supported badge: **Supported by excerpt**; partial: **Partially supported**; unsupported: **Unsupported**. Never use **Verified true**, **100% accurate**, or similar unsupported language.
- Mock UI always labeled **Demo / simulated data**; never use made-up quotes as if real papers. Use explicitly fictional mock sources with `example.org` URLs and `DEMO ONLY` labels.
- Empty, loading, partial, error, and completed states must all have deliberate designs.

## 3. Stack, folder structure, and ownership

**FE stack:** Next.js App Router, TypeScript strict, React, Tailwind CSS, ESLint; optional Vitest + React Testing Library for components, Playwright for browser smoke tests. Prefer native `fetch` and lightweight utilities. Do not require Redux, GraphQL, WebSocket or a UI kit unless justified.

```text
citezy/
├── docs/
│   ├── MASTER_SPEC.md
│   └── FE.md
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── globals.css
│   │   │   ├── page.tsx
│   │   │   └── research/[id]/page.tsx
│   │   ├── components/
│   │   │   ├── ui/                  # Button, Badge, Card, Dialog, Skeleton
│   │   │   ├── landing/             # Hero, ResearchInput, ExampleQuestions
│   │   │   └── research/            # StageTimeline, Report, Claim, EvidencePanel, ComparisonTable, Sources
│   │   ├── lib/
│   │   │   ├── api/                 # interface, real-client, mock-client, factory
│   │   │   ├── mock/                # fictional fixture and simulation
│   │   │   └── utils/
│   │   ├── types/                   # run, source, claim, comparison, error
│   │   └── hooks/                   # useResearchRun (polling lifecycle)
│   ├── public/                     # own/rights-cleared assets only
│   ├── .env.example
│   ├── package.json
│   └── README.md
└── backend/                        # owned by Dev 1; no FE implementation here
```

Adapt to an existing repo rather than overwriting files. Use one consistent import alias (e.g. `@/*`). FE owns pages, component design, data client, tests, frontend deployment, screenshot and demo capture support. Dev 1 owns FastAPI, inference/search integrations, validation, persistence, CORS and backend deployment. Shared: schema approval, end-to-end QA, README accuracy and submission.

## 4. FE–BE contract — proposed, needs Dev 1 sign-off

**Architecture recommendation (not competition rule):** REST over HTTPS + JSON + **2-second polling** while active. SSE is P1 only. Use canonical routes from Master Spec, **not** the earlier illustrative `/api/v1/research` route:

| Method | Path | Meaning |
|---|---|---|
| `POST` | `/api/runs` | Start run, return ID and queued state quickly |
| `GET` | `/api/runs/{id}` | Fetch progress and eventual report/evidence |
| `GET` | `/api/health` | Backend health |
| `GET` | `/api/runs/{id}/events` | Optional future SSE |
| `GET` | `/api/runs/{id}/export?format=md|csv` | Optional future export |

**Critical handshake:** before implementation, Dev 1 and Dev 2 approve the exact request/response schema, terminal-state semantics, HTTP error envelope, data retention, CORS origins, and polling interval. The TypeScript contract below is a **draft**; Dev 1's Pydantic schema/OpenAPI should become the authoritative machine-readable contract after sign-off. Do not pretend they already agree.

```ts
export type RunStatus =
  | "queued" | "planning" | "searching" | "reading"
  | "verifying" | "synthesizing" | "completed"
  | "partial" | "failed" | "cancelled";
export type StageName = "planning" | "searching" | "reading" | "verifying" | "synthesizing";
export type StageStatus = "waiting" | "running" | "done" | "failed";
export type ClaimAssessment =
  | "supported_by_excerpt" | "partially_supported" | "unsupported";

export interface RunStep {
  stage: StageName;
  status: StageStatus;
  detail?: string | null;
  duration_ms?: number | null;
}
export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  domain?: string | null;
  authors?: string[];
  year?: number | null;
  fetched_at?: string | null;
  access_status?: "accessible" | "restricted" | "unavailable" | "unknown";
}
export interface ResearchEvidence {
  id: string;
  source_id: string;
  claim_id: string;
  excerpt: string;
  explanation?: string | null;
  match_offset?: number | null;
}
export interface ResearchClaim {
  id: string;
  text: string;
  assessment: ClaimAssessment;
  evidence_ids: string[];
  explanation?: string | null;
}
export interface ComparisonRow {
  id: string;
  method: string;
  dataset?: string | null;
  metric?: string | null;
  result?: string | number | null;
  units?: string | null;
  limitation?: string | null;
  claim_ids: string[];
  comparability_warning?: string | null;
}
export interface ResearchReport {
  summary: string;
  claims: ResearchClaim[];
  comparison: ComparisonRow[];
}
export interface ResearchRun {
  id: string;
  question: string;
  status: RunStatus;
  created_at: string;
  finished_at?: string | null;
  model_id?: string | null;
  steps: RunStep[];
  sources: ResearchSource[];
  evidence: ResearchEvidence[];
  report?: ResearchReport | null;
  error_code?: string | null;
  error_message?: string | null; // sanitized, safe for public UI
}
export interface StartRunRequest { question: string; }
export interface StartRunResponse { id: string; status: "queued" | "planning"; }
export interface ApiError { error: { code: string; message: string; retryable?: boolean } }
```

**Consistency rules:** evidence IDs must resolve to existing evidence; evidence source IDs must resolve to sources; claim IDs must resolve to claims; comparison claim IDs must resolve. Unresolved links show a **missing evidence** warning and log a safe diagnostic; never fabricate data. All timestamps are ISO-8601 UTC on wire and formatted in user's locale only for display. JSON `null` means unknown/not reported. Do not parse AI-generated Markdown tables.

**HTTP/client behavior:** POST with JSON content-type; poll GET every ~2s only while tab visible and status active; stop on terminal state, route change, unmount; AbortController cleanup; handle 400 validation, 404 expired/missing, 429 throttled, 500/502/503 unavailable, network failures and malformed JSON. Apply bounded exponential backoff to GET only; **do not blindly retry POST** (duplicate runs). Display safe user-facing errors. `fetch` must use `cache: 'no-store'` for run status. No credentials in localStorage, client code, logs, or `NEXT_PUBLIC_*` variables.

**Mock/real adapter:** one `ResearchApi` interface (`startRun`, `getRun`); `MockResearchApi` returns deterministic, clearly fictional data with staged status transitions; `HttpResearchApi` calls configured backend; a single factory selects via `NEXT_PUBLIC_DATA_MODE`. All UI components consume typed domain data, never direct fetch or mock imports. `NEXT_PUBLIC_API_BASE_URL` is a public **URL only**, never a secret.

**Environment template:**

```dotenv
NEXT_PUBLIC_DATA_MODE=mock
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Validate env values; fail clearly if `real` mode lacks a URL. Dev 1 must configure CORS for the deployed frontend origin. Production demo must use `real`, not silently fall back to `mock` on failure. If API cannot be reached, show a genuine error.

## 5. Detailed build order and acceptance gates

### Phase 0 — Audit and align (before coding)
- [ ] Read `docs/MASTER_SPEC.md` Parts A–F; do not implement Appendix A roadmap features.
- [ ] Inspect existing repo, package manager, framework version, scripts, lint config, git status; preserve work.
- [ ] Agree schema/routes with Dev 1; if not available, implement as **provisional contract** and record unanswered questions in `docs/API_HANDOFF.md`.
- [ ] Decide one public repository and branch convention (`feat/frontend-ui`), identify owner for merge.
- **Gate:** one-page contract and scope summary exist; no contradictory endpoints.

### Phase 1 — Scaffold and design foundation
- [ ] Create Next.js TypeScript App Router Tailwind project **only if absent**.
- [ ] Enable strict TS, ESLint, import alias, format conventions and useful package scripts (`dev`, `lint`, `typecheck`, `build`, `test` if configured).
- [ ] Create CSS tokens, light/dark surfaces, typography, spacing, radii, focus states, responsive breakpoints.
- [ ] Build primitives: Button, Textarea/Input, Badge, Card, Skeleton, Alert, and accessible Drawer/Dialog as needed.
- [ ] Set metadata (title `Citezy — Don't just cite it. Check it.`, description, viewport, favicon using original brand asset or text mark).
- **Gate:** `npm run lint`, `npm run typecheck`, `npm run build` pass; mobile and desktop baseline readable.

### Phase 2 — Types, fixtures and transport seam
- [ ] Implement `types/research.ts` with agreed schema; prefer runtime validation of external JSON (small schema validator if available; avoid silently trusting arbitrary payloads).
- [ ] Create fictional, explicitly labeled mock fixture containing ≥3 sources, 3 claim assessments, evidence links, a comparison with `null` fields and a comparability warning.
- [ ] Create deterministic mock state machine; no external API calls in mock mode.
- [ ] Implement `ResearchApi` interface, mock and HTTP adapters; centralize API URL and error mapping.
- [ ] Add data integrity checks for claim/evidence/source ID references.
- **Gate:** test adapter modes and missing-reference behavior; no secrets in client bundle.

### Phase 3 — Landing and research submission
- [ ] Implement premium midnight hero, wordmark, research input, three example questions, three-step explainer.
- [ ] Validate trimmed question, min/max length **to be agreed with Dev 1**; prevent empty or duplicate submit.
- [ ] On submit call `startRun`; navigate to `/research/{id}`; show inline error and recovery on failure.
- [ ] Label mock mode visibly; responsive and keyboard accessible.
- **Gate:** submit with mock adapter reaches correct run route; empty input blocked; error state tested.

### Phase 4 — Workbench and truthful progress
- [ ] Implement light research workbench shell, current question, new research action, status badges.
- [ ] Implement `useResearchRun` lifecycle: polling, cleanup, visibility handling, terminal-state stop, backoff.
- [ ] Render stage timeline from returned `steps` and `status`; no hardcoded real-mode progress percentages.
- [ ] Implement skeleton, empty, failed, cancelled and partial states with safe messages.
- **Gate:** simulated progress advances and stops; failed run does not show success; no polling after unmount/terminal state.

### Phase 5 — Evidence-first report (most important wow moment)
- [ ] Summary and claim list with accessible assessment labels and citation controls.
- [ ] Click claim/citation to select corresponding evidence and source; inspector shows exact provided excerpt, explanation, source title/domain, external link.
- [ ] Show explicit caveat that source support is not scientific truth.
- [ ] Handle missing/restricted evidence without hallucinating; link references validated.
- [ ] Implement keyboard navigation and mobile inspector drawer with focus restoration.
- **Gate:** every visible clickable citation resolves to an existing evidence record or an honest unavailable state; manual keyboard test passes.

### Phase 6 — Comparison, sources and responsive polish
- [ ] Render comparison from structured JSON only, with dataset, metric, result, unit, limitations, linked source claims and warning for non-comparable rows.
- [ ] Render source list with access status and valid safe links (`rel="noopener noreferrer"` for new tabs).
- [ ] Verify layout at ~375px, 768px, 1280px; table horizontal scrolling; zoom 200%; reduced motion.
- [ ] Empty and partial comparison states; no invented cells.
- **Gate:** no horizontal page overflow (table container excepted), no inaccessible interactions, no unlinked evidence.

### Phase 7 — Integration with Dev 1's real API
- [ ] Compare real FastAPI OpenAPI/Pydantic responses to FE types; adjust mapping **jointly**, not by guessing.
- [ ] Set real API base URL, configure CORS, confirm POST and polling with a real run.
- [ ] Verify actual source URLs, excerpts, claim assessments, comparison and stage transitions.
- [ ] Exercise 400/404/429/5xx/timeouts, partial evidence, paywalled sources, expired run IDs.
- [ ] Verify **actual runtime Nemotron/Nebius and Tavily calls with Dev 1**; FE must not claim these were tested without evidence.
- **Gate:** public-like end-to-end run succeeds; mock mode disabled for final demo.

### Phase 8 — Testing, deployment and submission handoff
- [ ] Run lint, typecheck, tests, production build; fix errors, not just warnings.
- [ ] Add automated tests for input validation, status transitions, evidence linking, unsupported badge, missing source, partial/failed states and HTTP error mapping.
- [ ] Browser smoke test: desktop and mobile, keyboard, no-login incognito flow, actual deployed URL.
- [ ] Deploy frontend on reliable HTTPS host; configure environment variables and allowed backend CORS origin; verify no mixed-content errors.
- [ ] Confirm real demo can be used free without login or paywall through judging period per rules; coordinate capacity with Dev 1.
- [ ] Record screenshots and **real** screen footage for <3-minute YouTube demo; no fabricated results or metrics.
- [ ] Write frontend README: local setup, environment variables, mock/real modes, commands, known limitations, hosting URL.
- [ ] Confirm repo public, open-source LICENSE present, English copy, accessible demo link; Dev 1/team completes official submission.
- **Gate:** real deployed end-to-end incognito test passes and all mandatory FE deliverables are handed off.

## 6. Testing matrix (minimum)

| Case | Expected |
|---|---|
| Blank / whitespace question | cannot submit; helpful validation |
| Very long question | client limit aligned with backend; no broken layout |
| Duplicate click on Start | one request only |
| Mock mode | unmistakable simulation label; no live claims |
| Queued/running | correct stage display, no fake completion |
| Completed | report and linked evidence visible |
| Partial | available results shown with limitation warning |
| Failed/timeout | honest error and retry/new research affordance |
| Missing/expired ID | 404 state with way back |
| 429 | clear throttling message; no endless retry |
| Unsupported claim | clearly labeled; not treated as verified |
| Broken evidence ID | safe unavailable state, no invented excerpt |
| Missing comparison field | “Not reported” |
| Different datasets | visible not-directly-comparable warning |
| Keyboard/mobile | full core flow possible |
| Reduced motion | transitions minimized |
| Production | real mode, HTTPS, no secret leakage, incognito works |

## 7. Day-by-day FE milestones (WIB; revise if project starts later)

| Date | Dev 2 target | Integration dependency |
|---|---|---|
| **24 Oct** | Phase 0–2: contract, scaffold, tokens, typed mock API | Dev 1 approves draft contract and validates credentials independently |
| **25 Oct** | Phase 3–4: landing, submit, progress workbench | Dev 1 shares FastAPI route/schema plan |
| **26 Oct** | Phase 5–6: report, evidence inspector, comparison, responsive | Dev 1 produces real JSON fixture |
| **27 Oct** | Phase 7: real integration and first deployment | Dev 1 has working API and pipeline |
| **28 Oct** | Phase 8: QA, video, screenshots, frontend README | Both run incognito demo and confirm live calls |
| **29 Oct** | Final bugfix, verify all links, handoff and submit | Both review rules/submission checklist |

**Cut order when behind:** decorative landing sections → complex animations → SSE → export. **Never cut:** real Nemotron integration, real evidence links, honest support status, accessible no-login flow, working demo, required submission artifacts. Frontend-first does not mean backend feasibility should wait until the frontend is pixel-perfect.

## 8. Integration handoff checklist for Dev 1

Before FE switches to real mode, request:

- [ ] FastAPI base URL (local and staging) and OpenAPI schema.
- [ ] Exact request/response JSON samples for queued, running, completed, partial, failed.
- [ ] Stable field names and allowed enum values, including source/evidence/claim IDs.
- [ ] Input limits, rate-limit responses, expected duration, polling guidance.
- [ ] CORS allowed origins and deployment host details.
- [ ] Error envelope, expired run behavior, source-access flags, null conventions.
- [ ] Confirmation of real Nemotron via Nebius and Tavily runtime calls (logs/screenshots sanitized).
- [ ] End-to-end demo question with **actual** sources; no fake metrics.

## 9. Final Definition of Done — Dev 2

The FE work is complete only when all statements below are **true and tested**:

- [ ] Citezy brand and **Midnight Editorial D** design consistently applied.
- [ ] Landing → submit → progress → report → clickable evidence → comparison works.
- [ ] Source excerpts and claims are rendered from data, not generated by the frontend.
- [ ] Three support states are labeled accurately with methodology caveat.
- [ ] Mock mode is isolated and conspicuously labeled; final demo runs real mode.
- [ ] REST contract signed off with Dev 1; no route or enum mismatch.
- [ ] Loading, empty, partial, error, and complete states all work.
- [ ] Responsive, keyboard navigable, accessible contrast/focus, reduced-motion supported.
- [ ] Lint/typecheck/tests/build pass; no browser console errors in core flow.
- [ ] Public HTTPS URL works without login in incognito, with real backend.
- [ ] No API keys or private data exposed in frontend code or logs.
- [ ] Frontend README, screenshots and demo footage ready for submission.
- [ ] Known limitations documented honestly; remaining risks communicated to team.

## 10. Codex execution reporting format

After **every phase**, respond with:

1. **Phase / status:** complete, partial or blocked.
2. **Files created/modified:** exact paths.
3. **Verification:** commands actually executed and outcomes.
4. **Manual checks:** tested viewport/interaction and outcomes; distinguish not tested.
5. **Risks/blockers:** dependencies, assumptions, API-contract changes.
6. **Next phase:** smallest next implementable slice.

**Start here:** Phase 0, then Phase 1. Do not jump straight into an elaborate UI mockup. Preserve this file as the execution checklist; check boxes only after verification.
