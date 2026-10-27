"use client";
import Link from "next/link";
import { DemoDataContext } from "./data-context";
import { isMockMode } from "@/lib/api/data-mode";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Brand } from "@/components/landing/brand";
import { Alert, Badge, Button, Card, Input, Skeleton } from "@/components/ui";
import { useResearchRun } from "@/hooks/use-research-run";
import { ASSESSMENT_LABELS } from "@/lib/landing/interaction-model";
import { adjacentTab, sourceMatches, WORKSPACE_TABS, type WorkspaceTab } from "@/lib/research/workspace-model";
import { Activity, Empty, EvidenceDetail, Overview, Report } from "./views";
import { ClaimLedger, SourceDetails } from "@/components/evidence/claim-inspector";
import { EvidenceConstellation } from "@/components/evidence/constellation";
import { useTabIndicator } from "@/hooks/use-interface-motion";
import { trapDialogFocus, restoreDialogFocus } from "@/lib/utils/dialog-focus";
import { inverseLayout, MOTION } from "@/lib/motion/system";

export function ResearchWorkspace({ id }: { id: string }) {
    const demo = isMockMode();
    const { run, loading, error, paused, refresh, session } = useResearchRun(id);
    const [tab, setTab] = useState<WorkspaceTab>("Overview");
    const [claimId, setClaimId] = useState("");
    const [sourceId, setSourceId] = useState("");
    const [query, setQuery] = useState("");
    const [access, setAccess] = useState("all");
    const [assessment, setAssessment] = useState("all");
    const [sort, setSort] = useState("original");
    const [inspectedEvidence, setInspectedEvidence] = useState<string>();
    const [collapsed, setCollapsed] = useState(false);
    const [inspectorOpen, setInspectorOpen] = useState(true);
    const drawer = useRef<HTMLDialogElement>(null);
    const drawerOpener = useRef<HTMLButtonElement>(null);
    const dialog = useRef<HTMLDialogElement>(null);
    const opener = useRef<HTMLElement | null>(null);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const tabStrip = useRef<HTMLDivElement>(null);
    const rail = useRef<HTMLElement>(null);
    const workspaceMain = useRef<HTMLElement>(null);
    const layoutAnimations = useRef<Animation[]>([]);
    useTabIndicator(tabStrip, tab);
    useEffect(() => {
        const reduced = matchMedia("(prefers-reduced-motion: reduce)");
        const stop = () => layoutAnimations.current.forEach(animation => animation.cancel());
        const changed = () => { if (reduced.matches) stop(); };
        reduced.addEventListener("change", changed);
        return () => { stop(); reduced.removeEventListener("change", changed); };
    }, []);
    function toggleSidebar() {
        layoutAnimations.current.forEach(animation => animation.cancel());
        const elements = [rail.current, workspaceMain.current].filter((node): node is HTMLElement => node !== null);
        const before = elements.map(element => element.getBoundingClientRect());
        flushSync(() => setCollapsed(value => !value));
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        layoutAnimations.current = elements.flatMap((element, index) => {
            const transform = inverseLayout(before[index], element.getBoundingClientRect());
            return transform && element.animate ? [element.animate([{ transform, transformOrigin: "top left" }, { transform: "none", transformOrigin: "top left" }], { duration: MOTION.panel, easing: MOTION.ease })] : [];
        });
    }
    const claims = run?.report?.claims ?? [];
    const visibleClaims = claims.filter(c => assessment === "all" || c.assessment === assessment);
    const selectedClaim = claims.find(c => c.id === claimId) ?? (!claimId ? visibleClaims[0] : undefined);
    const filteredSources = run?.sources.filter(source => sourceMatches(source, query, access)) ?? [];
    const navigate = (next: WorkspaceTab) => { setTab(next); tabs.current[WORKSPACE_TABS.indexOf(next)]?.focus(); };
    const openEvidence = (nextClaim: string, evidence?: string) => { setAssessment("all"); setClaimId(nextClaim); setInspectedEvidence(evidence); setInspectorOpen(true); navigate("Evidence"); };
    const openSource = (source: string) => { setSourceId(source); dialog.current?.close(); navigate("Sources"); };
    const inspect = (nextClaim: string, evidence?: string) => { setClaimId(nextClaim); setInspectedEvidence(evidence); opener.current = document.activeElement as HTMLElement; dialog.current?.showModal(); };
    const closeInspector = () => { dialog.current?.close(); restoreDialogFocus(opener.current); };
    const rows = [...(run?.report?.comparison ?? [])];
    if (sort !== "original") rows.sort((a, b) => sort === "method" ? a.method.localeCompare(b.method) : (a.dataset ?? "").localeCompare(b.dataset ?? ""));
    return <DemoDataContext value={demo}><div data-demo-interrupted={session.interrupted} data-run-status={run?.status ?? "loading"} className={`workspace premium-workspace ${collapsed ? "rail-collapsed" : ""}`}>
        <header className="workspace-header"><Brand /><span className="workspace-header-question" title={run?.question}>{run?.question ?? "Research workspace"}</span><Badge>{demo ? "Demo simulation" : "Backend research"}</Badge><Link href="/about">About</Link><Link href="/#research-question" className="workspace-new">New research ↗</Link></header>
        <aside ref={rail} className="workspace-rail" aria-label="Workspace sidebar"><button className="rail-toggle" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} onClick={toggleSidebar}><span aria-hidden="true">{collapsed ? "→" : "←"}</span><span className="rail-copy">Your workspace</span></button><nav aria-label="Workspace views">{WORKSPACE_TABS.map((name, index) => <button key={name} title={name} aria-label={name} aria-current={tab === name ? "page" : undefined} onClick={() => navigate(name)}><span className="rail-icon" aria-hidden="true">{["◫", "≡", "↗", "◇", "⊞", "◷"][index]}</span><span className="rail-copy">{name}</span><span className="rail-index rail-copy">0{index + 1}</span></button>)}</nav><div className="rail-bottom"><span className="rail-signal" /><span className="rail-copy">{paused ? "Updates paused" : run?.status ?? "Opening session"}</span></div></aside>
        <main ref={workspaceMain} id="main" tabIndex={-1} className="workspace-main">
            <button ref={drawerOpener} className="workspace-menu" aria-haspopup="dialog" onClick={() => drawer.current?.showModal()}>☰ Workspace navigation</button>
            <div className="workspace-title"><div><p className="workspace-eyebrow">YOUR RESEARCH WORKSPACE{demo ? " / DEMO ONLY" : ""}</p><h1>{tab}</h1></div><div className="workspace-status"><Badge>{run?.status ?? (error ? "Unavailable" : "Loading")}</Badge><Button disabled={loading || !run && !error} onClick={refresh}>{loading ? "Refreshing…" : "Refresh status"}</Button></div></div>
            <p className="workspace-muted">{demo ? "Fictional data from the mock adapter. No live search or AI processing. Up to five demo snapshots are kept in this tab; original questions are not stored." : "Research data returned by the backend. Inspect excerpts and limitations before relying on results."}</p>
            <span className="sr-only" role="status">{run ? `${session.interrupted ? "Saved snapshot status" : "Research status"}: ${run.status}` : error ? "Research unavailable. Use Refresh status or New research to recover." : "Opening research workspace"}{paused ? ". Updates paused while this tab is hidden." : ""}</span>
            {run && session.restored && <Alert role="status">DEMO ONLY: restored fictional snapshot. {session.interrupted ? "This simulation was interrupted by a reload. Progress is frozen at the last saved state; it will not resume or complete automatically." : "This is saved demo output, not a new research run."} <Link href="/#research-question">Start a new demo</Link></Alert>}{session.storageUnavailable && <Alert role="status">Demo storage could not be used or restored. This session can still run in memory; refreshing may lose it.</Alert>}
            {!demo && <p className="workspace-caveat">Backend output is not proof that live model inference succeeded. Review source URLs, excerpts and limitations; model availability must be verified separately.</p>}
            {error && <Alert role="alert">{error} {!run && "No valid snapshot is available for this ID. Start new research to create another request."}</Alert>}
            {run && ["partial", "failed", "cancelled"].includes(run.status) && <Alert role="status">{run.status === "partial" ? "Partial results: inspect available evidence with care." : `This ${demo ? "simulation" : "run"} ${run.status}. It did not complete successfully.`} {run.report ? "Available results are preserved below." : "No report was returned."} <Link href="/#research-question">Start a new research question</Link></Alert>}
            <div ref={tabStrip} className="workspace-tabs" role="tablist" aria-label="Research workspace"><span className="workspace-tab-indicator" aria-hidden="true" />{WORKSPACE_TABS.map((name, i) => <button key={name} ref={el => { tabs.current[i] = el; }} id={`workspace-tab-${i}`} role="tab" aria-selected={tab === name} aria-controls={`workspace-panel-${i}`} tabIndex={tab === name ? 0 : -1} onClick={() => setTab(name)} onKeyDown={event => { const next = adjacentTab(i, event.key); if (next !== null) { event.preventDefault(); navigate(WORKSPACE_TABS[next]); tabs.current[next]?.scrollIntoView({ block: "nearest", inline: "nearest" }); } }}>{name}</button>)}</div>
            <section key={tab} className="workspace-content" role="tabpanel" id={`workspace-panel-${WORKSPACE_TABS.indexOf(tab)}`} aria-labelledby={`workspace-tab-${WORKSPACE_TABS.indexOf(tab)}`} tabIndex={0}>
                {!run ? loading ? <div aria-label="Loading research"><Skeleton className="workspace-skeleton" /><Skeleton className="workspace-skeleton" /><Skeleton className="workspace-skeleton" /></div> : <Empty>This run is unavailable. Use New research to begin again.</Empty> : <>
                    {tab === "Overview" && <><Overview run={run} navigate={navigate} /><details className="workspace-network" open><summary>Explore the evidence network <span>Question → Claim → Excerpt → Source</span></summary><EvidenceConstellation run={run} compact onInspect={inspect} onSource={openSource} /></details></>}
                    {tab === "Research Report" && <Report run={run} selectedClaim={claimId} selectClaim={(next) => inspect(next)} inspect={inspect} />}
                    {tab === "Sources" && <><div className="workspace-filters"><label>Search sources<Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Title, author, year or domain" /></label><label>Access status<select value={access} onChange={e => setAccess(e.target.value)}><option value="all">All access statuses</option>{["accessible", "restricted", "unavailable", "unknown"].map(value => <option key={value}>{value}</option>)}</select></label></div><p className="source-filter-result" role="status">{filteredSources.length} sources match the current search and access filter.</p><div className="workspace-columns"><Card><h2>Source explorer</h2>{filteredSources.map((source, index) => <button key={`${source.id}:${index}`} className="workspace-list-item" aria-pressed={sourceId === source.id} onClick={() => setSourceId(source.id)}><strong>{source.title}</strong><span>{source.year ?? "Year not reported"} · {source.access_status ?? "unknown"}</span></button>)}{!filteredSources.length && <Empty>{run.sources.length ? "No sources match these filters." : "No sources have been returned."}</Empty>}</Card><Card><h2>Source detail</h2><div key={sourceId} className="source-detail-content">{sourceId ? <SourceDetails run={run} sourceId={sourceId} onEvidence={openEvidence} /> : <Empty>Select a source to see its metadata and linked evidence.</Empty>}</div></Card></div></>}
                    {tab === "Evidence" && <><div className="workspace-filters"><label>Support status<select value={assessment} onChange={e => setAssessment(e.target.value)}><option value="all">All support statuses</option>{Object.entries(ASSESSMENT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><span>{visibleClaims.length} claims shown</span></div><div className="workspace-columns evidence-layout"><Card><ClaimLedger claims={claims} assessment={assessment} selectedId={selectedClaim?.id} onSelect={next => { setClaimId(next); setInspectedEvidence(undefined); setInspectorOpen(true); }} onReset={() => setAssessment("all")} /></Card><Card className="workspace-inspector"><button className="inspector-toggle" aria-expanded={inspectorOpen} onClick={() => setInspectorOpen(value => !value)}>{inspectorOpen ? "Close evidence panel −" : "Open evidence panel +"}</button>{!inspectorOpen && <p className="inspector-collapsed-note" role="status">Evidence panel closed. Reopen it to inspect the selected claim.</p>}<div className="inspector-body" data-open={inspectorOpen} inert={!inspectorOpen} aria-hidden={!inspectorOpen}><>{selectedClaim && !visibleClaims.includes(selectedClaim) && <p role="status">The selected claim is outside the current support filter. Select a visible claim or reset the filter.</p>}</><div className="claim-pagination"><Button disabled={!selectedClaim || visibleClaims.indexOf(selectedClaim) <= 0} onClick={() => openEvidence(visibleClaims[visibleClaims.indexOf(selectedClaim!) - 1].id)}>Previous claim</Button><Button disabled={!selectedClaim || (visibleClaims.indexOf(selectedClaim) < 0 || visibleClaims.indexOf(selectedClaim) === visibleClaims.length - 1)} onClick={() => openEvidence(visibleClaims[visibleClaims.indexOf(selectedClaim!) + 1].id)}>Next claim</Button></div><EvidenceDetail run={run} claimId={selectedClaim?.id ?? claimId} evidenceId={inspectedEvidence} onEvidence={(_, evidence) => setInspectedEvidence(evidence)} onSource={openSource} /></div></Card></div></>}
                    {tab === "Comparison" && <Card><div className="workspace-filters"><h2>Method comparison</h2><label>Sort methods<select value={sort} onChange={e => setSort(e.target.value)}><option value="original">Returned order</option><option value="method">Method A–Z</option><option value="dataset">Dataset A–Z</option></select></label></div>{!rows.length ? <Empty>No structured comparison data was returned.</Empty> : <><p className="workspace-muted">Scroll the table horizontally on small screens. Unknown values are not reported.</p><div className="comparison-scroll" role="region" aria-label="Scrollable method comparison" tabIndex={0}><table><caption>{demo ? "DEMO ONLY / fictional methods; " : ""}Different evaluation conditions may not be directly comparable.</caption><thead><tr>{["Method & detail", "Dataset", "Metric", "Result", "Units"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><details><summary>{row.method}</summary><p>{row.limitation ?? "Limitation not reported"}</p>{row.comparability_warning && <p className="comparison-warning">{row.comparability_warning}</p>}{row.claim_ids.map(id => claims.filter(c => c.id === id).length === 1 ? <button key={id} className="citation" onClick={() => openEvidence(id)}>Inspect claim {id}</button> : <p key={id}>Claim {id} unavailable</p>)}</details>{row.comparability_warning && <p className="comparison-warning">Comparison caution — expand for detail.</p>}</td><td>{row.dataset ?? "Not reported"}</td><td>{row.metric ?? "Not reported"}</td><td>{row.result ?? "Not reported"}</td><td>{row.units ?? "Not reported"}</td></tr>)}</tbody></table></div></>}</Card>}
                    {tab === "Activity" && <Activity run={run} />}
                </>}
            </section>
            <p className="workspace-footnote">Source support is not independent fact-checking. Review every finding before relying on it.</p>
        </main>
        <dialog ref={drawer} className="workspace-drawer" aria-labelledby="drawer-title" onKeyDown={trapDialogFocus} onClose={() => restoreDialogFocus(drawerOpener.current)}><div className="dialog-heading"><h2 id="drawer-title">Workspace navigation</h2><Button onClick={() => drawer.current?.close()}>Close navigation</Button></div><nav aria-label="Mobile workspace views">{WORKSPACE_TABS.map(name => <button key={name} aria-current={tab === name ? "page" : undefined} onClick={() => { setTab(name); drawer.current?.close(); }}>{name}<span aria-hidden="true">↗</span></button>)}</nav><p>{demo ? "Demo simulation / no live processing" : "Backend research"}</p></dialog>
        <dialog ref={dialog} className="workspace-dialog" aria-labelledby="inspector-title" onClose={() => restoreDialogFocus(opener.current)} onKeyDown={trapDialogFocus}><div className="dialog-heading"><h2 id="inspector-title">Inspect the evidence</h2><Button onClick={closeInspector}>Close inspector</Button></div>{run && <EvidenceDetail run={run} claimId={claimId} evidenceId={inspectedEvidence} onEvidence={(_, evidence) => setInspectedEvidence(evidence)} onSource={openSource} />}</dialog>
    </div></DemoDataContext>;
}
