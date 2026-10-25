import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createDemoRun } from "@/lib/mock/fixture";
import { Activity, EvidenceDetail, Overview, Report, SourceLink } from "./views";
import LoadingResearchWorkspace from "@/app/research/[id]/loading";
const fixture = () => createDemoRun("demo", "Compare methods", "2026-10-24T00:00:00Z");
describe("data-backed workspace views", () => {
    it("route fallback announces interface loading without inventing run progress", () => {
        const html = renderToStaticMarkup(<LoadingResearchWorkspace />);
        expect(html).toContain('aria-busy="true"'); expect(html).toContain("Research status will appear when the run is loaded"); expect(html).not.toContain("<progress");
    });
    it("reports returned stage completion without inventing confidence", () => {
        const run = fixture(); run.status = "failed"; run.steps[4].status = "failed";
        const html = renderToStaticMarkup(<Activity run={run} />);
        expect(html).toContain("4 of 5 stages done"); expect(html).toContain('max="5" value="4"'); expect(html).toContain("not a confidence score");
    });
    it("does not invent stage progress when the adapter returns no steps", () => {
        const run = fixture(); run.steps = [];
        const html = renderToStaticMarkup(<Activity run={run} />);
        expect(html).not.toContain("<progress"); expect(html).toContain("No stage details were returned");
    });
    it("renders counts, summary and real quick-action labels", () => { const html = renderToStaticMarkup(<Overview run={fixture()} navigate={() => {}} />); expect(html).toContain("Sources ↗"); expect(html).toContain("Claims ↗"); expect(html).toContain("5/5"); });
    it("renders selected report claim and accessible evidence actions", () => { const html = renderToStaticMarkup(<Report run={fixture()} selectedClaim="c2" selectClaim={() => {}} inspect={() => {}} />); expect(html).toContain("report-claim is-selected"); expect(html).toContain("Inspect evidence e2 for claim c2"); });
    it("shows the selected claim's excerpt, without leaking another claim's excerpt", () => { const html = renderToStaticMarkup(<EvidenceDetail run={fixture()} claimId="c2" />); expect(html).toContain("Birch reduced latency in one small synthetic trial"); expect(html).not.toContain("Cedar scored 72 percent recall"); expect(html).toContain("Partially supported"); });
    it("shows honest empty report and missing evidence states", () => { const run = fixture(); run.report = null; expect(renderToStaticMarkup(<Report run={run} selectedClaim="" selectClaim={() => {}} inspect={() => {}} />)).toContain("No report is available"); const missing = fixture(); missing.evidence = []; expect(renderToStaticMarkup(<EvidenceDetail run={missing} claimId="c1" />)).toContain("Evidence unavailable"); });
    it("keeps failed stages distinct from success", () => { const run = fixture(); run.status = "failed"; run.steps[4].status = "failed"; const html = renderToStaticMarkup(<Activity run={run} />); expect(html).toContain("stage-failed"); expect(html).toContain("Run status: failed"); });
    it("never renders an unsafe original source link", () => { const source = fixture().sources[0]; source.url = "javascript:alert(1)"; const html = renderToStaticMarkup(<SourceLink source={source} />); expect(html).not.toContain("href="); expect(html).toContain("unavailable"); });
});
