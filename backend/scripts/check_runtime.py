"""C3: sanitized credential preflight, optionally one real model and search call.
Run from backend: python -m scripts.check_runtime [--live] [--output PATH]
No credentials, source text, prompt or vendor response body is written.
"""
import argparse
import asyncio
import json
from pathlib import Path
from app.config import settings
from app.schemas.research import now_utc_iso
from app.services.errors import ResearchServiceError, has_credential
from app.services.nemotron import nemotron_service
from app.services.tavily import tavily_service


async def check(live=False):
    checks = {"nebius_key": has_credential(settings.NEBIUS_API_KEY),
              "tavily_key": has_credential(settings.TAVILY_API_KEY),
              "nemotron_model_id": bool(settings.NEMOTRON_MODEL_ID) and "nemotron" in settings.NEMOTRON_MODEL_ID.lower()}
    result = {"checked_at": now_utc_iso(), "kind": "live-runtime-check" if live else "configuration-preflight",
              "configured": checks, "model_id": settings.NEMOTRON_MODEL_ID or None,
              "status": "blocked" if not all(checks.values()) else "not_run", "services": {}}
    if not live or not all(checks.values()):
        result["reason"] = "Runtime calls require both private keys and an eligible model ID." if not all(checks.values()) else "Use --live to explicitly request bounded runtime calls."
        return result
    for name, call in (("nebius", lambda: nemotron_service.generate_plan("How do LoRA and full fine-tuning differ?")),
                       ("tavily", lambda: tavily_service.search("LoRA original paper low rank adaptation", max_results=2))):
        try:
            data = await call()
            if not data:
                raise ResearchServiceError("EMPTY_RESULT", "No results returned.")
            result["services"][name] = {"status": "pass", "result_count": len(data)}
            if name == "tavily":
                result["services"][name]["sources"] = [{"url": s["url"], "access_status": s["access_status"]} for s in data]
                if not any(s["raw_text"] for s in data):
                    result["services"][name]["status"] = "insufficient_source_text"
        except ResearchServiceError as exc:
            result["services"][name] = {"status": "fail", "error_code": exc.code}
    result["status"] = "pass" if all(v["status"] == "pass" for v in result["services"].values()) else "fail"
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live", action="store_true")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    evidence = asyncio.run(check(args.live))
    output = json.dumps(evidence, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output)
    print(output)
    raise SystemExit(0 if evidence["status"] == "pass" else 2)
