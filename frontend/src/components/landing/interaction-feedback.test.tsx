import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EvidencePreview } from "./evidence-preview";
import { createDemoRun } from "@/lib/mock/fixture";

describe("landing claim preview before user selection", () => {
    it("starts with a clear prompt rather than a preselected colored claim", () => {
        const run = createDemoRun("demo", "DEMO ONLY: test", "2026-10-25T00:00:00Z");
        const html = renderToStaticMarkup(<EvidencePreview run={run} />);
        expect(html).toContain("Choose a claim.");
        expect(html).not.toContain('class="demo-claim is-selected"');
        expect(html.match(/aria-selected="false"/g)).toHaveLength(3);
        expect(html).toContain('tabindex="0" class="demo-claim "');
        expect(html.match(/aria-hidden="true" inert=""/g)).toHaveLength(3);
    });
    it("keeps an honest prompt for an empty report without creating a claim", () => {
        const run = createDemoRun("demo", "DEMO ONLY: test", "2026-10-25T00:00:00Z"); run.report = null;
        const html = renderToStaticMarkup(<EvidencePreview run={run} />);
        expect(html).toContain("Choose a claim."); expect(html).not.toContain('role="tab"');
    });
});
