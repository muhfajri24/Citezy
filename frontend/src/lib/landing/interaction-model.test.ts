import { afterEach, describe, expect, it, vi } from "vitest";
import { loadLandingPreview } from "@/lib/api/landing-preview";
import { createDemoRun } from "@/lib/mock/fixture";
import { inspectIntegrity } from "@/lib/utils/integrity";
import { ASSESSMENT_LABELS, STORY_STAGES, getActiveStoryIndex, getStoryScrollTarget, pointerOffsets, selectDemoClaim } from "./interaction-model";

const fixture = () => createDemoRun("demo", "DEMO ONLY: fictional comparison", "2026-10-24T00:00:00Z");
afterEach(() => vi.restoreAllMocks());

describe("isolated landing demonstration", () => {
    it("loads deterministic completed mock data with valid references and no fetch", async () => {
        const fetcher = vi.spyOn(globalThis, "fetch");
        const first = await loadLandingPreview();
        const second = await loadLandingPreview();
        expect(first).toEqual(second);
        expect(first.status).toBe("completed");
        expect(first.model_id).toBeNull();
        expect(first.sources).toHaveLength(3);
        expect(first.report?.claims).toHaveLength(3);
        expect(first.question).toContain("DEMO ONLY");
        expect(first.sources.every((source) => source.title.includes("DEMO ONLY") && new URL(source.url).hostname === "example.org")).toBe(true);
        expect(inspectIntegrity(first)).toEqual([]);
        expect(fetcher).not.toHaveBeenCalled();
        first.sources.length = 0;
        expect((await loadLandingPreview()).sources).toHaveLength(3);
    });
    it("defines the five conceptual stages in order without API enum changes", () => {
        expect(STORY_STAGES.map((stage) => stage.label)).toEqual(["Question", "Search", "Read", "Verify", "Report"]);
    });
});

describe("claim-driven evidence selection", () => {
    it.each([["c1", "s1", "supported_by_excerpt"], ["c2", "s2", "partially_supported"], ["c3", "s3", "unsupported"]] as const)("links %s to its actual evidence and source", (id, sourceId, assessment) => {
        const result = selectDemoClaim(fixture(), id);
        expect(result?.claim.assessment).toBe(assessment);
        expect(ASSESSMENT_LABELS[assessment]).toBeTruthy();
        expect(result?.resolution.available).toBe(true);
        if (!result?.resolution.available) throw new Error("Expected resolved demo evidence");
        expect(result.resolution.evidence.claim_id).toBe(id);
        expect(result.resolution.source.id).toBe(sourceId);
        expect(result.resolution.evidence.excerpt).toContain("DEMO ONLY");
    });
    it("selects by ID even when claim text is identical", () => {
        const run = fixture();
        run.report!.claims[1].text = run.report!.claims[0].text;
        expect(selectDemoClaim(run, "c2")?.claim.id).toBe("c2");
    });
    it("returns no invented claim for an unknown ID or absent report", () => {
        expect(selectDemoClaim(fixture(), "not-here")).toBeNull();
        expect(selectDemoClaim({ ...fixture(), report: null }, "c1")).toBeNull();
    });
    it("rejects ambiguous duplicate claim IDs", () => {
        const run = fixture();
        run.report!.claims.push({ ...run.report!.claims[0] });
        expect(selectDemoClaim(run, "c1")).toBeNull();
    });
    it("handles claims with no evidence IDs honestly", () => {
        const run = fixture();
        run.report!.claims[0].evidence_ids = [];
        expect(selectDemoClaim(run, "c1")?.resolution).toEqual({ available: false, reason: "missing_evidence" });
    });
    it.each(["missing", "mismatched", "restricted", "duplicate-source"])("never substitutes evidence for a %s reference", (kind) => {
        const run = fixture();
        if (kind === "missing") run.evidence = [];
        if (kind === "mismatched") run.evidence[0].claim_id = "c2";
        if (kind === "restricted") run.sources[0].access_status = "restricted";
        if (kind === "duplicate-source") run.sources.push({ ...run.sources[0] });
        const result = selectDemoClaim(run, "c1");
        expect(result?.resolution.available).toBe(false);
        expect(result?.claim.assessment).toBe("supported_by_excerpt");
    });
});

describe("scroll activation geometry", () => {
    const rects = [{ top: 0, bottom: 100 }, { top: 100, bottom: 200 }, { top: 200, bottom: 300 }];
    it.each([[-50, 0], [50, 0], [150, 1], [250, 2], [500, 2]])("uses activation line %s for stage %s", (line, expected) => {
        expect(getActiveStoryIndex(rects, line)).toBe(expected);
    });
    it("has a deterministic fallback for no mounted steps", () => {
        expect(getActiveStoryIndex([], 500)).toBe(0);
        expect(getActiveStoryIndex([{ top: Infinity, bottom: Infinity }], 500)).toBe(0);
    });
});

describe("bounded pointer motion", () => {
    const rect = { left: 100, top: 100, width: 200, height: 100 };
    it("is neutral at the center", () => {
        expect(pointerOffsets(200, 150, rect)).toEqual({ x: 0, y: 0 });
    });
    it("is bounded at and beyond the edges", () => {
        expect(pointerOffsets(-1000, -1000, rect)).toEqual({ x: -14, y: -14 });
        expect(pointerOffsets(1000, 1000, rect)).toEqual({ x: 14, y: 14 });
    });
    it("does not divide by zero for a hidden hero", () => {
        expect(pointerOffsets(1, 1, { left: 0, top: 0, width: 0, height: 0 })).toEqual({ x: 0, y: 0 });
    });
});


describe("manual stage navigation", () => {
    it.each([405, 568.4])("aligns selected steps with desktop/mobile observer line %s", (line) => {
        const scrollY = 1400;
        const rects = [{ top: 200, bottom: 460 }, { top: 460, bottom: 720 }, { top: 720, bottom: 980 }];
        for (let selected = 0; selected < rects.length; selected++) {
            const target = getStoryScrollTarget(scrollY, rects[selected], line);
            const delta = target - scrollY;
            const moved = rects.map((rect) => ({ top: rect.top - delta, bottom: rect.bottom - delta }));
            expect(getActiveStoryIndex(moved, line)).toBe(selected);
        }
    });
    it("never asks the browser to scroll above the document", () => {
        expect(getStoryScrollTarget(0, { top: 0, bottom: 100 }, 500)).toBe(0);
    });
});
