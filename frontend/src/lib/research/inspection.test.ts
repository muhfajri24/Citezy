import { describe, expect, it } from "vitest";
import { createDemoRun } from "@/lib/mock/fixture";
import { inspectionContext, sourceEvidence } from "./inspection";
const fixture = () => createDemoRun("demo", "Compare methods", "2026-10-25T00:00:00Z");
describe("inspection integrity and selection", () => {
    it("resolves an exact claim, evidence and source chain", () => {
        const context = inspectionContext(fixture(), "c2", "e2");
        expect(context.claim?.id).toBe("c2");
        expect(context.resolution?.available && context.resolution.source.id).toBe("s2");
    });
    it("navigates multiple linked excerpts in returned order, deduplicating references", () => {
        const run = fixture(); run.report!.claims[0].evidence_ids.push("e4", "e1");
        run.evidence.push({ ...run.evidence[0], id: "e4", source_id: "s2" });
        const context = inspectionContext(run, "c1", "e4");
        expect(context.ids).toEqual(["e1", "e4"]); expect(context.index).toBe(1);
        expect(context.resolution?.available && context.resolution.source.id).toBe("s2");
    });
    it.each(["missing", "e2"])("keeps invalid explicit selection %s unavailable", id => {
        expect(inspectionContext(fixture(), "c1", id).resolution?.available).toBe(false);
    });
    it("rejects missing and ambiguous claims", () => {
        const run = fixture(); expect(inspectionContext(run, "gone").claim).toBeUndefined();
        run.report!.claims.push(run.report!.claims[0]); expect(inspectionContext(run, "c1").claim).toBeUndefined();
    });
    it.each(["evidence", "sources"] as const)("rejects duplicate %s IDs", group => {
        const run = fixture(); if (group === "evidence") run.evidence.push(run.evidence[0]); else run.sources.push(run.sources[0]);
        expect(inspectionContext(run, "c1").resolution?.available).toBe(false);
    });
    it("fails gracefully when evidence or source disappears after a run update", () => {
        const run = fixture(); run.sources = []; expect(inspectionContext(run, "c1", "e1").resolution).toEqual({ available:false, reason:"missing_source" });
        run.evidence = []; expect(inspectionContext(run, "c1", "e1").resolution).toEqual({ available:false, reason:"missing_evidence" });
    });
    it("does not invent claims in an empty report", () => {
        const run = fixture(); run.report = null; expect(inspectionContext(run, "c1").ids).toEqual([]);
    });
    it("source traversal selects only validated evidence belonging to that source", () => {
        expect(sourceEvidence(fixture(), "s2").map(item => [item.claim_id,item.id])).toEqual([["c2","e2"]]);
        const run = fixture(); run.evidence[1].claim_id = "c1"; expect(sourceEvidence(run,"s2")).toEqual([]);
    });
});
