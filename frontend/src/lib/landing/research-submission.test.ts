import { afterEach, describe, expect, it, vi } from "vitest";
import type { ResearchApi } from "@/lib/api/interface";
import { ResearchApiError } from "@/lib/api/errors";
import { MockResearchApi } from "@/lib/api/mock-client";
import { getDemoResearchApi } from "@/lib/api/demo-client";
import { createSubmissionController, EXAMPLE_QUESTIONS, validateQuestion } from "./research-submission";

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
const question = "Compare LoRA with full fine-tuning for adapting language models.";
function fakeApi(startRun = vi.fn<ResearchApi["startRun"]>().mockResolvedValue({ id: "demo-1", status: "queued" })) {
    return { startRun, getRun: vi.fn<ResearchApi["getRun"]>() } satisfies ResearchApi;
}

describe("demo question validation", () => {
    it.each(["", "   ", "xx", "x".repeat(1001)])("rejects invalid input %#", (value) => {
        expect(validateQuestion(value)).toBeTypeOf("string");
    });
    it.each(["x".repeat(3), "x".repeat(1000), "   " + question + "   "])("accepts boundary/trimmed input %#", (value) => {
        expect(validateQuestion(value)).toBeNull();
    });
    it("provides three valid example questions", () => {
        expect(EXAMPLE_QUESTIONS).toHaveLength(3);
        for (const example of EXAMPLE_QUESTIONS) expect(validateQuestion(example.question)).toBeNull();
    });
});

describe("submission lifecycle", () => {
    it("rejects invalid input without calling the API or navigating", async () => {
        const api = fakeApi();
        const navigate = vi.fn();
        const submission = createSubmissionController(() => api, navigate);
        expect((await submission.submit(" ")).kind).toBe("error");
        expect(api.startRun).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
    });
    it("trims the question and navigates to the encoded run route", async () => {
        const api = fakeApi(vi.fn<ResearchApi["startRun"]>().mockResolvedValue({ id: "demo/a?b", status: "queued" }));
        const navigate = vi.fn();
        const submission = createSubmissionController(() => api, navigate);
        expect(await submission.submit(`  ${question}  `)).toEqual({ kind: "started", id: "demo/a?b" });
        expect(api.startRun).toHaveBeenCalledWith({ question });
        expect(navigate).toHaveBeenCalledWith("/research/demo%2Fa%3Fb");
    });
    it("blocks duplicate requests during submission and navigation", async () => {
        let resolve!: (response: { id: string; status: "queued" }) => void;
        const api = fakeApi(vi.fn<ResearchApi["startRun"]>().mockImplementation(() => new Promise((done) => { resolve = done; })));
        const navigate = vi.fn();
        const submission = createSubmissionController(() => api, navigate);
        const first = submission.submit(question);
        expect(await submission.submit(question)).toEqual({ kind: "busy" });
        expect(navigate).not.toHaveBeenCalled();
        resolve({ id: "demo-1", status: "queued" });
        await first;
        expect(await submission.submit(question)).toEqual({ kind: "busy" });
        expect(api.startRun).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledTimes(1);
    });
    it("presents a safe error, releases the lock and permits explicit retry", async () => {
        const api = fakeApi(vi.fn<ResearchApi["startRun"]>().mockRejectedValueOnce(new Error("private key value should never appear")).mockResolvedValueOnce({ id: "demo-2", status: "queued" }));
        const navigate = vi.fn();
        const submission = createSubmissionController(() => api, navigate);
        const failed = await submission.submit(question);
        expect(failed).toMatchObject({ kind: "error", message: expect.stringContaining("try again") });
        expect(JSON.stringify(failed)).not.toContain("private key");
        expect(navigate).not.toHaveBeenCalled();
        expect((await submission.submit(question)).kind).toBe("started");
        expect(api.startRun).toHaveBeenCalledTimes(2);
    });
    it("handles factory/configuration failure without navigating", async () => {
        const navigate = vi.fn();
        const submission = createSubmissionController(() => { throw new ResearchApiError("DEMO_MODE_REQUIRED", "internal"); }, navigate);
        expect(await submission.submit(question)).toMatchObject({ kind: "error", message: expect.stringContaining("mock") });
        expect(navigate).not.toHaveBeenCalled();
    });
    it("handles navigation failure and allows retry", async () => {
        const api = fakeApi();
        const navigate = vi.fn().mockImplementationOnce(() => { throw new Error("navigation failed"); });
        const submission = createSubmissionController(() => api, navigate);
        expect((await submission.submit(question)).kind).toBe("error");
        expect((await submission.submit(question)).kind).toBe("started");
    });
    it("creates a real mock run accessible through the same adapter, without fetch", async () => {
        const fetcher = vi.spyOn(globalThis, "fetch");
        const api = new MockResearchApi({ now: () => Date.parse("2026-10-24T00:00:00Z") });
        const navigate = vi.fn();
        const result = await createSubmissionController(() => api, navigate).submit(question);
        expect(result.kind).toBe("started");
        if (result.kind !== "started") throw new Error("Expected a started demo");
        const run = await api.getRun(result.id);
        expect(run.question).toBe(question);
        expect(run.status).toBe("queued");
        expect(navigate).toHaveBeenCalledWith(`/research/${result.id}`);
        expect(fetcher).not.toHaveBeenCalled();
    });
});

describe("Phase 3 transport boundary", () => {
    it("permits a new request when a preserved landing form is shown again", async () => {
        const api = new MockResearchApi();
        const submission = createSubmissionController(() => api, vi.fn());
        expect((await submission.submit(question)).kind).toBe("started");
        expect((await submission.submit(question)).kind).toBe("busy");
        submission.reset();
        expect((await submission.submit(question)).kind).toBe("started");
    });
    it("shares one mock instance for creation and receipt lookup", async () => {
        vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "mock");
        const api = getDemoResearchApi();
        const started = await api.startRun({ question });
        expect(getDemoResearchApi()).toBe(api);
        expect((await getDemoResearchApi().getRun(started.id)).question).toBe(question);
    });
    it.each(["real", "invalid", ""])("rejects %s mode without backend calls or silent fallback", (mode) => {
        vi.stubEnv("NEXT_PUBLIC_DATA_MODE", mode);
        const fetcher = vi.spyOn(globalThis, "fetch");
        expect(() => getDemoResearchApi()).toThrow("requires mock");
        expect(fetcher).not.toHaveBeenCalled();
    });
});
