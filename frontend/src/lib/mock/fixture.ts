import type { ResearchRun, StageName } from "@/types/research";
export const DEMO_NOTICE = "DEMO ONLY — fictional sources and excerpts; no live AI processing.";
export const STAGES: StageName[] = ["planning", "searching", "reading", "verifying", "synthesizing"];
/** Everything below is invented demonstration material, including quotations and numbers. */
export function createDemoRun(id: string, question: string, createdAt: string): ResearchRun {
    return {
        id, question, status: "completed", created_at: createdAt, finished_at: createdAt, model_id: null,
        steps: STAGES.map((stage) => ({ stage, status: "done", detail: DEMO_NOTICE, duration_ms: 2000 })),
        sources: [
            { id: "s1", title: "DEMO ONLY — Fictional Cedar retrieval study", url: "https://example.org/demo/cedar", domain: "example.org", authors: ["Fictional Demo Team"], year: 2026, fetched_at: createdAt, access_status: "accessible" },
            { id: "s2", title: "DEMO ONLY — Fictional Birch retrieval study", url: "https://example.org/demo/birch", year: null, fetched_at: createdAt, access_status: "accessible" },
            { id: "s3", title: "DEMO ONLY — Fictional Maple retrieval study", url: "https://example.org/demo/maple", authors: [], fetched_at: createdAt, access_status: "accessible" },
        ],
        evidence: [
            { id: "e1", source_id: "s1", claim_id: "c1", excerpt: "DEMO ONLY: Cedar scored 72 percent recall on the fictional Orchard-A dataset.", explanation: "The fictional excerpt gives the same dataset and value.", match_offset: 0 },
            { id: "e2", source_id: "s2", claim_id: "c2", excerpt: "DEMO ONLY: Birch reduced latency in one small synthetic trial; broad reliability was not evaluated.", explanation: "The fictional excerpt covers one trial, not general reliability.", match_offset: null },
            { id: "e3", source_id: "s3", claim_id: "c3", excerpt: "DEMO ONLY: Maple was evaluated only on fictional Orchard-B. No cross-dataset comparison was performed.", explanation: "This fictional excerpt does not support universal superiority." },
        ],
        report: {
            summary: `${DEMO_NOTICE} This demonstration compares fictional retrieval methods and illustrates why different evaluation conditions limit conclusions.`,
            claims: [
                { id: "c1", text: "DEMO ONLY: Cedar scored 72% recall on fictional Orchard-A.", assessment: "supported_by_excerpt", evidence_ids: ["e1"] },
                { id: "c2", text: "DEMO ONLY: Birch reduces latency reliably across workloads.", assessment: "partially_supported", evidence_ids: ["e2"], explanation: "Only one small trial is described." },
                { id: "c3", text: "DEMO ONLY: Maple outperforms every retrieval method on all datasets.", assessment: "unsupported", evidence_ids: ["e3"], explanation: "Universal superiority is not established." },
            ],
            comparison: [
                { id: "r1", method: "DEMO ONLY — Cedar", dataset: "Fictional Orchard-A", metric: "Recall", result: 72, units: "%", limitation: "Invented illustration, not a benchmark.", claim_ids: ["c1"] },
                { id: "r2", method: "DEMO ONLY — Birch", dataset: null, metric: "Latency", result: null, units: null, limitation: "One fictional synthetic trial.", claim_ids: ["c2"], comparability_warning: "Different datasets and metrics: not directly comparable." },
                { id: "r3", method: "DEMO ONLY — Maple", dataset: "Fictional Orchard-B", metric: null, result: null, claim_ids: ["c3"], comparability_warning: "Unsupported claim; do not rank this method." },
            ],
        },
    };
}
