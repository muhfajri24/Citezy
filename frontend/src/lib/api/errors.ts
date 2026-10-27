import type { ApiError } from "@/types/research";
export class ResearchApiError extends Error {
    readonly error: ApiError["error"];
    constructor(code: string, message: string, readonly status?: number, retryable = false) {
        super(message);
        this.name = "ResearchApiError";
        this.error = { code, message, retryable };
    }
}
export function httpError(status: number): ResearchApiError {
    const known: Record<number, [
        string,
        string,
        boolean
    ]> = {
        400: ["VALIDATION_ERROR", "Please check your research question.", false],
        422: ["VALIDATION_ERROR", "Please check your research question.", false],
        404: ["NOT_FOUND", "This research run is missing or has expired.", false],
        429: ["RATE_LIMITED", "Too many requests. Please wait before trying again.", true],
        500: ["UNAVAILABLE", "The research service is temporarily unavailable.", true],
        502: ["UNAVAILABLE", "The research service is temporarily unavailable.", true],
        503: ["UNAVAILABLE", "The research service is temporarily unavailable.", true],
    };
    const [code, message, retryable] = known[status] ?? ["HTTP_ERROR", "The research request could not be completed.", false];
    return new ResearchApiError(code, message, status, retryable);
}
