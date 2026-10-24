import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createDemoRun } from "@/lib/mock/fixture";
import { EvidenceConstellation } from "./constellation";
describe("evidence map accessibility and empty state", () => {
    it("renders selectable labelled buttons with one keyboard entry point", () => {
        const run = createDemoRun("demo", "Research question", "2026-10-25T00:00:00Z");
        const html = renderToStaticMarkup(<EvidenceConstellation run={run} />);
        expect(html.match(/<button/g)).toHaveLength(10);
        expect(html.match(/tabindex="0"/g)).toHaveLength(1);
        expect(html).toContain('aria-label="Evidence relationship map"');
        expect(html).toContain("DEMO ONLY"); expect(html).toContain("Only supplied relationships are shown.");
    });
    it("shows an honest empty view for runs with no claims", () => {
        const run = createDemoRun("demo", "Question", "2026-10-25T00:00:00Z"); run.report = null;
        const html = renderToStaticMarkup(<EvidenceConstellation run={run} />);
        expect(html).toContain("No claim relationships are available yet"); expect(html).not.toContain("<button");
    });
});
