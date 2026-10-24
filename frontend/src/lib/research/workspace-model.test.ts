import { describe, expect, it } from "vitest";
import { adjacentTab, claimCounts, linkedSourceClaims, safeSourceUrl, sourceMatches, WORKSPACE_TABS } from "./workspace-model";
import { createDemoRun } from "@/lib/mock/fixture";
const fixture = () => createDemoRun("demo", "Question", "2026-10-24T00:00:00Z");
describe("workspace data and navigation", () => {
    it("counts only returned data", () => { expect(claimCounts(fixture())).toEqual({ supported_by_excerpt: 1, partially_supported: 1, unsupported: 1 }); const run = fixture(); run.report = null; expect(Object.values(claimCounts(run))).toEqual([0, 0, 0]); });
    it("connects a selected source to the matching claim", () => { expect(linkedSourceClaims(fixture(), "s2").map(c => c.id)).toEqual(["c2"]); });
    it("excludes broken or ambiguous relationships", () => { const run = fixture(); run.evidence[1].claim_id = "c1"; expect(linkedSourceClaims(run, "s2")).toEqual([]); run.sources.push(run.sources[0]); expect(linkedSourceClaims(run, "s1")).toEqual([]); });
    it("searches metadata and respects access filters", () => { const source = fixture().sources[0]; expect(sourceMatches(source, "CEDAR", "all")).toBe(true); expect(sourceMatches(source, "2026", "accessible")).toBe(true); expect(sourceMatches(source, "cedar", "restricted")).toBe(false); expect(sourceMatches(source, "missing", "all")).toBe(false); });
    it.each(["javascript:alert(1)", "data:text/html,test", "https://user:pass@example.org", "broken"])("rejects unsafe source URL %s", url => expect(safeSourceUrl(url)).toBeNull());
    it("accepts an ordinary source link", () => expect(safeSourceUrl("https://example.org/demo")).toBe("https://example.org/demo"));
    it("keyboard can reach every tab, wrap and jump", () => { expect(WORKSPACE_TABS).toHaveLength(6); expect(adjacentTab(5, "ArrowRight")).toBe(0); expect(adjacentTab(0, "ArrowLeft")).toBe(5); expect(adjacentTab(3, "Home")).toBe(0); expect(adjacentTab(2, "End")).toBe(5); expect(adjacentTab(2, "Tab")).toBeNull(); });
});
