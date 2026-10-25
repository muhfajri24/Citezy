import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpResearchApi } from "./real-client";
import { createRunPoller } from "@/lib/research/poller";
import { createDemoRun } from "@/lib/mock/fixture";
import { resolveEvidence } from "@/lib/utils/integrity";
import type { RunStatus } from "@/types/research";

// TEST ONLY: documented FE draft, not captured or approved Dev 1 responses.
function wireFixture(status: RunStatus) {
    const run = createDemoRun("contract-test", "DEMO ONLY: contract test", "2026-10-25T00:00:00Z");
    run.status = status;
    if (!["completed", "partial"].includes(status)) run.report = null;
    return run;
}
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
afterEach(() => vi.useRealTimers());
describe("TEST ONLY documented frontend HTTP contract", () => {
    it.each<RunStatus>(["queued", "planning", "searching", "reading", "verifying", "synthesizing", "completed", "partial", "failed", "cancelled"])("preserves returned %s and optional report", async status => {
        const fixture = wireFixture(status);
        const api = new HttpResearchApi("https://example.org", { fetch: vi.fn<typeof fetch>().mockResolvedValue(json(fixture)) });
        const run = await api.getRun(fixture.id);
        expect(run.status).toBe(status); expect(run.report).toEqual(fixture.report);
    });
    it("creates once, polls actual HTTP fixture states, then stops at completion", async () => {
        vi.useFakeTimers();
        const fetcher = vi.fn<typeof fetch>()
            .mockResolvedValueOnce(json({ id:"contract-test", status:"queued" },202))
            .mockResolvedValueOnce(json(wireFixture("queued")))
            .mockResolvedValueOnce(json(wireFixture("reading")))
            .mockResolvedValueOnce(json(wireFixture("completed")));
        const api = new HttpResearchApi("https://example.org", {fetch:fetcher});
        const started = await api.startRun({question:"DEMO ONLY: contract test"});
        const publish = vi.fn(), poller = createRunPoller(api,started.id,publish);
        poller.setVisible(true); await vi.advanceTimersByTimeAsync(4000);
        expect(publish.mock.calls.at(-1)?.[0].run.status).toBe("completed");
        await vi.advanceTimersByTimeAsync(60000); expect(fetcher).toHaveBeenCalledTimes(4); poller.dispose();
        expect(fetcher.mock.calls[0][1]?.body).toBe('{"question":"DEMO ONLY: contract test"}');
    });
    it.each(["missing_source", "mismatched_claim"])("retains partial data while refusing %s attribution", async reason => {
        const run = wireFixture("partial");
        if(reason === "missing_source") run.sources = []; else run.evidence[0].claim_id = "c2";
        const api = new HttpResearchApi("https://example.org",{fetch:vi.fn<typeof fetch>().mockResolvedValue(json(run)),onIntegrityIssues:()=>{}});
        const parsed = await api.getRun(run.id);
        expect(parsed.report).not.toBeNull(); expect(resolveEvidence(parsed,"c1","e1")).toEqual({available:false,reason});
    });
    it("keeps an omitted report absent rather than generating one", async () => {
        const run = wireFixture("completed"); delete run.report;
        const api = new HttpResearchApi("https://example.org",{fetch:vi.fn<typeof fetch>().mockResolvedValue(json(run))});
        expect((await api.getRun(run.id)).report).toBeUndefined();
    });
    it("unknown run stops polling and preserves a safe error", async () => {
        vi.useFakeTimers();
        const fetcher=vi.fn<typeof fetch>().mockResolvedValue(json({error:{code:"NOT_FOUND",message:"TEST ONLY"}},404));
        const publish=vi.fn(), poller=createRunPoller(new HttpResearchApi("https://example.org",{fetch:fetcher}),"missing",publish);
        poller.setVisible(true); await vi.advanceTimersByTimeAsync(60000);
        expect(fetcher).toHaveBeenCalledTimes(1); expect(publish.mock.calls.at(-1)?.[0]).toMatchObject({loading:false,run:null,error:expect.any(String)}); poller.dispose();
    });
});
