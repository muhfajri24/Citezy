import type { ResearchApi } from "@/lib/api/interface";
import { isTerminal } from "@/lib/api/interface";
import { ResearchApiError } from "@/lib/api/errors";
import type { ResearchRun } from "@/types/research";

export interface RunSnapshot { run: ResearchRun | null; error: string | null; loading: boolean; paused: boolean }
/** Sequential GET polling; visibility, disposal and terminal results stop pending work. */
export function createRunPoller(api: ResearchApi, id: string, publish: (state: RunSnapshot) => void, shouldContinue = () => true) {
    let state: RunSnapshot = { run: null, error: null, loading: true, paused: false };
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    let visible = false, disposed = false, failures = 0, generation = 0;
    const emit = (patch: Partial<RunSnapshot>) => { state = { ...state, ...patch }; publish(state); };
    const cancel = () => { generation++; clearTimeout(timer); timer = undefined; controller?.abort(); controller = undefined; };
    async function read(force = false) {
        if (disposed || !visible || controller || (!force && state.run && isTerminal(state.run.status))) return;
        const token = generation;
        controller = new AbortController();
        emit({ loading: true });
        let delay: number | null = null;
        try {
            const run = await api.getRun(id, controller.signal);
            if (disposed || token !== generation) return;
            failures = 0;
            emit({ run, error: null, loading: false });
            if (!isTerminal(run.status) && shouldContinue()) delay = 2000;
        } catch (error) {
            if (disposed || token !== generation) return;
            const known = error instanceof ResearchApiError;
            const retry = known && error.error.retryable && failures < 3;
            emit({ error: known ? error.message : "This research run could not be loaded. Please try again.", loading: false });
            if (retry) delay = 2000 * 2 ** failures++;
        } finally {
            if (token === generation) {
                controller = undefined;
                if (delay !== null && visible && !disposed) timer = setTimeout(() => { timer = undefined; void read(); }, delay);
            }
        }
    }
    return {
        setVisible(next: boolean) {
            if (disposed || visible === next) return;
            visible = next;
            if (!next) cancel();
            emit({ paused: !next, loading: next && !state.run });
            if (next) void read();
        },
        refresh() { if (disposed) return; cancel(); failures = 0; void read(true); },
        dispose() { disposed = true; cancel(); },
    };
}
