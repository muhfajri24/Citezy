import { afterEach, describe, expect, it, vi } from "vitest";
import { createDemoRun } from "@/lib/mock/fixture";
import { inspectIntegrity, resolveEvidence } from "@/lib/utils/integrity";
import { createResearchApi } from "./factory";
import { isTerminal } from "./interface";
import { MockResearchApi } from "./mock-client";
import { HttpResearchApi } from "./real-client";
import { parseRun, parseStartResponse } from "./validation";
const epoch = Date.parse("2026-10-24T00:00:00Z");
const fixture = () => createDemoRun("run-1", "DEMO ONLY — compare fictional methods", new Date(epoch).toISOString());
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
function clientWith(data: unknown, status = 200) {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(data, status));
    return { api: new HttpResearchApi("http://localhost:8000/", { fetch: fetcher }), fetcher };
}
afterEach(() => vi.useRealTimers());
describe("domain and integrity", () => {
    it("validates clearly fictional, linked data with every assessment and null fields", () => {
        const run = parseRun(fixture());
        expect(run.sources).toHaveLength(3);
        expect(run.sources.every((source) => source.title.includes("DEMO ONLY") && new URL(source.url).hostname === "example.org")).toBe(true);
        expect(new Set(run.report!.claims.map((claim) => claim.assessment)).size).toBe(3);
        expect(run.report!.comparison[1].result).toBeNull();
        expect(run.report!.comparison[1].comparability_warning).toBeTruthy();
        expect(inspectIntegrity(run)).toEqual([]);
        expect(resolveEvidence(run, "c1", "e1").available).toBe(true);
    });
    it.each([null, {}, { ...fixture(), status: "verified" }, { ...fixture(), created_at: "yesterday" }, { ...fixture(), report: { claims: [] } }])("rejects invalid run shape %#", (value) => {
        expect(() => parseRun(value)).toThrow("invalid response");
    });
    it("rejects nested enum, optional value, offset and URL errors", () => {
        const invalid = [fixture(), fixture(), fixture(), fixture()];
        invalid[0].sources[0].access_status = "secret" as never;
        invalid[1].sources[0].year = "unknown" as never;
        invalid[2].evidence[0].match_offset = -1;
        invalid[3].sources[0].url = "javascript:alert(1)";
        for (const run of invalid)
            expect(() => parseRun(run)).toThrow();
    });
    it("allows partial and absent reports without inventing data", () => {
        expect(parseRun({ ...fixture(), status: "partial", report: null }).report).toBeNull();
        const { report: omitted, ...withoutReport } = fixture();
        expect(omitted).toBeTruthy();
        expect(parseRun(withoutReport).report).toBeUndefined();
    });
    it("rejects non-start statuses and historical envelopes", () => {
        expect(() => parseStartResponse({ id: "x", status: "completed" })).toThrow();
        expect(() => parseStartResponse({ success: true, data: { run_id: "x" } })).toThrow();
    });
    it("diagnoses missing evidence, sources, claims and comparison references", () => {
        const run = fixture();
        run.report!.claims[0].evidence_ids.push("missing-evidence");
        run.evidence[1].source_id = "missing-source";
        run.evidence[2].claim_id = "missing-claim";
        run.report!.comparison[0].claim_ids.push("missing-row-claim");
        expect(inspectIntegrity(run).filter((issue) => issue.code === "missing_reference")).toHaveLength(4);
        expect(resolveEvidence(run, "c1", "missing-evidence")).toEqual({ available: false, reason: "missing_evidence" });
        expect(resolveEvidence(run, "c2", "e2")).toEqual({ available: false, reason: "missing_source" });
        expect(resolveEvidence(run, "c3", "e3")).toEqual({ available: false, reason: "mismatched_claim" });
    });
    it("does not resolve duplicate identifiers or unlinked evidence", () => {
        const run = fixture();
        run.evidence.push({ ...run.evidence[0] });
        expect(inspectIntegrity(run).some((issue) => issue.code === "duplicate_id")).toBe(true);
        expect(resolveEvidence(run, "c1", "e1").available).toBe(false);
        expect(resolveEvidence(fixture(), "c1", "e2").available).toBe(false);
    });
    it("handles restricted, empty and mismatched evidence honestly", () => {
        const run = fixture();
        run.sources[0].access_status = "restricted";
        expect(resolveEvidence(run, "c1", "e1")).toEqual({ available: false, reason: "source_unavailable" });
        run.sources[0].access_status = "accessible";
        run.evidence[0].excerpt = " ";
        expect(resolveEvidence(run, "c1", "e1").available).toBe(false);
        run.report!.claims[0].evidence_ids = [];
        expect(inspectIntegrity(run).some((issue) => issue.code === "mismatched_claim")).toBe(true);
    });
});
describe("mock lifecycle", () => {
    it("advances deterministically through every stage, then stays terminal", async () => {
        let now = epoch;
        const api = new MockResearchApi({ now: () => now, stageDurationMs: 100 });
        const started = await api.startRun({ question: "  fictional methods  " });
        const statuses = ["queued", "planning", "searching", "reading", "verifying", "synthesizing", "completed"];
        for (let i = 0; i < statuses.length; i++) {
            now = epoch + i * 100;
            const run = await api.getRun(started.id);
            expect(parseRun(run).status).toBe(statuses[i]);
            expect(run.question).toBe("fictional methods");
            expect(run.steps.filter((step) => step.status === "running")).toHaveLength(i > 0 && i < 6 ? 1 : 0);
            expect(run.report === null).toBe(i < 6);
            expect(inspectIntegrity(run)).toEqual([]);
        }
        const terminal = await api.getRun(started.id);
        now += 99999;
        expect(await api.getRun(started.id)).toEqual(terminal);
        terminal.sources.length = 0;
        expect((await api.getRun(started.id)).sources).toHaveLength(3);
    });
    it.each(["completed", "partial", "failed", "cancelled"] as const)("supports terminal %s", async (outcome) => {
        let now = epoch;
        const api = new MockResearchApi({ now: () => now, stageDurationMs: 10, outcome });
        const { id } = await api.startRun({ question: "demo" });
        now += 60;
        const run = await api.getRun(id);
        expect(run.status).toBe(outcome);
        expect(isTerminal(run.status)).toBe(true);
        expect(run.finished_at).toBe(new Date(now).toISOString());
        expect(Boolean(run.report)).toBe(outcome === "completed" || outcome === "partial");
        expect(inspectIntegrity(run)).toEqual([]);
    });
    it("rejects empty questions and unknown IDs", async () => {
        const api = new MockResearchApi();
        await expect(api.startRun({ question: "  " })).rejects.toMatchObject({ status: 400 });
        await expect(api.getRun("unknown")).rejects.toMatchObject({ status: 404 });
    });
    it("keeps runs independent and supports abort", async () => {
        const api = new MockResearchApi();
        const first = await api.startRun({ question: "one" });
        const second = await api.startRun({ question: "two" });
        expect(first.id).not.toBe(second.id);
        expect((await api.getRun(first.id)).question).toBe("one");
        await expect(api.getRun(first.id, AbortSignal.abort())).rejects.toThrow();
    });
});
describe("configuration", () => {
    it("defaults to mock without using fetch", async () => {
        const fetcher = vi.spyOn(globalThis, "fetch");
        const api = createResearchApi({});
        expect(api).toBeInstanceOf(MockResearchApi);
        await api.startRun({ question: "demo" });
        expect(fetcher).not.toHaveBeenCalled();
        fetcher.mockRestore();
    });
    it("selects real mode explicitly", () => {
        expect(createResearchApi({ mode: "real", baseUrl: "http://localhost:8000" })).toBeInstanceOf(HttpResearchApi);
    });
    it.each([{ mode: "unknown" }, { mode: "real" }, { mode: "real", baseUrl: "file:///etc/passwd" }, { mode: "real", baseUrl: "https://user:secret@example.org" }, { mode: "real", baseUrl: "https://example.org?key=secret" }])("rejects invalid config without falling back %#", (config) => {
        expect(() => createResearchApi(config)).toThrow();
    });
});
describe("HTTP adapter", () => {
    it("posts the exact request once with JSON headers", async () => {
        const { api, fetcher } = clientWith({ id: "x", status: "queued" }, 202);
        expect(await api.startRun({ question: "demo" })).toEqual({ id: "x", status: "queued" });
        expect(fetcher).toHaveBeenCalledExactlyOnceWith("http://localhost:8000/api/runs", expect.objectContaining({ method: "POST", headers: { "Content-Type": "application/json" }, body: '{"question":"demo"}' }));
    });
    it("fetches status with no-store and validates it", async () => {
        const { api, fetcher } = clientWith(fixture());
        expect(await api.getRun("run-1")).toEqual(fixture());
        expect(fetcher).toHaveBeenCalledWith("http://localhost:8000/api/runs/run-1", expect.objectContaining({ cache: "no-store", method: "GET", signal: expect.any(AbortSignal) }));
    });
    it("encodes opaque IDs", async () => {
        const { api, fetcher } = clientWith({ ...fixture(), id: "a/b?c" });
        await api.getRun("a/b?c");
        expect(fetcher.mock.calls[0][0]).toBe("http://localhost:8000/api/runs/a%2Fb%3Fc");
    });
    it.each([[400, "VALIDATION_ERROR"], [404, "NOT_FOUND"], [429, "RATE_LIMITED"], [500, "UNAVAILABLE"], [502, "UNAVAILABLE"], [503, "UNAVAILABLE"]])("maps HTTP %s safely without retry", async (status, code) => {
        const { api, fetcher } = clientWith({ error: { code: "SECRET", message: "private-key-value" } }, status as number);
        await expect(api.startRun({ question: "demo" })).rejects.toMatchObject({ error: { code }, status });
        expect(fetcher).toHaveBeenCalledTimes(1);
    });
    it("never falls back after real transport failure", async () => {
        const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new Error("private endpoint details"));
        const api = new HttpResearchApi("https://example.org", { fetch: fetcher });
        await expect(api.getRun("x")).rejects.toMatchObject({ error: { code: "NETWORK_ERROR", message: "Cannot reach the research service. Please check your connection." } });
    });
    it("handles invalid JSON", async () => {
        const api = new HttpResearchApi("https://example.org", { fetch: vi.fn<typeof fetch>().mockResolvedValue(new Response("not JSON")) });
        await expect(api.getRun("x")).rejects.toMatchObject({ error: { code: "INVALID_JSON" } });
    });
    it("handles invalid shape and mismatched run IDs", async () => {
        await expect(clientWith({}).api.getRun("x")).rejects.toMatchObject({ error: { code: "INVALID_RESPONSE" } });
        await expect(clientWith(fixture()).api.getRun("x")).rejects.toMatchObject({ error: { code: "INVALID_RESPONSE" } });
    });
    it("retains partial data and reports safe reference diagnostics", async () => {
        const run = { ...fixture(), status: "partial" };
        run.evidence[0].source_id = "missing";
        const diagnostics = vi.fn();
        const api = new HttpResearchApi("https://example.org", { fetch: vi.fn<typeof fetch>().mockResolvedValue(response(run)), onIntegrityIssues: diagnostics });
        const result = await api.getRun("run-1");
        expect(result.status).toBe("partial");
        expect(diagnostics).toHaveBeenCalled();
        expect(resolveEvidence(result, "c1", "e1").available).toBe(false);
    });
    function pendingFetch() {
        return vi.fn<typeof fetch>().mockImplementation((_url, init) => new Promise((_resolve, reject) => {
            const abort = () => reject(new DOMException("Aborted", "AbortError"));
            if (init?.signal?.aborted)
                abort();
            else
                init?.signal?.addEventListener("abort", abort, { once: true });
        }));
    }
    it("times out and cleans up timers", async () => {
        vi.useFakeTimers();
        const api = new HttpResearchApi("https://example.org", { fetch: pendingFetch(), timeoutMs: 100 });
        const checked = expect(api.getRun("x")).rejects.toMatchObject({ error: { code: "TIMEOUT" } });
        await vi.advanceTimersByTimeAsync(100);
        await checked;
        expect(vi.getTimerCount()).toBe(0);
    });
    it("cancels in-flight requests and removes signal listeners", async () => {
        vi.useFakeTimers();
        const controller = new AbortController();
        const remove = vi.spyOn(controller.signal, "removeEventListener");
        const api = new HttpResearchApi("https://example.org", { fetch: pendingFetch() });
        const checked = expect(api.getRun("x", controller.signal)).rejects.toMatchObject({ error: { code: "ABORTED" } });
        controller.abort();
        await checked;
        expect(remove).toHaveBeenCalledWith("abort", expect.any(Function));
        expect(vi.getTimerCount()).toBe(0);
    });
    it("cleans timers on successful calls", async () => {
        vi.useFakeTimers();
        await clientWith(fixture()).api.getRun("run-1");
        expect(vi.getTimerCount()).toBe(0);
    });
});


describe("wire validation regressions", () => {
    it.each(["2026-02-30T00:00:00Z", "2026-10-24T24:00:00Z", "2026-10-24T00:00:00+00:00"])("rejects invalid or noncanonical UTC timestamp %s", (created_at) => {
        expect(() => parseRun({ ...fixture(), created_at })).toThrow("invalid response");
    });
    it.each(["2024-02-29T00:00:00Z", "2026-10-24T00:00:00.123456Z", "2026-10-24T00:00Z"])("accepts valid UTC timestamp %s", (created_at) => {
        expect(parseRun({ ...fixture(), created_at }).created_at).toBe(created_at);
    });
    it.each([".", ".."])("rejects dot-segment ID %s before fetch", async (id) => {
        const { api, fetcher } = clientWith(fixture());
        await expect(api.getRun(id)).rejects.toMatchObject({ error: { code: "NOT_FOUND" } });
        expect(fetcher).not.toHaveBeenCalled();
    });
});
