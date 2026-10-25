import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "@/app/page";
import { Navigation } from "./navigation";
import { DemoDataContext } from "@/components/research/data-context";
import { Report, Activity } from "@/components/research/views";
import { ClaimInspector } from "@/components/evidence/claim-inspector";
import { createDemoRun } from "@/lib/mock/fixture";
import { createResearchApi } from "@/lib/api/factory";
import { createSubmissionController } from "@/lib/landing/research-submission";
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
describe("research-first routes and mode isolation", () => {
    it("puts the input and submit on home without the marketing graph", () => {
        const html = renderToStaticMarkup(<Home />);
        expect(html).toContain('id="research-question"');
        expect(html).toContain("Start Research"); expect(html).toContain('href="/about"');
        expect(html).not.toContain("THE EVIDENCE CONSTELLATION");
        expect(html).toContain("DEMO ONLY");
    });
    it("links both directions with an active navigation state", () => {
        const html = renderToStaticMarkup(<Navigation active="about" />);
        expect(html).toContain('href="/"'); expect(html).toContain('aria-current="page" href="/about"');
    });
    it("does not label real research as fictional while About defaults remain demo", () => {
        const run = createDemoRun("test", "Question for testing", "2026-10-25T00:00:00Z");
        const content = <><Report run={run} selectedClaim="" selectClaim={() => {}} inspect={() => {}} /><Activity run={run} /><ClaimInspector run={run} claimId="c1" /></>;
        const real = renderToStaticMarkup(<DemoDataContext value={false}>{content}</DemoDataContext>);
        // Fixture content must remain verbatim; only UI-owned disclosures change.
        expect(real).not.toContain("RESEARCH REPORT / DEMO ONLY");
        expect(real).not.toContain("DEMO ONLY: these sources and excerpts are fictional.");
        expect(real).not.toContain("simulated progress");
        expect(renderToStaticMarkup(content)).toContain("DEMO ONLY");
    });
    it("submits through the real adapter without falling back when the backend fails", async () => {
        const fetcher = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
        const navigate = vi.fn();
        const api = createResearchApi({ mode: "real", baseUrl: "https://api.example.org" });
        const controller = createSubmissionController(() => api, navigate);
        expect((await controller.submit("Compare two research methods")).kind).toBe("error");
        expect(fetcher).toHaveBeenCalledTimes(1); expect(navigate).not.toHaveBeenCalled();
    });
    it("real home describes backend results instead of a demo", () => {
        vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "real");
        const html = renderToStaticMarkup(<Home />);
        expect(html).not.toContain("DEMO ONLY"); expect(html).toContain("configured research service");
    });
});
