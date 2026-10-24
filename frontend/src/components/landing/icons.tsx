import type { SVGProps } from "react";
export function ArrowIcon(props: SVGProps<SVGSVGElement>) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;
}
export function ExternalIcon(props: SVGProps<SVGSVGElement>) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}><path d="M7 17 17 7M7 7h10v10" /></svg>;
}
export function MarkIcon(props: SVGProps<SVGSVGElement>) {
    return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><path d="M22 7a11 11 0 1 0 0 18M10 12h13M10 17h9" /><circle cx="25" cy="24" r="2" fill="currentColor" stroke="none" /></svg>;
}
export function EvidenceIcon({ kind }: { kind: "link" | "source" | "compare" }) {
    return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        {kind === "link" ? <><path d="m13 19 6-6m-9 3-2 2a5 5 0 0 0 7 7l4-4m3-5 2-2a5 5 0 0 0-7-7l-4 4" /></> : kind === "source" ? <><path d="M8 5h12l5 5v17H8zM19 5v6h6M12 15h9m-9 5h7" /></> : <><path d="M5 8h22M5 16h22M5 24h22M14 5v22" /><circle cx="23" cy="8" r="2" fill="currentColor" /></>}
    </svg>;
}
