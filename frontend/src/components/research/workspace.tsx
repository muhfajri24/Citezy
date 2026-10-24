"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { Brand } from "@/components/landing/brand";
import { Alert, Badge, Button, Card, Input, Skeleton } from "@/components/ui";
import { useResearchRun } from "@/hooks/use-research-run";
import { ASSESSMENT_LABELS } from "@/lib/landing/interaction-model";
import { adjacentTab, linkedSourceClaims, sourceMatches, WORKSPACE_TABS, type WorkspaceTab } from "@/lib/research/workspace-model";
import { Activity, Assessment, Empty, EvidenceDetail, Overview, Report, SourceLink } from "./views";

export function ResearchWorkspace({ id }: { id: string }) {
    const { run, loading, error, paused, refresh } = useResearchRun(id);
    const [tab, setTab] = useState<WorkspaceTab>("Overview");
    const [claimId, setClaimId] = useState("");
    const [sourceId, setSourceId] = useState("");
    const [query, setQuery] = useState("");
    const [access, setAccess] = useState("all");
    const [assessment, setAssessment] = useState("all");
    const [sort, setSort] = useState("original");
    const [inspectedEvidence, setInspectedEvidence] = useState<string>();
    const dialog = useRef<HTMLDialogElement>(null);
    const opener = useRef<HTMLElement | null>(null);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const claims = run?.report?.claims ?? [];
    const visibleClaims = claims.filter(c => assessment === "all" || c.assessment === assessment);
    const selectedClaim = visibleClaims.find(c => c.id === claimId) ?? visibleClaims[0];
    const selectedSource = run?.sources.find(s => s.id === sourceId);
    const navigate = (next: WorkspaceTab) => { setTab(next); tabs.current[WORKSPACE_TABS.indexOf(next)]?.focus(); };
    const openEvidence = (nextClaim: string) => { setAssessment("all"); setClaimId(nextClaim); navigate("Evidence"); };
    const inspect = (nextClaim: string, evidence: string) => { setClaimId(nextClaim); setInspectedEvidence(evidence); opener.current = document.activeElement as HTMLElement; dialog.current?.showModal(); };
    const closeInspector = () => { dialog.current?.close(); opener.current?.focus(); };
    const rows = [...(run?.report?.comparison ?? [])];
    if (sort !== "original") rows.sort((a, b) => sort === "method" ? a.method.localeCompare(b.method) : (a.dataset ?? "").localeCompare(b.dataset ?? ""));
    return <div className="workspace">
        <header className="workspace-header"><Brand /><span className="workspace-header-question" title={run?.question}>{run?.question ?? "Research workspace"}</span><Badge>Demo simulation</Badge><Link href="/#research-question" className="workspace-new">New research ↗</Link></header>
        <main id="main" tabIndex={-1} className="workspace-main">
            <div className="workspace-title"><div><p className="workspace-eyebrow">YOUR RESEARCH WORKSPACE · DEMO ONLY</p><h1>{tab}</h1></div><div className="workspace-status"><Badge>{run?.status ?? (error ? "Unavailable" : "Loading")}</Badge><Button disabled={loading || !run && !error} onClick={refresh}>{loading ? "Refreshing…" : "Refresh status"}</Button></div></div>
            <p className="workspace-muted">Fictional data from the mock adapter. No live search or AI processing. Sessions reset on reload.</p>
            <span className="sr-only" role="status">{run ? `Research status: ${run.status}` : "Opening research workspace"}{paused ? ". Updates paused while this tab is hidden." : ""}</span>
            {error && <Alert role="alert">{error} {!run && "Demo requests reset on reload. Start new research to create another request."}</Alert>}
            {run && ["partial", "failed", "cancelled"].includes(run.status) && <Alert role="status">{run.status === "partial" ? "Partial results: inspect available evidence with care." : `This simulation ${run.status}. It did not complete successfully.`} {run.report ? "Available results are preserved below." : "No report was returned."} <Link href="/#research-question">Start a new research question</Link></Alert>}
            <div className="workspace-tabs" role="tablist" aria-label="Research workspace">{WORKSPACE_TABS.map((name, i) => <button key={name} ref={el => { tabs.current[i] = el; }} id={`workspace-tab-${i}`} role="tab" aria-selected={tab === name} aria-controls={`workspace-panel-${i}`} tabIndex={tab === name ? 0 : -1} onClick={() => setTab(name)} onKeyDown={event => { const next = adjacentTab(i, event.key); if (next !== null) { event.preventDefault(); navigate(WORKSPACE_TABS[next]); tabs.current[next]?.scrollIntoView({ block: "nearest", inline: "nearest" }); } }}>{name}</button>)}</div>
            <section key={tab} className="workspace-content" role="tabpanel" id={`workspace-panel-${WORKSPACE_TABS.indexOf(tab)}`} aria-labelledby={`workspace-tab-${WORKSPACE_TABS.indexOf(tab)}`} tabIndex={0}>
                {!run ? loading ? <div aria-label="Loading research"><Skeleton className="workspace-skeleton" /><Skeleton className="workspace-skeleton" /><Skeleton className="workspace-skeleton" /></div> : <Empty>This run is unavailable. Use New research to begin again.</Empty> : <>
                    {tab === "Overview" && <Overview run={run} navigate={navigate} />}
                    {tab === "Research Report" && <Report run={run} selectedClaim={claimId} selectClaim={setClaimId} inspect={inspect} />}
                    {tab === "Sources" && <><div className="workspace-filters"><label>Search sources<Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Title, author, year or domain" /></label><label>Access status<select value={access} onChange={e => setAccess(e.target.value)}><option value="all">All access statuses</option>{["accessible", "restricted", "unavailable", "unknown"].map(value => <option key={value}>{value}</option>)}</select></label></div><div className="workspace-columns"><Card><h2>Source explorer</h2>{run.sources.filter(s => sourceMatches(s, query, access)).map(source => <button key={source.id} className="workspace-list-item" aria-pressed={sourceId === source.id} onClick={() => setSourceId(source.id)}><strong>{source.title}</strong><span>{source.year ?? "Year not reported"} · {source.access_status ?? "unknown"}</span></button>)}{!run.sources.filter(s => sourceMatches(s, query, access)).length && <Empty>{run.sources.length ? "No sources match these filters." : "No sources have been returned."}</Empty>}</Card><Card><h2>Source detail</h2>{selectedSource ? <><h3>{selectedSource.title}</h3><p>Authors: {selectedSource.authors?.join(", ") || "Not reported"}</p><p>Year: {selectedSource.year ?? "Not reported"} · Access: {selectedSource.access_status ?? "unknown"}</p><p className="workspace-muted">Fetched: {selectedSource.fetched_at ? new Date(selectedSource.fetched_at).toLocaleString() : "Not reported"}</p><SourceLink source={selectedSource} /><h3>Related claims & evidence</h3>{linkedSourceClaims(run, selectedSource.id).map(claim => <button key={claim.id} className="workspace-list-item" onClick={() => openEvidence(claim.id)}>{claim.text}<span>Inspect linked evidence ↗</span></button>)}{!linkedSourceClaims(run, selectedSource.id).length && <Empty>No safely resolvable evidence links are available.</Empty>}</> : <Empty>Select a source to see its metadata and linked evidence.</Empty>}</Card></div></>}
                    {tab === "Evidence" && <><div className="workspace-filters"><label>Support status<select value={assessment} onChange={e => setAssessment(e.target.value)}><option value="all">All support statuses</option>{Object.entries(ASSESSMENT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><span>{visibleClaims.length} claims shown</span></div><div className="workspace-columns evidence-layout"><Card><h2>Claim ledger</h2>{visibleClaims.map(claim => <button key={claim.id} className="workspace-list-item" aria-pressed={selectedClaim?.id === claim.id} onClick={() => setClaimId(claim.id)}><strong>{claim.text}</strong><Assessment claim={claim} /></button>)}{!visibleClaims.length && <Empty>No claims match this view.</Empty>}</Card><Card className="workspace-inspector"><div className="claim-pagination"><Button disabled={!selectedClaim || visibleClaims.indexOf(selectedClaim) === 0} onClick={() => setClaimId(visibleClaims[visibleClaims.indexOf(selectedClaim!) - 1].id)}>Previous claim</Button><Button disabled={!selectedClaim || visibleClaims.indexOf(selectedClaim) === visibleClaims.length - 1} onClick={() => setClaimId(visibleClaims[visibleClaims.indexOf(selectedClaim!) + 1].id)}>Next claim</Button></div><EvidenceDetail run={run} claimId={selectedClaim?.id ?? ""} /></Card></div></>}
                    {tab === "Comparison" && <Card><div className="workspace-filters"><h2>Method comparison</h2><label>Sort methods<select value={sort} onChange={e => setSort(e.target.value)}><option value="original">Returned order</option><option value="method">Method A–Z</option><option value="dataset">Dataset A–Z</option></select></label></div>{!rows.length ? <Empty>No structured comparison data was returned.</Empty> : <><p className="workspace-muted">Scroll the table horizontally on small screens. Unknown values are not reported.</p><div className="comparison-scroll" role="region" aria-label="Scrollable method comparison" tabIndex={0}><table><caption>DEMO ONLY · fictional methods; different evaluation conditions are not directly comparable.</caption><thead><tr>{["Method & detail", "Dataset", "Metric", "Result", "Units"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><details><summary>{row.method}</summary><p>{row.limitation ?? "Limitation not reported"}</p>{row.comparability_warning && <p className="comparison-warning">{row.comparability_warning}</p>}{row.claim_ids.map(id => claims.filter(c => c.id === id).length === 1 ? <button key={id} className="citation" onClick={() => openEvidence(id)}>Inspect claim {id}</button> : <p key={id}>Claim {id} unavailable</p>)}</details>{row.comparability_warning && <p className="comparison-warning">Comparison caution — expand for detail.</p>}</td><td>{row.dataset ?? "Not reported"}</td><td>{row.metric ?? "Not reported"}</td><td>{row.result ?? "Not reported"}</td><td>{row.units ?? "Not reported"}</td></tr>)}</tbody></table></div></>}</Card>}
                    {tab === "Activity" && <Activity run={run} />}
                </>}
            </section>
            <p className="workspace-footnote">Source support is not independent fact-checking. Review every finding before relying on it.</p>
        </main>
        <dialog ref={dialog} className="workspace-dialog" aria-labelledby="inspector-title" onClose={() => opener.current?.focus()} onKeyDown={event => {
            if (event.key !== "Tab") return;
            const targets = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]'));
            const first = targets[0], last = targets.at(-1);
            if (event.shiftKey && event.target === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && event.target === last) { event.preventDefault(); first?.focus(); }
        }}><div className="dialog-heading"><h2 id="inspector-title">Inspect the evidence</h2><Button onClick={closeInspector}>Close inspector</Button></div>{run && <EvidenceDetail run={run} claimId={claimId} evidenceId={inspectedEvidence} />}</dialog>
    </div>;
}
