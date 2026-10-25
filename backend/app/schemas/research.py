from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Literal, Optional, Union
from pydantic import BaseModel, Field


def now_utc_iso() -> str:
    """Return standard ISO-8601 UTC timestamp string with Z suffix."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# Domain Literals matching Frontend exactly
RunStatus = Literal[
    "queued",
    "planning",
    "searching",
    "reading",
    "verifying",
    "synthesizing",
    "completed",
    "partial",
    "failed",
    "cancelled",
]

StageName = Literal[
    "planning",
    "searching",
    "reading",
    "verifying",
    "synthesizing",
]

StageStatus = Literal[
    "waiting",
    "running",
    "done",
    "failed",
]

ClaimAssessment = Literal[
    "supported_by_excerpt",
    "partially_supported",
    "unsupported",
]

AccessStatus = Literal[
    "accessible",
    "restricted",
    "unavailable",
    "unknown",
]


class RunStep(BaseModel):
    stage: StageName
    status: StageStatus
    detail: Optional[str] = None
    duration_ms: Optional[int] = None


class ResearchSource(BaseModel):
    id: str
    title: str
    url: str
    domain: Optional[str] = None
    authors: List[str] = Field(default_factory=list)
    year: Optional[int] = None
    fetched_at: Optional[str] = None
    access_status: AccessStatus = "accessible"


class ResearchEvidence(BaseModel):
    id: str
    source_id: str
    claim_id: str
    excerpt: str
    explanation: Optional[str] = None
    match_offset: Optional[int] = None


class ResearchClaim(BaseModel):
    id: str
    text: str
    assessment: ClaimAssessment
    evidence_ids: List[str] = Field(default_factory=list)
    explanation: Optional[str] = None


class ComparisonRow(BaseModel):
    id: str
    method: str
    dataset: Optional[str] = None
    metric: Optional[str] = None
    result: Optional[Union[str, float, int]] = None
    units: Optional[str] = None
    limitation: Optional[str] = None
    claim_ids: List[str] = Field(default_factory=list)
    comparability_warning: Optional[str] = None


class ResearchReport(BaseModel):
    summary: str
    claims: List[ResearchClaim] = Field(default_factory=list)
    comparison: List[ComparisonRow] = Field(default_factory=list)


class ResearchRun(BaseModel):
    id: str
    question: str
    status: RunStatus
    created_at: str = Field(default_factory=now_utc_iso)
    finished_at: Optional[str] = None
    model_id: Optional[str] = None
    steps: List[RunStep] = Field(default_factory=list)
    sources: List[ResearchSource] = Field(default_factory=list)
    evidence: List[ResearchEvidence] = Field(default_factory=list)
    report: Optional[ResearchReport] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None


class StartRunRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000)


class StartRunResponse(BaseModel):
    id: str
    status: Literal["queued", "planning"] = "queued"


class HealthResponse(BaseModel):
    status: str = "ok"


class ApiErrorDetail(BaseModel):
    code: str
    message: str
    retryable: Optional[bool] = None


class ApiError(BaseModel):
    error: ApiErrorDetail
