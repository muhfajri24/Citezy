import type { KeyboardEvent } from "react";

/** Keep focus inside a native modal, including dynamically disabled/hidden controls. */
export function trapDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')]
        .filter(node => !node.closest('[inert], [hidden], [aria-hidden="true"]') && node.getClientRects().length > 0);
    const first = controls[0], last = controls.at(-1);
    if (!first) { event.preventDefault(); event.currentTarget.focus(); return; }
    const active = event.currentTarget.ownerDocument.activeElement;
    if (event.shiftKey && (active === first || !controls.includes(active as HTMLElement))) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && (active === last || !controls.includes(active as HTMLElement))) { event.preventDefault(); first.focus(); }
}

export function restoreDialogFocus(node: HTMLElement | null) {
    if (node?.isConnected && node.getClientRects().length && !node.closest('[inert], [hidden], [aria-hidden="true"]')) node.focus();
}
