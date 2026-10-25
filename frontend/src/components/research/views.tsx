"use client";
import { useDemoData } from "@/components/research/data-context";
import { Badge, Button, Card } from "@/components/ui";
import { ASSESSMENT_LABELS } from "@/lib/landing/interaction-model";
import { claimCounts, type WorkspaceTab } from "@/lib/research/workspace-model";
import { ClaimInspector } from "@/components/evidence/claim-inspector";
export { SourceLink } from "@/components/evidence/claim-inspector";
import type { ResearchClaim, ResearchRun } from "@/types/research";

export function Empty({ children }: { children: React.ReactNode }) {
    return <div className="workspace-empty"><span aria-hidden="true">↗</span><p>{children}</p><p className="workspace-muted">Available data will appear here when returned by the adapter.</p></div>;
}
export function Assessment({ claim }: { claim: ResearchClaim }) {
    return <Badge className={`assessment assessment-${claim.assessment}`}>{ASSESSMENT_LABELS[claim.assessment]}</Badge>;
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
export const EvidenceDetail = ClaimInspector;
export function Report({ run, selectedClaim, selectClaim, inspect }: { run: ResearchRun; selectedClaim: string; selectClaim: (id: string) => void; inspect: (claim: string, evidence: string) => void }) {
    const demo = useDemoData();
    if (!run.report) return <Empty>No report is available for this run.</Empty>;
    return <article className="workspace-report"><p className="workspace-eyebrow">RESEARCH REPORT{demo ? " / DEMO ONLY" : ""}</p><h2>{run.question}</h2><nav aria-label="Report sections"><a href="#report-summary">Summary</a><a href="#report-claims">Claims</a></nav><section id="report-summary"><h3>Summary</h3><p className="report-summary">{run.report.summary}</p></section><section id="report-claims"><h3>Claims & source support</h3>{!run.report.claims.length && <Empty>No claims were returned.</Empty>}{run.report.claims.map((claim, index) => <div key={`${claim.id}:${index}`} className={`report-claim ${selectedClaim === claim.id ? "is-selected" : ""}`}><button className="claim-text" aria-pressed={selectedClaim === claim.id} onClick={() => selectClaim(claim.id)}>{claim.text}</button><Assessment claim={claim} /><div className="citation-list">{[...new Set(claim.evidence_ids)].map(id => <button key={id} className="citation" onClick={() => inspect(claim.id, id)} aria-label={`Inspect evidence ${id} for claim ${claim.id}`}>[{id}]</button>)}{!claim.evidence_ids.length && <span>No evidence supplied</span>}</div></div>)}</section></article>;
}
export function Activity({ run }: { run: ResearchRun }) {
    const demo = useDemoData();
    const completed = run.steps.filter(step => step.status === "done").length;
    return <Card><p className="workspace-eyebrow">{demo ? "DEMO SIMULATION / ADAPTER STATUS" : "BACKEND STATUS"}</p><h2>Follow the research trail.</h2><p>{run.status === "queued" ? "Queued — no stage has started." : `Run status: ${run.status}.`}</p>{run.steps.length > 0 && <div className="activity-progress"><label htmlFor="stage-progress">{completed} of {run.steps.length} stages done</label><progress id="stage-progress" max={run.steps.length} value={completed} /><span>Stage completion, not a confidence score.</span></div>}{!run.steps.length ? <Empty>No stage details were returned.</Empty> : <ol className="workspace-timeline">{run.steps.map(step => <li key={step.stage} className={`stage-${step.status}`}><details><summary><span className="stage-dot" aria-hidden="true" /><strong>{step.stage}</strong><Badge>{step.status}</Badge></summary><p>{step.detail ?? "No additional stage detail was supplied."}</p><p>Duration: {step.duration_ms == null ? "Not reported" : `${step.duration_ms} ms`}</p></details></li>)}</ol>}<p className="workspace-muted">{demo ? "This is simulated progress from the mock adapter, not live search or AI processing." : "Stage details are returned by the research service."}</p></Card>;
}
