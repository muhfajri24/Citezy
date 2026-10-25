import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createDemoRun } from "@/lib/mock/fixture";
import { ClaimInspector, ClaimLedger, SourceDetails, SourceLink } from "./claim-inspector";
const fixture = () => createDemoRun("demo", "Compare methods", "2026-10-25T00:00:00Z");
describe("unified inspection presentation", () => {
    it("offers reset when no claims match the actual status filter", () => {
        const html = renderToStaticMarkup(<ClaimLedger claims={[fixture().report!.claims[0]]} assessment="unsupported" onSelect={() => {}} onReset={() => {}} />);
        expect(html).toContain("No claims match this view"); expect(html).toContain("Reset support filter"); expect(html).not.toContain("Cedar scored");
    });
    it("explains partial support and preserves the entire supplied excerpt", () => {
        const run = fixture(), html = renderToStaticMarkup(<ClaimInspector run={run} claimId="c2" />);
        expect(html).toContain("important qualifications remain"); expect(html).toContain(`<mark>${run.evidence[1].excerpt}</mark>`);
        expect(html).toContain("Year: Not reported"); expect(html).not.toContain("Previous excerpt");
    });
    it("never marks unsupported excerpts as supporting evidence", () => {
        const html = renderToStaticMarkup(<ClaimInspector run={fixture()} claimId="c3" />);
        expect(html).not.toContain("<mark>"); expect(html).toContain("not proof that the claim is false"); expect(html).toContain("not supporting evidence");
    });
    it("allows inspection of claims without any evidence", () => {
        const run = fixture(); run.report!.claims[0].evidence_ids = [];
        const html = renderToStaticMarkup(<ClaimInspector run={run} claimId="c1" />);
        expect(html).toContain(run.report!.claims[0].text); expect(html).toContain("No evidence was supplied");
    });
    it("renders multi-evidence controls, selection, and disabled boundaries", () => {
        const run = fixture(); run.report!.claims[0].evidence_ids.push("e4"); run.evidence.push({...run.evidence[0],id:"e4"});
        const html = renderToStaticMarkup(<ClaimInspector run={run} claimId="c1" evidenceId="e4" />);
        expect(html).toContain("Excerpt 2 of 2"); expect(html).toMatch(/disabled="">Next excerpt/); expect(html).toContain('aria-pressed="true"');
    });
    it("rejects stale evidence selection without displaying another excerpt", () => {
        const html = renderToStaticMarkup(<ClaimInspector run={fixture()} claimId="c1" evidenceId="e2" />);
        expect(html).toContain("Evidence unavailable"); expect(html).not.toContain("<blockquote");
    });
    it.each(["javascript:alert(1)","https://user:pass@example.org", "", "not a url"])("rejects unsafe source URL %s", url => {
        const source = {...fixture().sources[0],url}; expect(renderToStaticMarkup(<SourceLink source={source}/>)).not.toContain("href=");
    });
    it("names the source on safe external links", () => {
        const html = renderToStaticMarkup(<SourceLink source={fixture().sources[0]}/>);
        expect(html).toContain('rel="noopener noreferrer"'); expect(html).toContain("Fictional Cedar retrieval study");
    });
    it("shows unavailable source for duplicate IDs", () => {
        const run = fixture(); run.sources.push(run.sources[0]); expect(renderToStaticMarkup(<SourceDetails run={run} sourceId="s1"/>)).toContain("ambiguous");
    });
});
