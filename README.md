# Citezy — Don't just cite it. Check it.

Citezy is a no-login CS/ML research workspace linking questions, source excerpts, claim-support assessments and structured comparisons. Source support is **not independent scientific fact-checking**.

## Current release status

The frontend and FastAPI pipeline are implemented. **Live Nebius/Nemotron and Tavily access and final live-research browser acceptance remain unverified. Frontend hosting is deployed: [production](https://citezy.vercel.app/) (service connection pending) and [explicitly fictional UI demo](https://citezy-1fak6nvjr-itzfajri4-9425.vercel.app/).** Missing credentials or provider failures produce an explicit failed/partial run; no fictional source or supported assessment is substituted. The latest engineering work is on `fix/citezy-live-evidence`, based on `feat/frontend`, for review into `dev`.

- [Vercel deployment and browser QA follow-up](docs/VERCEL_RELEASE.md)
- [Verification and Dev 2 completion matrix](docs/DEV2_RELEASE_REPORT.md)
- [Dev 1 handoff and ordered acceptance tasks](docs/DEV1_HANDOFF.md)
- [Deployment and browser acceptance runbook](docs/DEPLOYMENT.md)
- [Runtime preflight evidence](docs/evidence/runtime-check.json)
- [Production HTTP smoke evidence](docs/evidence/production-http-smoke.json)

Older phase reports and issue checkboxes are historical snapshots, not current proof of deployment or live AI access.

## Run locally

Use Python 3.12 and Node.js 22+. Two terminals:

```sh
cd backend
python -m venv .venv
# Linux/macOS: source .venv/bin/activate
# Windows PowerShell: .venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
cp .env.example .env
# Configure private NEBIUS_API_KEY, TAVILY_API_KEY and exact NEMOTRON_MODEL_ID in .env.
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

```sh
cd frontend
npm ci
cp .env.example .env.local
# For real requests set NEXT_PUBLIC_DATA_MODE=real and NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
npm run dev
```

Open the printed frontend URL. `mock` mode is an explicitly fictional, offline UI simulation. Real mode never falls back to it. Never put provider keys in frontend environment variables, screenshots, issues or commits.

## Checks

```sh
cd backend
python -m pytest -q
python -m scripts.check_runtime --live --output ../docs/evidence/runtime-check.json
```

The runtime checker exits 2 if configuration is missing. Only `--live` with complete configuration requests provider calls; check available credits first. Never replace failed evidence with a mock success.

```sh
cd frontend
npm run lint
npm run typecheck
npm test
npm run build
```

After a production build, run `python scripts/smoke_local.py` from the root using the backend virtualenv Python. It starts isolated child services, verifies HTTP behavior with deliberately empty provider configuration, and stops its own processes. It does not verify browser behavior or live AI.

## Architecture and limitations

Next.js client views call `POST /api/runs`, poll `GET /api/runs/{id}`, and inspect the returned evidence links. FastAPI plans searches through Nemotron, retrieves text with Tavily, extracts typed candidates, checks quotes/numbers and model-assisted support, then deterministically assembles linked findings and comparison rows. Comparison fields must occur in the same excerpt; absent context stays unreported. Cross-source comparisons are explicitly qualified.

The current store is process-local memory: restarts lose runs; multiple workers are not supported. Public production requires Dev 1's persistence, retention, concurrency/rate/cost controls and deployment acceptance. Source text is limited to the first 16,000 characters per source, extracts to five candidates per source and the configured global claim cap. This is not exhaustive literature review. Model-assisted verification can still be wrong. No benchmark accuracy or performance score is claimed.

See [MIT license](LICENSE). Third-party papers, search results and model terms remain with their respective owners/providers.
