import { createDemoRun } from "./fixture";
/** Development/test only. Reuses existing fictional excerpts, with an unsupported claim. */
export function createEvidenceQaRun() {
    const run = createDemoRun("demo-qa", "DEMO ONLY: Multi-excerpt interaction QA, not research.", "2026-10-25T00:00:00Z");
    run.evidence.push({ ...run.evidence[0], id: "qa-cedar", claim_id: "c3", explanation: "This existing fictional excerpt does not establish universal superiority; it is linked here only for interaction QA." });
    run.report!.claims[2].evidence_ids = ["e3", "qa-cedar", "qa-missing"];
    return run;
}
