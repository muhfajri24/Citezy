import type { ResearchApi } from "@/lib/api/interface";
import { ResearchApiError } from "@/lib/api/errors";

// Frontend demo limits only. Final real-mode limits require Dev 1 approval.
export const QUESTION_MIN_LENGTH = 10;
export const QUESTION_MAX_LENGTH = 500;
export const EXAMPLE_QUESTIONS = [
    { label: "Retrieval-augmented generation", question: "How does retrieval-augmented generation compare with fine-tuning for answering domain-specific questions?" },
    { label: "Efficient language models", question: "What are the trade-offs between LoRA and full fine-tuning for adapting language models?" },
    { label: "Long-context reasoning", question: "How do long-context language models compare with retrieval-based approaches for document question answering?" },
] as const;

export function validateQuestion(value: string): string | null {
    const length = value.trim().length;
    if (length === 0) return "Start with a research question.";
    if (length < QUESTION_MIN_LENGTH) return `Add a little detail: use at least ${QUESTION_MIN_LENGTH} characters.`;
    if (length > QUESTION_MAX_LENGTH) return `Keep your question within ${QUESTION_MAX_LENGTH} characters.`;
    return null;
}

export type SubmissionResult =
    | { kind: "started"; id: string }
    | { kind: "busy" }
    | { kind: "error"; message: string };

/** One submission per navigation. A failed request releases the lock for retry. */
export function createSubmissionController(
    getApi: () => ResearchApi,
    navigate: (path: string) => void,
) {
    let pending = false;
    return {
        /** React can preserve a landing page when navigating away; release its lock when it is shown again. */
        reset() { pending = false; },
        async submit(value: string): Promise<SubmissionResult> {
            if (pending) return { kind: "busy" };
            const validation = validateQuestion(value);
            if (validation) return { kind: "error", message: validation };
            pending = true;
            try {
                const result = await getApi().startRun({ question: value.trim() });
                navigate(`/research/${encodeURIComponent(result.id)}`);
                return { kind: "started", id: result.id };
            } catch (error) {
                pending = false;
                return {
                    kind: "error",
                    message: error instanceof ResearchApiError && error.error.code === "DEMO_MODE_REQUIRED"
                        ? "This preview only supports demo mode. Restart the app in mock mode to create a simulated request."
                        : "We couldn't create your demo request. Your question is still here. Please try again.",
                };
            }
        },
    };
}
