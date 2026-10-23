import type { ResearchClaim, ResearchEvidence, ResearchRun, ResearchSource } from "@/types/research";
export interface IntegrityIssue {
    code: "duplicate_id" | "missing_reference" | "mismatched_claim";
    ownerId: string;
    referenceId: string;
}
function unique<T extends {
    id: string;
}>(items: T[], id: string): T | undefined {
    const matches = items.filter((item) => item.id === id);
    return matches.length === 1 ? matches[0] : undefined;
}
export function inspectIntegrity(run: ResearchRun): IntegrityIssue[] {
    const issues: IntegrityIssue[] = [];
    const claims = run.report?.claims ?? [];
    const groups = [run.sources, run.evidence, claims, run.report?.comparison ?? []];
    for (const items of groups) {
        const seen = new Set<string>();
        for (const item of items) {
            if (seen.has(item.id))
                issues.push({ code: "duplicate_id", ownerId: item.id, referenceId: item.id });
            seen.add(item.id);
        }
    }
    const check = (ownerId: string, referenceId: string, found: unknown) => {
        if (!found)
            issues.push({ code: "missing_reference", ownerId, referenceId });
    };
    for (const claim of claims)
        for (const id of claim.evidence_ids) {
            const evidence = unique(run.evidence, id);
            check(claim.id, id, evidence);
            if (evidence && evidence.claim_id !== claim.id)
                issues.push({ code: "mismatched_claim", ownerId: claim.id, referenceId: id });
        }
    for (const evidence of run.evidence) {
        check(evidence.id, evidence.source_id, unique(run.sources, evidence.source_id));
        const claim = unique(claims, evidence.claim_id);
        check(evidence.id, evidence.claim_id, claim);
        if (claim && !claim.evidence_ids.includes(evidence.id))
            issues.push({ code: "mismatched_claim", ownerId: evidence.id, referenceId: claim.id });
    }
    for (const row of run.report?.comparison ?? [])
        for (const id of row.claim_ids)
            check(row.id, id, unique(claims, id));
    return issues;
}
export type ResolvedEvidence = {
    available: true;
    evidence: ResearchEvidence;
    source: ResearchSource;
} | {
    available: false;
    reason: "missing_evidence" | "missing_source" | "mismatched_claim" | "source_unavailable";
};
export function resolveEvidence(run: ResearchRun, claimId: string, evidenceId: string): ResolvedEvidence {
    const claim: ResearchClaim | undefined = unique(run.report?.claims ?? [], claimId);
    const evidence = unique(run.evidence, evidenceId);
    if (!claim || !evidence || !claim.evidence_ids.includes(evidenceId))
        return { available: false, reason: "missing_evidence" };
    if (evidence.claim_id !== claim.id)
        return { available: false, reason: "mismatched_claim" };
    const source = unique(run.sources, evidence.source_id);
    if (!source)
        return { available: false, reason: "missing_source" };
    if (!evidence.excerpt.trim() || source.access_status === "restricted" || source.access_status === "unavailable")
        return { available: false, reason: "source_unavailable" };
    return { available: true, evidence, source };
}
