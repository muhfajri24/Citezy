# Citezy frontend

Next.js App Router, React and strict TypeScript. Landing, six-tab workspace, claim/excerpt/source inspector, responsive navigation, bounded polling, and Markdown/CSV export are implemented. This is an integration candidate, **not a verified public live-research release**.

## Setup

Node.js 22+; run from `frontend/`:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

| Variable | Meaning |
| --- | --- |
| `NEXT_PUBLIC_DATA_MODE=mock` | Explicitly fictional deterministic UI demo; no live AI/search calls. |
| `NEXT_PUBLIC_DATA_MODE=real` | HTTP adapter; missing URL fails visibly; no fallback to mock. |
| `NEXT_PUBLIC_API_BASE_URL` | Public FastAPI origin, e.g. local `http://127.0.0.1:8000`. HTTPS is required from an HTTPS page. |

These values are embedded at **build time**. Rebuild after changing them. They are public; never include provider credentials. The backend must allow the exact frontend origin in CORS.

Question length is 3–1000 trimmed Unicode code points, aligned with Pydantic. POST is not retried automatically. Abandoned submissions are aborted and cannot trigger stale navigation. GET polls every two seconds while visible/active, stops on terminal/unmount, and has at most three transient retries at 2/4/8 seconds. Valid `Retry-After` delays are respected up to five minutes. Arbitrary backend error text is never rendered.

## Evidence and export

Citations resolve by IDs. Missing/duplicate relations show unavailable states; excerpts are never generated in the browser. Unsupported findings remain visibly labeled. Unknown comparison values stay “Not reported.” Source support does not establish scientific truth.

Download buttons produce Markdown reports and comparison CSV from the returned run. Exports retain mode/status, support labels, references and limitations. CSV cells are escaped and formula prefixes neutralized. SSE is optional and not implemented; polling remains the supported transport.

Mock snapshots store at most five fictional runs per tab in sessionStorage and redact the original question. Restored active snapshots remain interrupted. Real runs do not use this demo persistence.

## Validation and production

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

Standalone output and a non-root Docker runtime are prepared. See [deployment runbook](../docs/DEPLOYMENT.md) for Vercel or Docker build configuration and the remaining acceptance matrix. Docker image execution was not available in the execution environment.

Latest recorded checks: lint, typecheck, **252 tests**, production build and local production HTTP smoke pass. Browser access to the sandbox-local server was refused; new desktop/mobile/zoom/reduced-motion/contrast checks and authentic demo footage remain pending on a reachable preview. Existing screenshots under docs/screenshots are historical mock QA, not new live evidence.

**Public frontend URL:** not deployed in this work. Vercel access and an HTTPS backend origin are needed. No invented URL, model success, screenshot or video is supplied. See [Dev 2 release report](../docs/DEV2_RELEASE_REPORT.md) and [Dev 1 handoff](../docs/DEV1_HANDOFF.md).
