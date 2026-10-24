import type { ResearchRun } from "@/types/research";

export type EvidenceNode = { key: string; id: string; kind: "question" | "claim" | "evidence" | "source"; label: string; text: string; x: number; y: number };
export type EvidenceGraph = { nodes: EvidenceNode[]; edges: { from: string; to: string }[]; paths: string[][]; omitted: number };
/** Only unambiguous, reciprocal claim/evidence/source references become paths. */
export function buildEvidenceGraph(run: ResearchRun): EvidenceGraph {
    const unique = <T extends { id: string }>(items: T[]) => items.filter(item => items.filter(other => other.id === item.id).length === 1);
    const allClaims = unique(run.report?.claims ?? []);
    const claims = allClaims.slice(0, 12);
    const evidence = unique(run.evidence);
    const sources = unique(run.sources);
    const paths: string[][] = claims.map(c => ["question", `claim:${c.id}`]);
    const linkedEvidence = new Set<string>(), linkedSources = new Set<string>();
    for (const claim of claims) for (const id of new Set(claim.evidence_ids)) {
        const record = evidence.find(e => e.id === id && e.claim_id === claim.id);
        const source = record && sources.find(s => s.id === record.source_id);
        if (!record || !source) continue;
        paths.push(["question", `claim:${claim.id}`, `evidence:${record.id}`, `source:${source.id}`]);
        linkedEvidence.add(record.id); linkedSources.add(source.id);
    }
    const nodes: EvidenceNode[] = [{ key: "question", id: run.id, kind: "question", label: "Your question", text: run.question, x: 12, y: 50 }];
    const add = (items: { id: string; text: string }[], kind: EvidenceNode["kind"], x: number) => items.forEach((item, index) => nodes.push({ key: `${kind}:${item.id}`, id: item.id, kind, label: `${kind === "evidence" ? "Excerpt" : kind === "source" ? "Source" : "Claim"} ${String(index + 1).padStart(2, "0")}`, text: item.text, x, y: 15 + (index + .5) * 70 / items.length }));
    add(claims.map(c => ({ id: c.id, text: c.text })), "claim", 38);
    add(evidence.filter(e => linkedEvidence.has(e.id)).map(e => ({ id: e.id, text: "Select to inspect the supplied excerpt." })), "evidence", 64);
    add(sources.filter(s => linkedSources.has(s.id)).map(s => ({ id: s.id, text: s.title })), "source", 88);
    const edges = new Map<string, { from: string; to: string }>();
    for (const path of paths) for (let index = 1; index < path.length; index++) {
        const edge = { from: path[index - 1], to: path[index] }; edges.set(`${edge.from}|${edge.to}`, edge);
    }
    return { nodes, edges: [...edges.values()], paths, omitted: allClaims.length - claims.length };
}
export function traceSelection(graph: EvidenceGraph, key: string) {
    return new Set(graph.paths.filter(path => path.includes(key)).flat());
}
