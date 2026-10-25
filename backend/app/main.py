from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .schemas.research import (
    StartRunRequest,
    StartRunResponse,
    ResearchRun,
    HealthResponse,
    ApiError,
    ApiErrorDetail,
)
from .storage.memory_store import run_store
from .services.orchestrator import orchestrator

app = FastAPI(
    title="Citezy AI Research Engine API",
    description="Backend API powering Citezy's evidence-first research workbench (Nebius x NVIDIA Track 2)",
    version="1.0.0",
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=ApiError(
            error=ApiErrorDetail(
                code="VALIDATION_ERROR",
                message="Invalid request payload or parameters.",
                retryable=False,
            )
        ).model_dump(),
    )

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Liveness probe for backend service."""
    return HealthResponse(status="ok")


@app.post(
    "/api/runs",
    response_model=StartRunResponse,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Research"],
    responses={
        400: {"model": ApiError, "description": "Validation error"},
    },
)
async def start_research_run(request: StartRunRequest):
    """
    Initiate a new evidence-grounded research pipeline run.
    Triggers asynchronous planning, searching, reading, verifying, and synthesizing.
    """
    question = request.question.strip()
    if len(question) < 3:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=ApiError(
                error=ApiErrorDetail(
                    code="VALIDATION_ERROR",
                    message="Question must be at least 3 characters long.",
                    retryable=False,
                )
            ).model_dump(),
        )

    run = await orchestrator.create_and_start_run(question)
    return StartRunResponse(id=run.id, status="queued")


@app.get(
    "/api/runs/{run_id}",
    response_model=ResearchRun,
    tags=["Research"],
    responses={
        404: {"model": ApiError, "description": "Run not found"},
    },
)
async def get_research_run(run_id: str):
    """
    Retrieve current run status, retrieved sources, verified evidence, and synthesized report.
    Polled periodically by the Citezy frontend.
    """
    cleaned_id = run_id.strip()
    if not cleaned_id or cleaned_id in [".", ".."]:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=ApiError(
                error=ApiErrorDetail(
                    code="NOT_FOUND",
                    message="A valid research run ID is required.",
                    retryable=False,
                )
            ).model_dump(),
        )

    run = await run_store.get(cleaned_id)
    if not run:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=ApiError(
                error=ApiErrorDetail(
                    code="NOT_FOUND",
                    message=f"Research run with ID '{cleaned_id}' was not found or has expired.",
                    retryable=False,
                )
            ).model_dump(),
        )

    return run
