# Phase 0-2 PR-readiness audit

Audit date: 24 October 2026 (WIB).

## Original audit outcome
The local Phase 0-2 implementation passes lint, strict typecheck, 50 automated tests and production build. Two Phase 2 validation issues were reproduced with failing regression tests and fixed. The implementation is ready for code review, but a feat/frontend -> dev PR cannot yet be compared or prepared as an actual Git change set because neither branch exists. All audit fixes remain uncommitted on main.

## Git evidence at original audit
- Current branch: main.
- Initial working tree: clean.
- Remote: origin, https://github.com/muhfajri24/Citezy.git (fetch/push).
- Local branches: main only. Local remote-tracking refs: origin/main only.
- git ls-remote --heads origin returned only refs/heads/main at 8db0fb95bd228deebadc500bae96862e01db69cf.
- Local HEAD matches that remote hash: Phase 0-2 root commit 8db0fb9, message "phase 0-2 done", is pushed on main.
- feat/frontend: absent locally and remotely. dev: absent locally and remotely.
- git rev-list --count HEAD returned 1: there is no earlier local baseline commit.
- git diff --stat dev...feat/frontend failed with unknown revision. No branch-relative diff, conflict analysis or mergeability claim is possible.

The branch discrepancy was reported before modifying files. No checkout, reset, discard, branch creation, staging, commit, push, merge or PR creation was performed. Creating both branches at current main would produce an empty PR; the team must choose the intended dev baseline and how to preserve the already-pushed main history before moving work. Do not rewrite history or create a fabricated baseline merely to obtain a PR diff.

