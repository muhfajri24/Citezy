import { describe, expect, it, vi, afterEach } from "vitest";
import { HttpResearchApi, parseRetryAfter } from "./real-client";
import { createRunPoller } from "@/lib/research/poller";
import { ResearchApiError } from "./errors";
import { runFailureMessage } from "@/lib/research/failure-message";

afterEach(() => vi.useRealTimers());
describe("release failure behavior", () => {
    it("shows only allowlisted pipeline explanations", () => {
        expect(runFailureMessage("MODEL_NOT_CONFIGURED")).toContain("configure Nemotron");
        expect(runFailureMessage("PRIVATE secret exception")).not.toContain("PRIVATE");
        expect(runFailureMessage(null)).toBeNull();
    });
    it("parses bounded Retry-After seconds and dates", () => {
        expect(parseRetryAfter("10")).toBe(10000);
        expect(parseRetryAfter("999999")).toBe(300000);
        expect(parseRetryAfter("Wed, 01 Jan 2025 00:00:10 GMT", Date.parse("2025-01-01T00:00:00Z"))).toBe(10000);
        expect(parseRetryAfter("garbage")).toBeUndefined();
        expect(parseRetryAfter("-1")).toBeUndefined();
        expect(parseRetryAfter(null)).toBeUndefined();
    });
    it("propagates Retry-After without rendering vendor response body", async () => {
        const api = new HttpResearchApi("https://api.test", { fetch: async () => new Response("PRIVATE vendor error", {status:429, headers:{"Retry-After":"60"}}) });
        await expect(api.getRun("run-1")).rejects.toMatchObject({ retryAfterMs:60000, status:429 });
        await expect(api.getRun("run-1")).rejects.not.toThrow("PRIVATE");
    });
    it("honors caller cancellation for POST without retrying it", async () => {
        const controller = new AbortController();
        const fetcher = vi.fn<typeof fetch>((_url, init) => new Promise((_resolve,reject) => init?.signal?.addEventListener("abort", () => reject(new Error("abort")))));
        const api = new HttpResearchApi("https://api.test", {fetch:fetcher});
        const promise = api.startRun({question:"question"}, controller.signal);
        controller.abort();
        await expect(promise).rejects.toMatchObject({error:{code:"ABORTED"}});
        expect(fetcher).toHaveBeenCalledTimes(1);
    });
    it("does not retry throttled polls ahead of Retry-After", async () => {
        vi.useFakeTimers();
        const api = {startRun:vi.fn(), getRun:vi.fn().mockRejectedValue(new ResearchApiError("RATE_LIMITED","Wait",429,true,60000))};
        const poller = createRunPoller(api,"run-1",vi.fn());
        poller.setVisible(true);
        await vi.advanceTimersByTimeAsync(59999);
        expect(api.getRun).toHaveBeenCalledTimes(1);
        await vi.advanceTimersByTimeAsync(1);
        expect(api.getRun).toHaveBeenCalledTimes(2);
        poller.dispose();
        await vi.advanceTimersByTimeAsync(300000);
        expect(api.getRun).toHaveBeenCalledTimes(2);
    });
});
