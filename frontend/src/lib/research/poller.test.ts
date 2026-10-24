import { afterEach, describe, expect, it, vi } from "vitest";
import { createRunPoller, type RunSnapshot } from "./poller";
import { MockResearchApi } from "@/lib/api/mock-client";
import { ResearchApiError } from "@/lib/api/errors";
import { createDemoRun } from "@/lib/mock/fixture";

afterEach(() => vi.useRealTimers());
describe("research polling lifecycle", () => {
    it.each(["completed", "partial", "failed", "cancelled"] as const)("advances real mock stages and stops at %s", async outcome => {
        vi.useFakeTimers(); vi.setSystemTime(0);
        const api = new MockResearchApi({ outcome });
        const { id } = await api.startRun({ question: "Compare fictional retrieval methods" });
        const get = vi.spyOn(api, "getRun");
        const states: RunSnapshot[] = [];
        const poller = createRunPoller(api, id, state => states.push(state));
        poller.setVisible(true);
        await vi.advanceTimersByTimeAsync(12000);
        expect(states.filter(s => !s.loading).map(s => s.run?.status)).toEqual(["queued", "planning", "searching", "reading", "verifying", "synthesizing", outcome]);
        const count = get.mock.calls.length;
        await vi.advanceTimersByTimeAsync(20000);
        expect(get).toHaveBeenCalledTimes(count);
        expect(states.at(-1)?.run?.report !== null).toBe(outcome === "completed" || outcome === "partial");
        poller.dispose();
    });
    it("pauses hidden polling and resumes with a fresh snapshot", async () => {
        vi.useFakeTimers(); vi.setSystemTime(0);
        const api = new MockResearchApi(); const { id } = await api.startRun({ question: "Question" });
        const get = vi.spyOn(api, "getRun"); const states: RunSnapshot[] = [];
        const poller = createRunPoller(api, id, s => states.push(s)); poller.setVisible(true);
        await vi.advanceTimersByTimeAsync(0); poller.setVisible(false);
        await vi.advanceTimersByTimeAsync(6000); expect(get).toHaveBeenCalledTimes(1);
        expect(states.at(-1)?.paused).toBe(true); poller.setVisible(true);
        await vi.advanceTimersByTimeAsync(0); expect(states.at(-1)?.run?.status).toBe("reading"); poller.dispose();
    });
    it("aborts pending GET and ignores late results after disposal", async () => {
        let signal: AbortSignal | undefined; let finish!: (run: ReturnType<typeof createDemoRun>) => void;
        const api = { startRun: vi.fn(), getRun: vi.fn((_id: string, next?: AbortSignal) => { signal = next; return new Promise<ReturnType<typeof createDemoRun>>(resolve => { finish = resolve; }); }) };
        const publish = vi.fn(); const poller = createRunPoller(api, "demo", publish); poller.setVisible(true);
        const count = publish.mock.calls.length; poller.dispose(); expect(signal?.aborted).toBe(true);
        finish(createDemoRun("demo", "Question", new Date().toISOString())); await Promise.resolve();
        expect(publish).toHaveBeenCalledTimes(count);
    });
    it("never overlaps automatic GET requests", async () => {
        vi.useFakeTimers();
        const api = { startRun: vi.fn(), getRun: vi.fn(() => new Promise<never>(() => {})) };
        const poller = createRunPoller(api, "demo", vi.fn()); poller.setVisible(true);
        await vi.advanceTimersByTimeAsync(30000); expect(api.getRun).toHaveBeenCalledTimes(1); poller.dispose();
    });
    it("bounds transient retries to 2, 4 and 8 seconds", async () => {
        vi.useFakeTimers();
        const api = { startRun: vi.fn(), getRun: vi.fn().mockRejectedValue(new ResearchApiError("UNAVAILABLE", "Service unavailable", 503, true)) };
        const poller = createRunPoller(api, "demo", vi.fn()); poller.setVisible(true);
        await vi.advanceTimersByTimeAsync(0); expect(api.getRun).toHaveBeenCalledTimes(1);
        await vi.advanceTimersByTimeAsync(2000); expect(api.getRun).toHaveBeenCalledTimes(2);
        await vi.advanceTimersByTimeAsync(4000); expect(api.getRun).toHaveBeenCalledTimes(3);
        await vi.advanceTimersByTimeAsync(8000); expect(api.getRun).toHaveBeenCalledTimes(4);
        await vi.advanceTimersByTimeAsync(30000); expect(api.getRun).toHaveBeenCalledTimes(4); poller.dispose();
    });
    it("does not retry a missing session but supports explicit refresh", async () => {
        vi.useFakeTimers(); const api = { startRun: vi.fn(), getRun: vi.fn().mockRejectedValue(new ResearchApiError("NOT_FOUND", "Session missing", 404)) };
        const publish = vi.fn(); const poller = createRunPoller(api, "demo", publish); poller.setVisible(true);
        await vi.advanceTimersByTimeAsync(20000); expect(api.getRun).toHaveBeenCalledTimes(1);
        expect(publish.mock.calls.at(-1)?.[0].error).toBe("Session missing");
        poller.refresh(); await vi.advanceTimersByTimeAsync(0); expect(api.getRun).toHaveBeenCalledTimes(2); poller.dispose();
    });
    it("manual terminal refresh performs one GET without restarting polling", async () => {
        vi.useFakeTimers(); const run = createDemoRun("demo", "Question", new Date().toISOString());
        const api = { startRun: vi.fn(), getRun: vi.fn().mockResolvedValue(run) };
        const poller = createRunPoller(api, "demo", vi.fn()); poller.setVisible(true); await vi.advanceTimersByTimeAsync(0);
        poller.refresh(); await vi.advanceTimersByTimeAsync(10000); expect(api.getRun).toHaveBeenCalledTimes(2); poller.dispose();
    });
});
