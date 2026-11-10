/** Public allowlist: never display arbitrary backend error_message values. */
export function runFailureMessage(code?: string | null): string | null {
    const messages: Record<string, string> = {
        MODEL_NOT_CONFIGURED: "Live model access is not configured. Ask the service owner to configure Nemotron access.",
        MODEL_UNAVAILABLE: "The model service could not complete this research. Try again later.",
        MODEL_INVALID_OUTPUT: "The model returned unusable structured data. No unsupported result was substituted.",
        SEARCH_NOT_CONFIGURED: "Live source search is not configured. Ask the service owner to configure search access.",
        SEARCH_UNAVAILABLE: "Source search could not complete. Try again later.",
        INSUFFICIENT_SOURCES: "No readable sources were retrieved for this question.",
        INSUFFICIENT_EVIDENCE: "Insufficient supported evidence was found. Review the available excerpts and limitations.",
        PIPELINE_TIMEOUT: "Research reached the execution time limit. Try a more focused question.",
        PIPELINE_CANCELLED: "Research execution was interrupted.",
        PIPELINE_ERROR: "Research could not complete. Please try again later.",
    };
    return code ? messages[code] ?? "The research service could not complete all stages. Review the available results." : null;
}
