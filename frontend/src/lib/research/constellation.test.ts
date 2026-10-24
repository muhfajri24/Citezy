import { describe, expect, it } from "vitest";
import { createDemoRun } from "@/lib/mock/fixture";
import { buildEvidenceGraph, traceSelection } from "./constellation";
const fixture = () => createDemoRun("demo", "A research question", "2026-10-25T00:00:00Z");
describe("evidence constellation integrity", () => {
    it("builds only question/claim/excerpt/source paths from actual references", () => {
        const graph = buildEvidenceGraph(fixture());
        expect(graph.nodes).toHaveLength(10); expect(graph.edges).toHaveLength(9);
        expect(graph.paths).toContainEqual(["question", "claim:c2", "evidence:e2", "source:s2"]);
        for (const edge of graph.edges) expect(graph.nodes.some(n => n.key === edge.from) && graph.nodes.some(n => n.key === edge.to)).toBe(true);
    });
    it.each(["claim:c2", "evidence:e2", "source:s2"])("traces only the connected branch for %s", key => {
        const connected = traceSelection(buildEvidenceGraph(fixture()), key);
        expect([...connected].sort()).toEqual(["claim:c2", "evidence:e2", "question", "source:s2"]);
        expect(connected.has("claim:c1")).toBe(false);
    });
    it("question selection connects every available branch", () => expect(traceSelection(buildEvidenceGraph(fixture()), "question").size).toBe(10));
    it("supports an active or empty run without fake nodes", () => { const run = fixture(); run.report = null; run.sources = []; run.evidence = []; const graph = buildEvidenceGraph(run); expect(graph.nodes.map(n => n.kind)).toEqual(["question"]); expect(graph.edges).toEqual([]); });
    it.each(["missing evidence", "missing source", "wrong owner", "duplicate source", "duplicate evidence"])("excludes %s from resolved paths", scenario => {
        const run = fixture();
        if (scenario === "missing evidence") run.evidence = run.evidence.filter(e => e.id !== "e2");
        if (scenario === "missing source") run.sources = run.sources.filter(s => s.id !== "s2");
        if (scenario === "wrong owner") run.evidence[1].claim_id = "c1";
        if (scenario === "duplicate source") run.sources.push(run.sources[1]);
        if (scenario === "duplicate evidence") run.evidence.push(run.evidence[1]);
        const graph = buildEvidenceGraph(run);
        expect(graph.nodes.some(n => n.key === "evidence:e2")).toBe(false);
        expect(graph.nodes.some(n => n.key === "source:s2")).toBe(false);
        expect(graph.nodes.some(n => n.key === "claim:c2")).toBe(true);
    });
    it("excludes ambiguous claim IDs", () => { const run = fixture(); run.report!.claims.push(run.report!.claims[1]); expect(buildEvidenceGraph(run).nodes.some(n => n.key === "claim:c2")).toBe(false); });
    it("deduplicates repeated evidence references", () => { const run = fixture(); run.report!.claims[0].evidence_ids.push("e1"); expect(buildEvidenceGraph(run).edges).toHaveLength(9); });
    it("bounds the visible claim map with explicit omission count", () => { const run = fixture(); run.report!.claims = Array.from({ length: 20 }, (_, i) => ({ id: `claim-${i}`, text: "Claim", assessment: "unsupported", evidence_ids: [] })); const graph = buildEvidenceGraph(run); expect(graph.nodes).toHaveLength(13); expect(graph.omitted).toBe(8); });
    it("does not mutate the supplied run", () => { const run = fixture(); const before = JSON.stringify(run); buildEvidenceGraph(run); expect(JSON.stringify(run)).toBe(before); });
});
