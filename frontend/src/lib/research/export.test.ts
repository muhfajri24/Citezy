import { describe, it, expect } from "vitest";
import { createDemoRun } from "@/lib/mock/fixture";
import { exportComparisonCsv, exportReportMarkdown } from "./export";
const fixture = () => createDemoRun("demo-export", "Compare methods", "2026-10-24T00:00:00Z");
describe("portable research export", () => {
    it("preserves demo disclosure, partial status and support assessments", () => {
        const run = fixture(); run.status = "partial";
        const md = exportReportMarkdown(run,true);
        expect(md).toContain("DEMO ONLY"); expect(md).toContain("Status: partial");
        expect(md).toContain("unsupported"); expect(md).toContain(run.evidence[0].excerpt);
        expect(md).toContain("not independent fact-checking");
    });
    it("never fills missing comparison results and protects spreadsheet formulas", () => {
        const run = fixture(); const row = run.report!.comparison[0];
        row.method = '=IMPORTXML("private")'; row.result = null;
        const csv = exportComparisonCsv(run,false);
        expect(csv).toContain("Not reported"); expect(csv).toContain("\"'=IMPORTXML"); expect(csv).toContain('""private""');
        expect(csv).toContain("Backend research / inspect evidence");
    });
    it("refuses wrong or ambiguous evidence attribution", () => {
        const run = fixture(); run.evidence[0].claim_id = "another-claim";
        const md = exportReportMarkdown(run,true);
        expect(md).toContain("Evidence e1 unavailable"); expect(md).not.toContain(run.evidence[0].excerpt);
    });
    it("handles absent report honestly", () => {
        const run = fixture(); run.report = null;
        expect(exportReportMarkdown(run,false)).toContain("No report returned");
        expect(exportComparisonCsv(run,false).split("\r\n")).toHaveLength(2);
    });
});
