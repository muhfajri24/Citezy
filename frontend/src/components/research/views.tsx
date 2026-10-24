"use client";
import { Badge, Button, Card } from "@/components/ui";
import { ASSESSMENT_LABELS } from "@/lib/landing/interaction-model";
import { claimCounts, safeSourceUrl, type WorkspaceTab } from "@/lib/research/workspace-model";
import { resolveEvidence } from "@/lib/utils/integrity";
import type { ResearchClaim, ResearchRun, ResearchSource } from "@/types/research";

export function Empty({ children }: { children: React.ReactNode }) {
    return <div className="workspace-empty"><span aria-hidden="true">↗</span><p>{children}</p><p className="workspace-muted">Available data will appear here when returned by the adapter.</p></div>;
}
export function Assessment({ claim }: { claim: ResearchClaim }) {
    return <Badge className={`assessment assessment-${claim.assessment}`}>{ASSESSMENT_LABELS[claim.assessment]}</Badge>;
}
export function SourceLink({ source }: { source: ResearchSource }) {
    const url = safeSourceUrl(source.url);
    return url ? <a className="workspace-link" href={url} target="_blank" rel="noopener noreferrer">Open original source ↗<span className="sr-only"> (opens in a new tab)</span></a> : <p>Original URL unavailable.</p>;
}
export function Overview({ run, navigate }: { run: ResearchRun; navigate: (tab: WorkspaceTab) => void }) {
    const counts = claimCounts(run);
    const done = run.steps.filter(step => step.status === "done").length;
    return <>
        <div className="workspace-stats">
            <button onClick={() => navigate("Sources")}><strong>{run.sources.length}</strong><span>Sources ↗</span></button>
            <button onClick={() => navigate("Evidence")}><strong>{run.report?.claims.length ?? 0}</strong><span>Claims ↗</span></button>
            <button onClick={() => navigate("Activity")}><strong>{done}/{run.steps.length}</strong><span>Stages done ↗</span></button>
        </div>
        <div className="workspace-columns"><Card><p className="workspace-eyebrow">RESEARCH BRIEF</p><h2>The question</h2><p>{run.question}</p><button className="workspace-summary" onClick={() => navigate("Research Report")}><strong>Read the report ↗</strong><span>{run.report?.summary ?? "The report is not available yet. Follow the activity to see the returned stage status."}</span></button></Card>
        <Card><p className="workspace-eyebrow">EVIDENCE AT A GLANCE</p><h2>Support, with context.</h2><dl className="workspace-distribution">{Object.entries(counts).map(([status, count]) => <div key={status}><dt>{ASSESSMENT_LABELS[status as keyof typeof counts]}</dt><dd>{count}</dd></div>)}</dl><p className="workspace-muted">Source support is not independent fact-checking.</p><Button onClick={() => navigate("Evidence")}>Inspect claims</Button></Card></div>
    </>;
}
export function EvidenceDetail({ run, claimId, evidenceId }: { run: ResearchRun; claimId: string; evidenceId?: string }) {
    const matches = (run.report?.claims ?? []).filter(c => c.id === claimId);
    const claim = matches.length === 1 ? matches[0] : null;
    if (!claim) return <Empty>Select an available claim to inspect its evidence.</Empty>;
    const ids = evidenceId ? [evidenceId] : claim.evidence_ids;
    return <><p className="workspace-eyebrow">EVIDENCE INSPECTOR · {claim.id}</p><h3>{claim.text}</h3><Assessment claim={claim} />{claim.explanation && <p>{claim.explanation}</p>}
        {!ids.length && <Empty>No evidence was supplied for this claim.</Empty>}
        {ids.map(id => { const resolved = resolveEvidence(run, claim.id, id); return <section key={id} className="evidence-record" aria-label={`Evidence ${id}`}>
            {!resolved.available ? <p role="status">Evidence unavailable ({resolved.reason.replaceAll("_", " ")}). No excerpt can be shown.</p> : <><p className="workspace-eyebrow">{resolved.source.title}</p><blockquote>{resolved.evidence.excerpt}</blockquote><p>{resolved.evidence.explanation ?? "No explanation was supplied."}</p><p className="workspace-muted">Access: {resolved.source.access_status ?? "unknown"} · {resolved.source.domain ?? "Domain not reported"}</p><SourceLink source={resolved.source} /></>}
        </section>; })}<p className="workspace-caveat">Source support is not independent fact-checking. DEMO ONLY: these sources and excerpts are fictional.</p></>;
}
export function Report({ run, selectedClaim, selectClaim, inspect }: { run: ResearchRun; selectedClaim: string; selectClaim: (id: string) => void; inspect: (claim: string, evidence: string) => void }) {
    if (!run.report) return <Empty>No report is available for this run.</Empty>;
    return <article className="workspace-report"><p className="workspace-eyebrow">RESEARCH REPORT · DEMO ONLY</p><h2>{run.question}</h2><nav aria-label="Report sections"><a href="#report-summary">Summary</a><a href="#report-claims">Claims</a></nav><section id="report-summary"><h3>Summary</h3><p className="report-summary">{run.report.summary}</p></section><section id="report-claims"><h3>Claims & source support</h3>{!run.report.claims.length && <Empty>No claims were returned.</Empty>}{run.report.claims.map(claim => <div key={claim.id} className={`report-claim ${selectedClaim === claim.id ? "is-selected" : ""}`}><button className="claim-text" aria-pressed={selectedClaim === claim.id} onClick={() => selectClaim(claim.id)}>{claim.text}</button><Assessment claim={claim} /><div className="citation-list">{claim.evidence_ids.map(id => <button key={id} className="citation" onClick={() => inspect(claim.id, id)} aria-label={`Inspect evidence ${id} for claim ${claim.id}`}>[{id}]</button>)}{!claim.evidence_ids.length && <span>No evidence supplied</span>}</div></div>)}</section></article>;
}
export function Activity({ run }: { run: ResearchRun }) {
    return <Card><p className="workspace-eyebrow">DEMO SIMULATION · ADAPTER STATUS</p><h2>Follow the research trail.</h2><p>{run.status === "queued" ? "Queued — no stage has started." : `Run status: ${run.status}.`}</p>{!run.steps.length ? <Empty>No stage details were returned.</Empty> : <ol className="workspace-timeline">{run.steps.map(step => <li key={step.stage} className={`stage-${step.status}`}><details><summary><span className="stage-dot" aria-hidden="true" /><strong>{step.stage}</strong><Badge>{step.status}</Badge></summary><p>{step.detail ?? "No additional stage detail was supplied."}</p><p>Duration: {step.duration_ms == null ? "Not reported" : `${step.duration_ms} ms`}</p></details></li>)}</ol>}<p className="workspace-muted">This is simulated progress from the mock adapter, not live search or AI processing.</p></Card>;
}
