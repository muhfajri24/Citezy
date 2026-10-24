import type { ClaimAssessment, ResearchRun, ResearchSource } from "@/types/research";
import { resolveEvidence } from "@/lib/utils/integrity";
export const WORKSPACE_TABS = ["Overview", "Research Report", "Sources", "Evidence", "Comparison", "Activity"] as const;
export type WorkspaceTab = typeof WORKSPACE_TABS[number];
export function safeSourceUrl(value: string) {
    try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export function sourceMatches(source: ResearchSource, query: string, access: string) {
    return (access === "all" || (source.access_status ?? "unknown") === access) && [source.title, source.domain, ...(source.authors ?? []), source.year].join(" ").toLowerCase().includes(query.trim().toLowerCase());
}
export function claimCounts(run: ResearchRun) {
    const counts: Record<ClaimAssessment, number> = { supported_by_excerpt: 0, partially_supported: 0, unsupported: 0 };
    for (const claim of run.report?.claims ?? []) counts[claim.assessment]++;
    return counts;
}
export function linkedSourceClaims(run: ResearchRun, sourceId: string) {
    return (run.report?.claims ?? []).filter(claim => claim.evidence_ids.some(id => { const result = resolveEvidence(run, claim.id, id); return result.available && result.source.id === sourceId; }));
}
export function adjacentTab(index: number, key: string) {
    if (key === "Home") return 0;
    if (key === "End") return WORKSPACE_TABS.length - 1;
    if (key === "ArrowRight") return (index + 1) % WORKSPACE_TABS.length;
    if (key === "ArrowLeft") return (index + WORKSPACE_TABS.length - 1) % WORKSPACE_TABS.length;
    return null;
}
