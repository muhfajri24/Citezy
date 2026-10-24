import type { ResearchRun } from "@/types/research";
import { MockResearchApi } from "./mock-client";
import { parseRun } from "./validation";

/** Isolated fixture run for the landing explainer, never a user run or live processing. */
export async function loadLandingPreview(): Promise<ResearchRun> {
    let now = Date.parse("2026-10-24T00:00:00Z");
    const api = new MockResearchApi({ now: () => now, stageDurationMs: 1 });
    const { id } = await api.startRun({ question: "DEMO ONLY: Compare fictional retrieval methods using their reported evidence." });
    now += 6;
    return parseRun(await api.getRun(id));
}
