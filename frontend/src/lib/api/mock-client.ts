import type { ResearchRun, RunStatus, StartRunRequest, StartRunResponse } from "@/types/research";
import { createDemoRun, DEMO_NOTICE, STAGES } from "@/lib/mock/fixture";
import { ResearchApiError } from "./errors";
import type { ResearchApi } from "./interface";
type Outcome = "completed" | "partial" | "failed" | "cancelled";
export interface MockOptions {
    now?: () => number;
    stageDurationMs?: number;
    outcome?: Outcome;
}
export class MockResearchApi implements ResearchApi {
    private readonly runs = new Map<string, {
        question: string;
        started: number;
    }>();
    private counter = 0;
    private readonly now: () => number;
    private readonly duration: number;
    private readonly outcome: Outcome;
    constructor(options: MockOptions = {}) {
        this.now = options.now ?? Date.now;
        this.duration = options.stageDurationMs ?? 2000;
        this.outcome = options.outcome ?? "completed";
        if (!Number.isFinite(this.duration) || this.duration <= 0)
            throw new Error("Mock stage duration must be positive.");
    }
    async startRun(request: StartRunRequest): Promise<StartRunResponse> {
        const question = request.question.trim();
        if (!question)
            throw new ResearchApiError("VALIDATION_ERROR", "Please enter a research question.", 400);
        const id = `demo-${++this.counter}`;
        this.runs.set(id, { question, started: this.now() });
        return { id, status: "queued" };
    }
    async getRun(id: string, signal?: AbortSignal): Promise<ResearchRun> {
        signal?.throwIfAborted();
        const stored = this.runs.get(id);
        if (!stored)
            throw new ResearchApiError("NOT_FOUND", "This demonstration run is missing or was reset.", 404);
        const elapsed = Math.max(0, this.now() - stored.started);
        const index = Math.min(6, Math.floor(elapsed / this.duration));
        const terminal = index === 6;
        const status: RunStatus = terminal ? this.outcome : index === 0 ? "queued" : STAGES[index - 1];
        const run = createDemoRun(id, stored.question, new Date(stored.started).toISOString());
        run.status = status;
        run.finished_at = terminal ? new Date(stored.started + 6 * this.duration).toISOString() : null;
        run.steps = STAGES.map((stage, i) => ({
            stage, status: terminal ? ((this.outcome === "failed" || this.outcome === "cancelled") && i === 4 ? "failed" : "done") : i < index - 1 ? "done" : i === index - 1 ? "running" : "waiting",
            detail: DEMO_NOTICE, duration_ms: terminal || i < index - 1 ? this.duration : null,
        }));
        if (!terminal || this.outcome === "failed" || this.outcome === "cancelled") {
            run.report = null;
            run.sources = [];
            run.evidence = [];
        }
        if (terminal && this.outcome !== "completed") {
            run.error_code = `DEMO_${this.outcome.toUpperCase()}`;
            run.error_message = `${DEMO_NOTICE} Simulated ${this.outcome} outcome.`;
            if (this.outcome === "partial" && run.report)
                run.report.summary = `${DEMO_NOTICE} Partial demonstration: evidence is limited. ` + run.report.summary;
        }
        return run;
    }
}
