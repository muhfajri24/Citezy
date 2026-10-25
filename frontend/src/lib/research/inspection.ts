import type { ClaimAssessment, ResearchRun } from "@/types/research";
import { resolveEvidence } from "@/lib/utils/integrity";

export const SUPPORT_EXPLANATIONS: Record<ClaimAssessment, string> = {
    supported_by_excerpt: "The linked excerpt supports this claim. This does not independently verify the source or establish universal truth.",
    partially_supported: "The excerpt supports only part of the claim, or important qualifications remain.",
    unsupported: "No linked excerpt adequately supports this claim in the available evidence.",
};

export function inspectionContext(run: ResearchRun, claimId: string, evidenceId?: string) {
    const matches = (run.report?.claims ?? []).filter(claim => claim.id === claimId);
    const claim = matches.length === 1 ? matches[0] : undefined;
    const ids = [...new Set(claim?.evidence_ids ?? [])];
    // Explicit invalid selections must remain unavailable, never fall back to another record.
    const selectedId = evidenceId ?? ids[0];
    const index = selectedId ? ids.indexOf(selectedId) : -1;
    return { claim, ids, selectedId, index, resolution: selectedId ? resolveEvidence(run, claimId, selectedId) : undefined };
}

export function sourceEvidence(run: ResearchRun, sourceId: string) {
    return run.evidence.filter(item => {
        const resolved = resolveEvidence(run, item.claim_id, item.id);
        return resolved.available && resolved.source.id === sourceId;
    });
}
