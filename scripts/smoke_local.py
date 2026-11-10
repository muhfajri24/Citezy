"""Production HTTP smoke, with providers deliberately unconfigured.
Uses one process namespace; starts and stops only its own child services.
Run with the backend virtualenv Python from the repository root after frontend build.
This verifies HTTP/CORS headers and honest failure, not browser interaction or live AI.
"""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import httpx

ROOT = Path(__file__).resolve().parents[1]

def main():
    processes = []
    # This test must never consume provider credits, even on a configured workstation.
    backend_env = {**os.environ, "NEBIUS_API_KEY": "", "TAVILY_API_KEY": "", "NEMOTRON_MODEL_ID": ""}
    evidence = {"kind": "production-http-smoke", "providers": "deliberately unconfigured; no live inference", "checks": {}}
    with tempfile.TemporaryFile(mode="w+") as logs:
        try:
            processes.append(subprocess.Popen([sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"], cwd=ROOT/"backend", env=backend_env, stdout=logs, stderr=logs))
            processes.append(subprocess.Popen(["node", "node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3000"], cwd=ROOT/"frontend", env={**os.environ,"NEXT_TELEMETRY_DISABLED":"1"}, stdout=logs, stderr=logs))
            with httpx.Client(timeout=10, trust_env=False) as client:
                for url in ("http://127.0.0.1:8000/api/health", "http://127.0.0.1:3000/"):
                    deadline = time.monotonic()+30
                    while True:
                        try:
                            response = client.get(url)
                            if response.status_code == 200:
                                break
                        except httpx.HTTPError:
                            pass
                        if time.monotonic() > deadline:
                            raise RuntimeError("An owned smoke server did not start. Check port conflicts.")
                        time.sleep(.2)
                checks = evidence["checks"]
                checks["health"] = client.get("http://127.0.0.1:8000/api/health").json() == {"status":"ok"}
                landing = client.get("http://127.0.0.1:3000/")
                checks["production_landing"] = landing.status_code == 200 and "What do you want to understand?" in landing.text
                checks["about"] = client.get("http://127.0.0.1:3000/about").status_code == 200
                checks["development_route_hidden"] = client.get("http://127.0.0.1:3000/dev/evidence").status_code == 404
                checks["validation"] = client.post("http://127.0.0.1:8000/api/runs", json={"question":"a"}).status_code == 400
                checks["missing_run"] = client.get("http://127.0.0.1:8000/api/runs/missing").status_code == 404
                cors = client.options("http://127.0.0.1:8000/api/runs", headers={"Origin":"http://localhost:3000", "Access-Control-Request-Method":"POST", "Access-Control-Request-Headers":"content-type"})
                checks["cors_preflight_headers_only"] = cors.status_code == 200 and cors.headers.get("access-control-allow-origin") == "http://localhost:3000"
                started = client.post("http://127.0.0.1:8000/api/runs", json={"question":"Compare LoRA and full fine-tuning"})
                assert started.status_code == 202
                run_id = started.json()["id"]
                for _ in range(40):
                    run = client.get(f"http://127.0.0.1:8000/api/runs/{run_id}").json()
                    if run["status"] in {"failed", "completed", "partial", "cancelled"}:
                        break
                    time.sleep(.1)
                checks["honest_unconfigured_failure"] = run["status"] == "failed" and run["error_code"] == "MODEL_NOT_CONFIGURED" and not run["sources"] and run["report"] is None
                checks["failed_stage"] = run["steps"][0]["status"] == "failed"
                page = client.get(f"http://127.0.0.1:3000/research/{run_id}")
                checks["dynamic_workbench_shell"] = page.status_code == 200 and "Research workspace" in page.text
                evidence["run_result"] = {"status":run["status"], "error_code":run["error_code"], "source_count":len(run["sources"]), "has_report":run["report"] is not None}
                evidence["status"] = "pass" if all(checks.values()) else "fail"
        finally:
            for process in processes:
                process.terminate()
            for process in processes:
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill(); process.wait()
    target = ROOT/"docs/evidence/production-http-smoke.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(evidence, indent=2)+"\n")
    print(json.dumps(evidence, indent=2))
    return 0 if evidence.get("status") == "pass" else 1

if __name__ == "__main__":
    raise SystemExit(main())
