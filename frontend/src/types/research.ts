export type RunStatus = "queued" | "planning" | "searching" | "reading" | "verifying" | "synthesizing" | "completed" | "partial" | "failed" | "cancelled";
export type StageName = "planning" | "searching" | "reading" | "verifying" | "synthesizing";
export type StageStatus = "waiting" | "running" | "done" | "failed";
export type ClaimAssessment = "supported_by_excerpt" | "partially_supported" | "unsupported";
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
export interface StartRunRequest {
    question: string;
}
export interface StartRunResponse {
    id: string;
    status: "queued" | "planning";
}
export interface ApiError {
    error: {
        code: string;
        message: string;
        retryable?: boolean;
    };
}