## Acceptance review
| Area | Finding |
|---|---|
| Documentation | Read FE.md, API_HANDOFF.md and available master v2.1 Parts A-F. MASTER_SPEC.md was absent; added a navigation entry point to the unchanged versioned specification. |
| Next.js | App Router with React, metadata, viewport, original favicon and static foundation page. Next.js uses defaults; no custom next.config is required. Build resolved Next.js 16.4.3. |
| TypeScript | strict: true, noEmit, bundler resolution and @/* alias configured. |
| Tailwind/design | Tailwind 4 PostCSS configured; all 12 Midnight Editorial color tokens match FE.md. Focus styles and reduced-motion CSS exist. Inter is an optional local font with Segoe UI/system fallback; no bundled Geist or remote font requirement. |
| UI primitives | Button, Input, Textarea, Badge, Card, Skeleton and Alert are reusable typed wrappers. Dialog/drawer remains deferred until needed; permitted by Phase 1 scope. |
| Domain models | Exported FE.md models and enums are preserved; no alternate endpoints or historical response wrapper introduced. |
| Fixtures | Three explicitly fictional example.org sources, all three claim assessments, ID-linked evidence, summary, comparison, missing/null fields, warnings, stages and timestamps. |
| Mock API | Deterministic injectable clock/duration/outcome; queued through completed plus partial/failed/cancelled; no backend or network calls. In-memory runs reset on reload. |
| HTTP API | Native fetch, JSON POST, encoded run IDs, no-store GET, nested runtime validation, response ID check and reference diagnostics. Dot-only IDs now rejected before URL normalization. |
| Errors/lifecycle | Fixed public-safe 400/404/429/500/502/503 messages, malformed JSON/schema, network, timeout and abort handling; timers/listeners cleaned; no automatic POST retry or real-to-mock fallback. |
| Integrity | Broken/duplicate/mismatched evidence/source/claim links are diagnosed; resolver returns honest unavailable states without invented excerpts. |
| Environment | .env.example contains only mock mode and localhost URL; centralized factory rejects invalid mode or missing/unsafe real URL. Validation occurs when factory is invoked; the static preview does not instantiate a research client. |
| Security | No client AI keys, credential storage or raw HTML rendering found. URL credentials and non-HTTP schemes are rejected. Logs use diagnostic codes. Common private-key/token/access-key pattern scan of source/docs/config (excluding generated/vendor files) returned no matching files. This is not a complete secret-history or dependency security audit. |
| Scope | No backend, AI integration, complete landing/submission/workbench, poller, SSE or export implemented. Phase 3+ intentionally deferred. |

## Audit changes
- frontend/src/lib/api/validation.ts: reject impossible UTC dates and normalized 24:00 timestamps; retain valid leap days, minute precision and backend microseconds.
- frontend/src/lib/api/real-client.ts: reject . and .. run IDs before fetch can normalize a different endpoint; retain URL encoding for other opaque IDs.
- frontend/src/lib/api/research.test.ts: eight regression cases for invalid/valid timestamps and dot-segment IDs. Tests reproduced five failures before the fixes; final suite passes all 50 tests.
- docs/MASTER_SPEC.md: new navigation entry point; no new product requirements or copied specification.
- docs/API_HANDOFF.md: repair leftover punctuation encoding, align requested branch names, distinguish historical audit from current Git evidence and record follow-up fixes.
- docs/PR_READINESS.md: this audit and suggested PR copy.

## Important implementation files for review
- frontend/package.json, package-lock.json, tsconfig.json, eslint.config.mjs, postcss.config.mjs, vitest.config.mts
- frontend/src/app/layout.tsx, globals.css, page.tsx, icon.svg
- frontend/src/components/ui/index.tsx
- frontend/src/types/research.ts
- frontend/src/lib/mock/fixture.ts
- frontend/src/lib/api/interface.ts, factory.ts, mock-client.ts, real-client.ts, validation.ts, errors.ts
- frontend/src/lib/utils/integrity.ts
- frontend/src/lib/api/research.test.ts
- frontend/.env.example, frontend/README.md
- docs/MASTER_SPEC.md, FE.md, API_HANDOFF.md, IMPLEMENTATION_PHASE_0_2.md

## Commands actually executed
From frontend/ (npm.cmd is used because PowerShell blocks npm.ps1):
- npm.cmd run lint: PASS, no warnings.
- npm.cmd run typecheck: PASS.
- npm.cmd test: PASS, 50 tests / 1 file.
- npm.cmd run build: PASS; /, /_not-found and /icon.svg prerendered.

Baseline before fixes: the same four commands passed, with 42 tests. git diff --check passed for tracked audit changes. No new browser/manual viewport tests were run during this audit; the earlier implementation record preserves those results and their limits. No real FastAPI/AI/public-deployment tests were performed. Existing dependencies were used; clean npm ci reproducibility was not rerun. Initial network access was restricted; read-only remote verification succeeded after network approval. Git still warns that the user's global ignore file is inaccessible; repository status/diff commands remain functional.

## Remaining blockers and decisions
1. Resolved by explicit user approval: dev is based on existing main (8db0fb9); feat/frontend is based on dev and contains only audit fixes. Initial Phase 0-2 work is already part of both branches.
2. Dev 1 approval of exact public models/OpenAPI, status values and terminal report semantics; mapping internal provenance (content_hash, numeric_check, run_id and tool metadata) to the public draft.
3. Dev 1 approval of POST success status, GET health response and HTTP error envelope; input limits, retention/expiry, accepted ID format and source access/null conventions.
4. Dev 1 approval of polling interval/backoff/Retry-After, timeout, rate limits, CORS origins and local/staging/deployment base URLs.
5. Real backend and eligible Nebius/Nemotron/Tavily runtime checks remain integration work. The draft contract is explicitly PROVISIONAL - PENDING DEV 1 APPROVAL.

An open-source LICENSE and root project README are absent; these are submission follow-ups, not blockers for reviewing this frontend foundation. No license choice was made on behalf of the team. Full accessibility, exact viewport/zoom and real end-to-end testing remain later QA work.

## Approved branch setup
The user explicitly approved creating/pushing dev from current main, creating feat/frontend from dev while preserving local changes, and committing/pushing these audit fixes. main remains at 8db0fb9. feat/backend is left to Dev 1. dev tracks origin/dev; feat/frontend is published with origin/feat/frontend tracking. No merge, force push or automatic PR creation is authorized or performed.

The original missing-branch findings above are historical. The agreed baseline already includes all Phase 0-2 foundation files, so this PR contains only the six audit-fix/documentation files. dev is an ancestor of the frontend work; no divergent changes exist in the checked baseline. Final Git status and remote hashes are verified after publishing.

## Suggested Pull Request title
fix(frontend): harden Phase 2 validation and document API handoff

## Suggested Pull Request description
```markdown
Prevent malformed run data from reaching future research UI. Reject impossible UTC calendar timestamps and dot-segment run IDs before fetch can normalize a different API path, while preserving valid leap days, minute precision and backend microseconds.

- Add eight regression cases for timestamp validation and dot-segment IDs.
- Add docs/MASTER_SPEC.md as an entry point to the unchanged versioned specification.
- Update API handoff and PR-readiness documentation.

Validation: ESLint, strict TypeScript checking, all 50 automated tests and production build pass.

Base: dev. Head: feat/frontend. Both already include the initial Phase 0-2 foundation from main; this PR adds only audit fixes and documentation. No Phase 3 work or backend integration is included.

The API contract remains provisional pending Dev 1 approval of OpenAPI, terminal semantics, input limits, retention, CORS, error responses and polling policy. No live backend integration has been verified.
```
