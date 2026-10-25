let sequence = 0;

/** Opaque demo IDs are not credentials. LAN HTTP may not provide randomUUID. */
export function createBrowserDemoId() {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid) return `demo-${uuid}`;
    return `demo-${Date.now().toString(36)}-${(++sequence).toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
