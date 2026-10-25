"use client";
import { useState } from "react";
import { Badge, Button } from "@/components/ui";
import { ASSESSMENT_LABELS } from "@/lib/landing/interaction-model";
import { inspectionContext, sourceEvidence, SUPPORT_EXPLANATIONS } from "@/lib/research/inspection";
import { safeSourceUrl } from "@/lib/research/workspace-model";
import type { ResearchClaim, ResearchRun, ResearchSource } from "@/types/research";

export function ClaimLedger({ claims, assessment, selectedId, onSelect, onReset }: { claims: ResearchClaim[]; assessment: string; selectedId?: string; onSelect: (id: string) => void; onReset: () => void }) {
    const visible = claims.filter(claim => assessment === "all" || claim.assessment === assessment);
    return <><h2>Claim ledger</h2>{visible.map((claim, index) => <button key={`${claim.id}:${index}`} className="workspace-list-item" aria-pressed={selectedId === claim.id} onClick={() => onSelect(claim.id)}><strong>{claim.text}</strong><Badge className={`assessment assessment-${claim.assessment}`}>{ASSESSMENT_LABELS[claim.assessment]}</Badge></button>)}{!visible.length && <div className="workspace-empty" role="status"><p>No claims match this view.</p><Button onClick={onReset}>Reset support filter</Button></div>}</>;
}

export function SourceLink({ source }: { source: ResearchSource }) {
    const url = safeSourceUrl(source.url);
    return url ? <a className="workspace-link" href={url} target="_blank" rel="noopener noreferrer">Open original source ↗<span className="sr-only">: {source.title} (opens in a new tab)</span></a> : <p>Original URL unavailable.</p>;
}

export function SourceDetails({ run, sourceId, onEvidence }: { run: ResearchRun; sourceId: string; onEvidence?: (claim: string, evidence: string) => void }) {
    const matches = run.sources.filter(source => source.id === sourceId);
    if (matches.length !== 1) return <p role="status">Source unavailable: missing or ambiguous source ID.</p>;
    const source = matches[0], linked = sourceEvidence(run, sourceId);
    return <section className="inspection-source" aria-label={`Source ${source.id}`}><h3>{source.title}</h3><p>Authors: {source.authors?.join(", ") || "Not reported"}</p><p>Year: {source.year ?? "Not reported"} · Access: {source.access_status ?? "unknown"}</p><p>Domain: {source.domain ?? "Not reported"}</p><p>Fetched: {source.fetched_at ?? "Not reported"}</p><SourceLink source={source} />{onEvidence && <><h4>Linked claims & excerpts</h4>{linked.map(item => <button key={item.id} className="workspace-list-item" onClick={() => onEvidence(item.claim_id, item.id)}><strong>{run.report?.claims.find(claim => claim.id === item.claim_id)?.text}</strong><span>Inspect evidence {item.id}</span></button>)}{!linked.length && <p>No safely resolvable evidence links are available.</p>}</>}<p className="workspace-muted">Source support is not independent fact-checking.</p></section>;
}

type Props = { run: ResearchRun; claimId: string; evidenceId?: string; onEvidence?: (claim: string, evidence: string) => void; onSource?: (source: string) => void };
export function ClaimInspector(props: Props) {
    return <InspectorContent key={`${props.run.id}:${props.claimId}`} {...props} />;
}
function InspectorContent({ run, claimId, evidenceId, onEvidence, onSource }: Props) {
    const [selection, setSelection] = useState({ request: evidenceId, id: evidenceId });
    const selected = selection.request === evidenceId ? selection.id : evidenceId;
    const { claim, ids, selectedId, index, resolution } = inspectionContext(run, claimId, selected);
    if (!claim) return <p className="workspace-empty" role="status">Claim unavailable: missing or ambiguous claim ID. Select an available claim to inspect its evidence.</p>;
    const choose = (id: string) => { setSelection({ request: evidenceId, id }); onEvidence?.(claim.id, id); };
    return <div className="claim-inspection"><p className="workspace-eyebrow">CLAIM INSPECTOR · {claim.id}</p><h3>{claim.text}</h3><Badge className={`assessment assessment-${claim.assessment}`}>{ASSESSMENT_LABELS[claim.assessment]}</Badge><p>{SUPPORT_EXPLANATIONS[claim.assessment]}</p>
        <section className="inspection-limitations"><h4>Limitations</h4>{claim.explanation && <p>{claim.explanation}</p>}<p>{claim.assessment === "unsupported" ? "Absence of support is not proof that the claim is false." : claim.assessment === "partially_supported" ? "Review the qualifications before extending this finding beyond the excerpt." : "Source support alone does not establish the reliability or generality of this finding."}</p></section>
        <h4>Linked evidence · {ids.length}</h4>{ids.length > 1 && <><div className="inspection-evidence-options" role="group" aria-label="Choose linked evidence">{ids.map((id, i) => <Button key={id} aria-pressed={selectedId === id} onClick={() => choose(id)}>Excerpt {i + 1} · {id}</Button>)}</div><div className="claim-pagination"><Button disabled={index <= 0} onClick={() => choose(ids[index - 1])}>Previous excerpt</Button><span role="status">{index < 0 ? "Unavailable selection" : `Excerpt ${index + 1} of ${ids.length}`}</span><Button disabled={index < 0 || index >= ids.length - 1} onClick={() => choose(ids[index + 1])}>Next excerpt</Button></div></>}
        {!ids.length && !selectedId && <p role="status">No evidence was supplied for this claim.</p>}
        {resolution && <section className="evidence-record" aria-label={`Evidence ${selectedId}`}>{!resolution.available ? <p role="status">Evidence unavailable ({resolution.reason.replaceAll("_", " ")}). No excerpt can be shown.</p> : <><p className="workspace-eyebrow">EXCERPT {resolution.evidence.id} · {resolution.source.title}</p><p className="workspace-muted">{claim.assessment === "unsupported" ? "Linked excerpt — not supporting evidence for this claim." : "Entire supplied excerpt highlighted; no exact supporting span was supplied."}</p><blockquote>{claim.assessment === "unsupported" ? resolution.evidence.excerpt : <mark>{resolution.evidence.excerpt}</mark>}</blockquote><p>{resolution.evidence.explanation ?? "No explanation was supplied."}</p>{onSource ? <Button onClick={() => onSource(resolution.source.id)}>View source detail · {resolution.source.id}</Button> : null}<SourceDetails run={run} sourceId={resolution.source.id} /></>}</section>}
        <p className="workspace-caveat">Source support is not independent fact-checking. DEMO ONLY: these sources and excerpts are fictional.</p></div>;
}
