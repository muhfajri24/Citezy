"use client";
import { useId, useLayoutEffect, useRef, useState } from "react";
import type { ResearchRun } from "@/types/research";
import { buildEvidenceGraph, traceSelection } from "@/lib/research/constellation";
import { ClaimInspector, SourceDetails } from "./claim-inspector";

export function EvidenceConstellation({ run, compact = false, onInspect, onSource }: { run: ResearchRun; compact?: boolean; onInspect?: (claim: string, evidence?: string) => void; onSource?: (source: string) => void }) {
    const graph = buildEvidenceGraph(run);
    const [selection, setSelection] = useState("question");
    const selected = graph.nodes.find(node => node.key === selection) ?? graph.nodes[0];
    const connected = traceSelection(graph, selected.key);
    const refs = useRef<(HTMLButtonElement | null)[]>([]);
    const panelId = useId();
    const detail = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => { if (detail.current) detail.current.scrollTop = 0; }, [selected.key]);
    const claim = selected.kind === "claim" ? run.report?.claims.find(c => c.id === selected.id) : undefined;
    const record = selected.kind === "evidence" ? run.evidence.find(e => e.id === selected.id) : undefined;
    const selectedPath = selected.kind !== "question" ? graph.paths.find(path => path.length === 4 && path.includes(selected.key)) : undefined;
    return <div className={`constellation ${compact ? "constellation-compact" : ""}`}>
        <div className="constellation-heading"><span className="section-kicker">THE EVIDENCE CONSTELLATION</span><span className="constellation-demo">DEMO ONLY</span></div>
        <p className="constellation-intro">An answer is a network.<br /><em>Pull on a thread.</em></p>
        {graph.nodes.length === 1 ? <div className="constellation-empty">No claim relationships are available yet. The map will appear when linked data is returned.</div> : <>
            <div className="constellation-columns" aria-hidden="true"><span>QUESTION</span><span>CLAIMS</span><span>EXCERPTS</span><span>SOURCES</span></div>
            <div className="constellation-map" role="group" aria-label="Evidence relationship map">
                <svg viewBox="0 0 960 420" preserveAspectRatio="none" aria-hidden="true"><defs><pattern id={`${panelId}-grid`} width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="currentColor" opacity=".16" /></pattern></defs><rect width="960" height="420" fill={`url(#${panelId}-grid)`} />{graph.edges.map(edge => {
                    const from = graph.nodes.find(n => n.key === edge.from)!, to = graph.nodes.find(n => n.key === edge.to)!;
                    const active = connected.has(edge.from) && connected.has(edge.to);
                    return <path key={`${selected.key}|${edge.from}|${edge.to}`} pathLength={1} style={{ animationDelay: `${from.kind === "question" ? 0 : from.kind === "claim" ? 45 : 90}ms` }} className={active ? "edge-active" : "edge-muted"} d={`M ${from.x * 9.6} ${from.y * 4.2} C ${(from.x + 12) * 9.6} ${from.y * 4.2}, ${(to.x - 12) * 9.6} ${to.y * 4.2}, ${to.x * 9.6} ${to.y * 4.2}`} />;
                })}</svg>
                {graph.nodes.map((node, index) => <button key={node.key} ref={el => { refs.current[index] = el; }} style={{ left: `${node.x}%`, top: `${node.y}%` }} className={`constellation-node node-${node.kind} ${connected.has(node.key) ? "is-connected" : "is-dimmed"}`} aria-label={`${node.label}: ${node.text}`} aria-pressed={selected.key === node.key} aria-controls={panelId} tabIndex={selected.key === node.key ? 0 : -1} onClick={() => setSelection(node.key)} onKeyDown={event => {
                    let next = index;
                    if (["ArrowRight", "ArrowDown"].includes(event.key)) next = (index + 1) % graph.nodes.length;
                    else if (["ArrowLeft", "ArrowUp"].includes(event.key)) next = (index + graph.nodes.length - 1) % graph.nodes.length;
                    else if (event.key === "Home") next = 0;
                    else if (event.key === "End") next = graph.nodes.length - 1;
                    else return;
                    event.preventDefault(); setSelection(graph.nodes[next].key); refs.current[next]?.focus();
                }}><span className="node-symbol" aria-hidden="true">{node.kind === "question" ? "?" : node.kind === "claim" ? "◇" : node.kind === "evidence" ? "≡" : "↗"}</span><span>{node.label}<small>{node.kind === "question" ? "START HERE" : node.id}</small></span></button>)}
            </div>
        </>}
        <div ref={detail} id={panelId} className="constellation-detail" aria-live="polite" aria-atomic="true"><div key={selected.key} className="constellation-detail-content">{selectedPath && <div className="constellation-trail" aria-label="One connected evidence path">{selectedPath.map((key, index) => <span key={key}>{index > 0 && <i aria-hidden="true">→</i>}{key === "question" ? "Question" : key.split(":").slice(1).join(":")}</span>)}</div>}<span className="section-kicker">{selected.kind.toUpperCase()} / {selected.kind === "question" ? "THE STARTING POINT" : selected.id}</span>{selected.kind === "question" && <p>{selected.text}</p>}{(claim || record) && <><ClaimInspector run={run} claimId={claim?.id ?? record!.claim_id} evidenceId={record?.id} onSource={onSource} />{onInspect && <button className="citation" onClick={() => onInspect(claim?.id ?? record!.claim_id, record?.id)}>Open claim inspector</button>}</>}{selected.kind === "source" && <SourceDetails run={run} sourceId={selected.id} onEvidence={onInspect} />}<small>{connected.size > 0 ? `${connected.size} connected nodes` : "No resolved connections"} · {graph.omitted ? `First 12 claims shown; ${graph.omitted} more in the claim ledger.` : "Only supplied relationships are shown."}</small></div></div>
        <p className="constellation-help">Click a node or use arrow keys to trace it. All demonstration sources and excerpts are fictional.</p>
    </div>;
}
