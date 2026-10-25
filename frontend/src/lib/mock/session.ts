import type { ResearchApi } from "@/lib/api/interface";
import type { ResearchRun, StartRunRequest } from "@/types/research";
import { isTerminal } from "@/lib/api/interface";
import { parseRun } from "@/lib/api/validation";

export const DEMO_STORAGE_KEY = "citezy.demo.sessions.v1";
export const RESTORED_QUESTION = "DEMO ONLY: Restored fictional session. Your original question was not stored.";
type StoragePort = Pick<Storage, "getItem" | "setItem">;
export type DemoSessionState = { restored: boolean; interrupted: boolean; storageUnavailable: boolean };
/** Browser-only wrapper. Saves fictional snapshots, never the user's question or API configuration. */
export class DemoSessionApi implements ResearchApi {
    private snapshots = new Map<string, ResearchRun>();
    private restored = new Set<string>();
    private live = new Set<string>();
    private hydrated = false;
    private unavailable = false;
    private lastWritten = "";
    constructor(private api: ResearchApi, private storage: () => StoragePort) {}
    private hydrate() {
        if (this.hydrated) return;
        this.hydrated = true;
        try {
            const raw = this.storage().getItem(DEMO_STORAGE_KEY);
            if (!raw) return;
            if (raw.length > 300000) return;
            const data = JSON.parse(raw);
            if (data?.version !== 1 || !Array.isArray(data.runs) || data.runs.length > 5) return;
            const runs: ResearchRun[] = data.runs.map((value: unknown) => parseRun(value));
            if (new Set(runs.map(run => run.id)).size !== runs.length) return;
            if (runs.some(run => !run.id.startsWith("demo-") || run.question !== RESTORED_QUESTION)) return;
            for (const run of runs) { this.snapshots.set(run.id, run); this.restored.add(run.id); }
        } catch { this.unavailable = true; }
    }
    private save(run: ResearchRun) {
        this.snapshots.delete(run.id);
        this.snapshots.set(run.id, { ...run, question: RESTORED_QUESTION });
        while (this.snapshots.size > 5) {
            const oldest = this.snapshots.keys().next().value!;
            this.snapshots.delete(oldest); this.restored.delete(oldest);
        }
        try {
            const serialized = JSON.stringify({ version: 1, runs: [...this.snapshots.values()] });
            if (serialized !== this.lastWritten) {
                this.storage().setItem(DEMO_STORAGE_KEY, serialized);
                this.lastWritten = serialized;
            }
        }
        catch { this.unavailable = true; }
    }
    sessionState(id: string): DemoSessionState {
        const run = this.snapshots.get(id);
        return { restored: this.restored.has(id), interrupted: !!run && this.restored.has(id) && !isTerminal(run.status), storageUnavailable: this.unavailable };
    }
    async startRun(request: StartRunRequest) {
        this.hydrate();
        const response = await this.api.startRun(request);
        this.live.add(response.id);
        // Capture the actual initial mock snapshot, without advancing its clock.
        this.save(await this.api.getRun(response.id));
        return response;
    }
    async getRun(id: string, signal?: AbortSignal): Promise<ResearchRun> {
        signal?.throwIfAborted();
        this.hydrate();
        if (!this.live.has(id) && this.restored.has(id)) return this.snapshots.get(id)!;
        const run = await this.api.getRun(id, signal);
        this.save(run);
        return run;
    }
}
