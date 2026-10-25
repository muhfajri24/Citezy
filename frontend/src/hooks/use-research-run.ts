"use client";
import { useEffect, useRef, useState } from "react";
import { getResearchApi } from "@/lib/api/factory";
import { createRunPoller, type RunSnapshot } from "@/lib/research/poller";
import { DemoSessionApi } from "@/lib/mock/session";
export function useResearchRun(id: string) {
    const [state, setState] = useState<RunSnapshot>({ run: null, error: null, loading: true, paused: false });
    const poller = useRef<ReturnType<typeof createRunPoller> | null>(null);
    useEffect(() => {
        let current: ReturnType<typeof createRunPoller>;
        try { const api = getResearchApi(); current = createRunPoller(api, id, setState, () => !(api instanceof DemoSessionApi && api.sessionState(id).interrupted)); }
        catch { queueMicrotask(() => setState({ run: null, error: "Research service configuration is unavailable. Check the data mode and API URL.", loading: false, paused: false })); return; }
        poller.current = current;
        const visibility = () => current.setVisible(document.visibilityState === "visible");
        visibility();
        document.addEventListener("visibilitychange", visibility);
        return () => { current.dispose(); poller.current = null; document.removeEventListener("visibilitychange", visibility); };
    }, [id]);
    let session = { restored: false, interrupted: false, storageUnavailable: false };
    if (typeof window !== "undefined") {
        try { const api = getResearchApi(); if (api instanceof DemoSessionApi) session = api.sessionState(id); } catch { /* Existing configuration error is reported by the effect. */ }
    }
    return { ...state, session, refresh: () => poller.current?.refresh() };
}
