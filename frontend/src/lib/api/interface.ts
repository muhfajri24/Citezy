import type { ResearchRun, StartRunRequest, StartRunResponse } from "@/types/research";
export interface ResearchApi {
    startRun(request: StartRunRequest): Promise<StartRunResponse>;
    getRun(id: string, signal?: AbortSignal): Promise<ResearchRun>;
}
export const TERMINAL_STATUSES = ["completed", "partial", "failed", "cancelled"] as const;
export function isTerminal(status: ResearchRun["status"]): boolean {
    return TERMINAL_STATUSES.some((value) => value === status);
}
