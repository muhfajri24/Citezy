# Deployment and final browser acceptance

Status: deployment preparation only. No public URL or successful live research is claimed. Keep the reviewed source in the Citezy GitHub repository; no architecture migration is required.

## Frontend: Vercel

1. Connect the owner's Vercel account, import `muhfajri24/Citezy`, and choose the reviewed branch. Root directory: `frontend`; framework: Next.js; install: `npm ci`; build: `npm run build`.
2. Set public build variables `NEXT_PUBLIC_DATA_MODE=real` and `NEXT_PUBLIC_API_BASE_URL=https://<actual-backend-origin>`. Do not use api.citezy.test (CI only), localhost, or provider keys in a public build.
3. Dev 1 deploys the HTTPS backend and adds the exact frontend origin to `CORS_ORIGINS`. Confirm the model/search credits and public-access resource controls before accepting external runs.
4. Deploy and record the provider-returned URL and commit. Confirm judge access without login or payment using a clean browser session. Rebuild when public environment variables change.

Vercel was not connected during this work. Its connection is separate from GitHub access. No paid plan or new subscription was purchased. Reference: https://vercel.com/docs/frameworks/full-stack/nextjs

## Alternative: standalone Node/Docker

From `frontend/`:

```sh
docker build --build-arg NEXT_PUBLIC_DATA_MODE=real --build-arg NEXT_PUBLIC_API_BASE_URL=https://<actual-backend-origin> -t citezy-frontend .
docker run --rm -p 3000:3000 citezy-frontend
```

The image builds Next standalone, copies static/public assets, and runs as the `node` user. An HTTPS reverse proxy/host and backend CORS are still required. Docker was unavailable locally; do not describe the image as execution-tested. Node production HTTP smoke was tested separately.

## Final acceptance matrix (must run on the reachable deployment)

| Check | Required result | Current evidence |
| --- | --- | --- |
| Clean session / no login | Submit → stages → report → claim → source | Pending live deployment and credentials |
| 375 / 768 / 1280 px | No page overflow; table scrolls inside its region | Historical mock checks; new release pending |
| Keyboard | Tabs, citation, inspector, Escape, focus return, new research | Unit/SSR tests and historical mock QA; deployed browser pending |
| 200% browser zoom | Readable/reflowing layout and operable controls | Pending |
| Reduced motion | OS/browser preference suppresses movement | CSS/hooks present; deployed preference test pending |
| Contrast / screen reader | Legible text/focus and useful announcements | Pending manual assistive-technology check |
| HTTP errors | Safe 400/404/422/429/5xx/timeout handling; no fallback | Adapter tests pass; deployed failures pending |
| Throttling | Respect Retry-After; bounded retries; no duplicate POST | Automated tests pass |
| Partial / missing evidence | Honest empty/unavailable states and supported references | Automated tests pass; live sample pending |
| HTTPS / CORS | No mixed content or browser CORS rejection | Local preflight headers pass; browser/deployment pending |
| Exports | Markdown/CSV match run; mode/status retained | Automated content tests pass; browser download pending |
| Model/search runtime | Actual eligible model and source retrieval evidence | Blocked: credentials/model ID unavailable |

## Demo footage plan (under three minutes)

Record the real deployed application after live gates pass. Do not substitute historical mock screenshots.

- 0:00–0:20: Enter a focused question and explain the evidence-traceability problem.
- 0:20–0:50: Show returned stages; mention actual model/search integration using sanitized metadata.
- 0:50–1:30: Open a supported claim, inspect the exact excerpt and original source.
- 1:30–2:00: Show a partial/unsupported claim or an actual insufficient-evidence outcome without presenting it as success.
- 2:00–2:30: Show comparison warnings, unknown values, export and mobile layout.
- 2:30–2:45: Explain limits; show public repository/setup/demo links.

An authentic video cannot be recorded or uploaded until the deployment and runtime prerequisites are available. The owner/team completes official submission and validates the current event rules; historical dates in the master spec do not prove eligibility today.
