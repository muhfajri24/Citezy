import { afterEach, describe, expect, it, vi } from "vitest";
import fixtures from "./test-fixtures/fastapi-runs.json";
import { HttpResearchApi } from "./real-client";
import { parseRun } from "./validation";
import { inspectIntegrity, resolveEvidence } from "@/lib/utils/integrity";
import { createRunPoller, type RunSnapshot } from "@/lib/research/poller";
import { validateQuestion } from "@/lib/landing/research-submission";

// Test-only snapshots serialized by the actual backend Pydantic models; never imported by app routes.
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
describe("FastAPI contract integration", () => {
    it.each(fixtures.runs)("accepts backend nullable fields and $status", async snapshot => {
        const api = new HttpResearchApi("http://localhost:8000", { fetch: vi.fn<typeof fetch>().mockResolvedValue(json(snapshot)) });
        const run = await api.getRun(snapshot.id);
        expect(run).toEqual(snapshot); expect(inspectIntegrity(run)).toEqual([]);
        if (run.report) expect(resolveEvidence(run, "c-test", "e-test").available).toBe(true);
    });
    it("validates health without claiming inference readiness", async () => {
        const fetcher = vi.fn<typeof fetch>().mockResolvedValue(json({ status: "ok" }));
        const api = new HttpResearchApi("http://localhost:8000", { fetch: fetcher });
        expect(await api.getHealth()).toEqual({ status: "ok" });
        expect(fetcher).toHaveBeenCalledExactlyOnceWith("http://localhost:8000/api/health", expect.objectContaining({ cache: "no-store", method: "GET" }));
    });
    it.each([null, {}, { status: "ready" }])("rejects invalid health %#", async value => {
        const api = new HttpResearchApi("http://localhost:8000", { fetch: vi.fn<typeof fetch>().mockResolvedValue(json(value)) });
        await expect(api.getHealth()).rejects.toMatchObject({ error: { code: "INVALID_RESPONSE" } });
    });
    it.each([400,404,422,429,500])("handles HTTP %s without exposing either backend error envelope", async status => {
        for (const body of [{ error: { code: "INTERNAL", message: "TEST PRIVATE MESSAGE", retryable: true } }, { detail: [{ msg: "TEST PRIVATE MESSAGE" }] }]) {
            const api = new HttpResearchApi("http://localhost:8000", { fetch: vi.fn<typeof fetch>().mockResolvedValue(json(body,status)) });
            const error = await api.startRun({ question: "TEST ONLY" }).catch(e => e);
            expect(error.status).toBe(status); expect(error.message).not.toContain("TEST PRIVATE");
            if (status === 422) expect(error.error.code).toBe("VALIDATION_ERROR");
        }
    });
    it("does not turn a browser CORS/network rejection into demo output or raw logs", async () => {
        const log = vi.spyOn(console, "error");
        const api = new HttpResearchApi("http://localhost:8000", { fetch: vi.fn<typeof fetch>().mockRejectedValue(new TypeError("TEST PRIVATE network detail")) });
        await expect(api.getRun("id")).rejects.toMatchObject({ error: { code: "NETWORK_ERROR" } });
        expect(log).not.toHaveBeenCalled();
    });
    it("polls POST 202 identity through active and terminal HTTP snapshots", async () => {
        vi.useFakeTimers();
        const [queued,reading,completed] = fixtures.runs;
        const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(json({ id: queued.id, status: "queued" },202))
            .mockResolvedValueOnce(json(queued)).mockResolvedValueOnce(json(reading)).mockResolvedValueOnce(json(completed));
        const api = new HttpResearchApi("http://localhost:8000",{ fetch: fetcher });
        const { id } = await api.startRun({ question: queued.question });
        const states: RunSnapshot[] = []; const poller = createRunPoller(api,id,s=>states.push(s)); poller.setVisible(true);
        await vi.advanceTimersByTimeAsync(30000);
        expect(states.filter(s=>!s.loading).map(s=>s.run?.status)).toEqual(["queued","reading","completed"]);
        expect(fetcher).toHaveBeenCalledTimes(4); poller.dispose();
    });
    it("rejects missing start IDs and keeps invalid evidence relationships unavailable", async () => {
        const api = new HttpResearchApi("http://localhost:8000",{fetch:vi.fn<typeof fetch>().mockResolvedValue(json({status:"queued"},202))});
        await expect(api.startRun({question:"TEST ONLY"})).rejects.toMatchObject({error:{code:"INVALID_RESPONSE"}});
        const run = structuredClone(parseRun(fixtures.runs[2])); run.evidence[0].source_id="missing";
        expect(resolveEvidence(run,"c-test","e-test").available).toBe(false);
    });
    it("matches Pydantic code-point lengths at input boundaries", () => {
        for (const question of ["abc", "x".repeat(1000), "😀".repeat(1000)]) expect(validateQuestion(question)).toBeNull();
        for (const question of ["ab", "x".repeat(1001), "😀".repeat(1001)]) expect(validateQuestion(question)).toBeTypeOf("string");
    });
});
