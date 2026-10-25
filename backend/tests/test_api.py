import re
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_start_run_validation_error():
    response = client.post("/api/runs", json={"question": "a"})
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "VALIDATION_ERROR"


def test_start_run_and_poll():
    # 1. Start run
    payload = {"question": "How does speculative decoding improve LLM latency?"}
    post_res = client.post("/api/runs", json=payload)
    assert post_res.status_code == 202
    post_data = post_res.json()
    assert "id" in post_data
    assert post_data["status"] in ["queued", "planning"]

    run_id = post_data["id"]

    # 2. Get run
    get_res = client.get(f"/api/runs/{run_id}")
    assert get_res.status_code == 200
    run_data = get_res.json()

    # Validate exact shape required by frontend validation
    assert run_data["id"] == run_id
    assert run_data["question"] == payload["question"]
    assert run_data["status"] in [
        "queued", "planning", "searching", "reading", "verifying", "synthesizing", "completed", "partial"
    ]
    
    # Check timestamp ends in Z
    iso_z_pattern = r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?Z$"
    assert re.match(iso_z_pattern, run_data["created_at"])

    # Check steps
    assert isinstance(run_data["steps"], list)
    assert len(run_data["steps"]) == 5
    for step in run_data["steps"]:
        assert step["stage"] in ["planning", "searching", "reading", "verifying", "synthesizing"]
        assert step["status"] in ["waiting", "running", "done", "failed"]


def test_get_run_not_found():
    res = client.get("/api/runs/non-existent-run-id-12345")
    assert res.status_code == 404
    data = res.json()
    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"


def test_get_run_dot_segment_rejected():
    res = client.get("/api/runs/..")
    assert res.status_code == 404
