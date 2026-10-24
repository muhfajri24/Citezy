import type { ClaimAssessment, ResearchRun } from "@/types/research";
import { resolveEvidence } from "@/lib/utils/integrity";

export const ASSESSMENT_LABELS: Record<ClaimAssessment, string> = {
    supported_by_excerpt: "Supported by excerpt",
    partially_supported: "Partially supported",
    unsupported: "Unsupported",
};
export const STORY_STAGES = [
    { id: "question", label: "Question", title: "Start with something worth asking.", description: "A focused question sets the direction. This fictional example asks how retrieval methods compare on their reported evidence." },
    { id: "search", label: "Search", title: "Find the sources, not just an answer.", description: "A research trail begins with identifiable sources. In this demo, Cedar, Birch and Maple are fictional studies on example.org." },
    { id: "read", label: "Read", title: "Bring the original words into view.", description: "Read the actual excerpt behind a finding. Missing details stay missing; a citation alone is not enough." },
    { id: "verify", label: "Verify", title: "Check what the excerpt supports.", description: "Supported, partial or unsupported: each assessment needs a reason. Source support is not independent scientific fact-checking." },
    { id: "report", label: "Report", title: "Keep the evidence in the picture.", description: "A useful report keeps findings, sources and limitations connected. Different datasets do not become comparable just because they share a table." },
] as const;

export function selectDemoClaim(run: ResearchRun, claimId: string) {
    const matches = (run.report?.claims ?? []).filter((claim) => claim.id === claimId);
    if (matches.length !== 1) return null;
    const claim = matches[0];
    const firstId = claim.evidence_ids[0];
    return {
        claim,
        resolution: firstId ? resolveEvidence(run, claim.id, firstId) : { available: false as const, reason: "missing_evidence" as const },
    };
}

export function getActiveStoryIndex(rects: { top: number; bottom: number }[], line: number): number {
    let nearest = 0;
    let distance = Infinity;
    rects.forEach((rect, index) => {
        const next = Math.max(rect.top - line, line - rect.bottom, 0);
        if (Number.isFinite(next) && next < distance) { nearest = index; distance = next; }
    });
    return nearest;
}

export function pointerOffsets(x: number, y: number, rect: { left: number; top: number; width: number; height: number }) {
    if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
    const clamp = (value: number) => Math.max(-1, Math.min(1, value));
    return { x: clamp((x - rect.left) / rect.width * 2 - 1) * 14, y: clamp((y - rect.top) / rect.height * 2 - 1) * 14 };
}

/** Align the selected step with the same viewport line used by the observer. */
export function getStoryScrollTarget(scrollY: number, rect: { top: number; bottom: number }, line: number) {
    return Math.max(0, scrollY + (rect.top + rect.bottom) / 2 - line);
}
