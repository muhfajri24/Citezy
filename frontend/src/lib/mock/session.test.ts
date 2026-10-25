import { describe, expect, it, vi } from "vitest";
import { DemoSessionApi, DEMO_STORAGE_KEY, RESTORED_QUESTION } from "./session";
import { MockResearchApi } from "@/lib/api/mock-client";
import { createRunPoller } from "@/lib/research/poller";
import { createResearchApi } from "@/lib/api/factory";
const epoch = Date.parse("2026-10-25T00:00:00Z");
function setup() {
    let raw: string | null = null, now = epoch;
    const storage = { getItem: vi.fn(() => raw), setItem: vi.fn((_: string, value: string) => { raw = value; }) };
    const memory = () => new MockResearchApi({ now: () => now, stageDurationMs: 1 });
    return { storage, memory, api: new DemoSessionApi(memory(), () => storage), setRaw: (value: string) => { raw = value; }, raw: () => raw!, advance: () => { now += 6; } };
}
describe("versioned fictional demo sessions", () => {
    it("saves a validated snapshot without storing the original question", async () => {
        const f = setup(); const { id } = await f.api.startRun({ question: "PRIVATE question not for storage" });
        expect(f.raw()).not.toContain("PRIVATE"); expect(f.raw()).toContain(RESTORED_QUESTION);
        expect((await f.api.getRun(id)).question).toContain("PRIVATE");
        expect(f.storage.setItem.mock.calls[0][0]).toBe(DEMO_STORAGE_KEY);
    });
    it.each(["completed", "partial", "failed", "cancelled"] as const)("restores %s exactly without asking a fresh adapter to invent it", async outcome => {
        const f = setup(); let now = epoch;
        const api = new DemoSessionApi(new MockResearchApi({ now: () => now, stageDurationMs: 1, outcome }), () => f.storage);
        const { id } = await api.startRun({ question: "Fictional test" }); now += 6; const saved = await api.getRun(id);
        const delegate = { startRun: vi.fn(), getRun: vi.fn() }; const restored = new DemoSessionApi(delegate, () => f.storage);
        const run = await restored.getRun(id); expect(run).toEqual({ ...saved, question: RESTORED_QUESTION });
        expect(restored.sessionState(id)).toMatchObject({ restored:true, interrupted:false }); expect(delegate.getRun).not.toHaveBeenCalled();
    });
    it("freezes an active snapshot after reload and stops automatic polling", async () => {
        vi.useFakeTimers();
        try {
            const f = setup(); const { id } = await f.api.startRun({ question:"Fictional test" }); f.advance();
            const restored = new DemoSessionApi(f.memory(), () => f.storage);
            const read = vi.spyOn(restored, "getRun"), publish = vi.fn();
            const poller = createRunPoller(restored,id,publish,()=>!restored.sessionState(id).interrupted);
            poller.setVisible(true); await vi.advanceTimersByTimeAsync(60000);
            expect(read).toHaveBeenCalledTimes(1); expect(publish.mock.calls.at(-1)?.[0].run.status).toBe("queued");
            expect(restored.sessionState(id).interrupted).toBe(true); poller.dispose();
        } finally { vi.useRealTimers(); }
    });
    it.each(['{"version":2,"runs":[]}', 'not json', '{"version":1,"runs":[{}]}'])("handles invalid/outdated storage without hydration crash: %s", async raw => {
        const f = setup(); f.setRaw(raw); await expect(f.api.getRun("demo-unknown")).rejects.toMatchObject({status:404});
        await expect(f.api.startRun({question:"Fictional test"})).resolves.toMatchObject({status:"queued"});
    });
    it("continues in memory when storage getter or quota write fails", async () => {
        const api = new DemoSessionApi(new MockResearchApi(), () => { throw new Error("Storage denied"); });
        const { id } = await api.startRun({question:"Fictional test"}); expect((await api.getRun(id)).id).toBe(id);
        expect(api.sessionState(id).storageUnavailable).toBe(true);
        const f = setup(); f.storage.setItem.mockImplementation(()=>{throw new Error("Quota");});
        await expect(f.api.startRun({question:"Fictional test"})).resolves.toBeTruthy();
    });
    it("rejects duplicate snapshot IDs rather than guessing", async () => {
        const f = setup(); await f.api.startRun({question:"Fictional test"}); const data=JSON.parse(f.raw()); data.runs.push(data.runs[0]); f.setRaw(JSON.stringify(data));
        await expect(new DemoSessionApi(f.memory(),()=>f.storage).getRun("demo-1")).rejects.toMatchObject({status:404});
    });
    it("keeps at most five snapshots", async () => {
        const f = setup(); for(let i=0;i<6;i++) await f.api.startRun({question:"Fictional test"});
        expect(JSON.parse(f.raw()).runs).toHaveLength(5);
    });
    it("does not read storage in real transport configuration or fall back", async () => {
        expect(()=>createResearchApi({mode:"real",baseUrl:""})).toThrow();
        expect(createResearchApi({mode:"real",baseUrl:"http://localhost:8000"})).not.toBeInstanceOf(DemoSessionApi);
        expect(createResearchApi({mode:"mock"})).toBeInstanceOf(MockResearchApi);
    });
    it("honors aborted restored reads", async () => {
        const f = setup(); const {id}=await f.api.startRun({question:"Fictional test"}); const controller=new AbortController();controller.abort();
        await expect(new DemoSessionApi(f.memory(),()=>f.storage).getRun(id,controller.signal)).rejects.toBeTruthy();
    });
});
