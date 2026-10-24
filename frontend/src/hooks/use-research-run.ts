"use client";
import { useEffect, useRef, useState } from "react";
import { getDemoResearchApi } from "@/lib/api/demo-client";
import { createRunPoller, type RunSnapshot } from "@/lib/research/poller";
export function useResearchRun(id: string) {
    const [state, setState] = useState<RunSnapshot>({ run: null, error: null, loading: true, paused: false });
    const poller = useRef<ReturnType<typeof createRunPoller> | null>(null);
    useEffect(() => {
        let current: ReturnType<typeof createRunPoller>;
        try { current = createRunPoller(getDemoResearchApi(), id, setState); }
        catch { queueMicrotask(() => setState({ run: null, error: "This workspace requires mock data mode. No live API was called.", loading: false, paused: false })); return; }
        poller.current = current;
        const visibility = () => current.setVisible(document.visibilityState === "visible");
        visibility();
        document.addEventListener("visibilitychange", visibility);
        return () => { current.dispose(); poller.current = null; document.removeEventListener("visibilitychange", visibility); };
    }, [id]);
    return { ...state, refresh: () => poller.current?.refresh() };
}
