"use client";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ResearchRun } from "@/types/research";
import { buildEvidenceGraph, pathsForEdge, traceSelection } from "@/lib/research/constellation";
import { ClaimInspector, SourceDetails } from "./claim-inspector";

export function EvidenceConstellation({ run, compact = false, onInspect, onSource }: { run: ResearchRun; compact?: boolean; onInspect?: (claim: string, evidence?: string) => void; onSource?: (source: string) => void }) {
    const graph = useMemo(() => buildEvidenceGraph(run), [run]);
    const [selection, setSelection] = useState("question");
    const [preview, setPreview] = useState<string | null>(null);
    const [flow, setFlow] = useState<string | null>(null);
    const flows = graph.paths.filter(path => path.length === 4);
    const selectedFlow = flows.find(path => JSON.stringify(path) === flow);
    const selected = graph.nodes.find(node => node.key === selection) ?? graph.nodes[0];
    const selectedConnected = selectedFlow ? new Set(selectedFlow) : traceSelection(graph, selected.key);
    const connected = preview ? traceSelection(graph, preview) : selectedConnected;
    const refs = useRef<(HTMLButtonElement | null)[]>([]);
    const panelId = useId();
    const detail = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => { if (detail.current) detail.current.scrollTop = 0; }, [selected.key]);
    const claim = selected.kind === "claim" ? run.report?.claims.find(c => c.id === selected.id) : undefined;
    const record = selected.kind === "evidence" ? run.evidence.find(e => e.id === selected.id) : undefined;
    const selectedPath = selectedFlow ?? (selected.kind !== "question" ? flows.find(path => path.includes(selected.key)) : undefined);
    const selectNode = (key: string) => { setPreview(null); setSelection(key); if (!selectedFlow?.includes(key)) setFlow(null); };
    const selectFlow = (path: string[]) => { setPreview(null); setFlow(JSON.stringify(path)); setSelection(path[1]); };
    const selectEdge = (from: string, to: string) => {
        const matches = pathsForEdge(graph, from, to);
        if (matches.length === 1) selectFlow(matches[0]);
        else { setFlow(null); setPreview(null); setSelection(to); }
    };
    return <div className={`constellation ${compact ? "constellation-compact" : ""}`}>
        <div className="constellation-heading"><span className="section-kicker">THE EVIDENCE CONSTELLATION</span><span className="constellation-demo">DEMO ONLY</span></div>
        <p className="constellation-intro">An answer is a network.<br /><em>Pull on a thread.</em></p>
        {flows.length > 0 && <div className="constellation-flows" role="group" aria-label="Choose an evidence flow"><p>Choose a flow, click a connecting line, or select a node.</p>{flows.map((path, index) => <button type="button" key={JSON.stringify(path)} aria-pressed={JSON.stringify(path) === flow} aria-controls={panelId} onClick={() => selectFlow(path)}>Flow {String(index + 1).padStart(2, "0")} <span>{path.slice(1).map(key => graph.nodes.find(node => node.key === key)!.id).join(" → ")}</span></button>)}</div>}
        {graph.nodes.length === 1 ? <div className="constellation-empty">No claim relationships are available yet. The map will appear when linked data is returned.</div> : <>
            <div className="constellation-columns" aria-hidden="true"><span>QUESTION</span><span>CLAIMS</span><span>EXCERPTS</span><span>SOURCES</span></div>
            <div className="constellation-map" role="group" aria-label="Evidence relationship map">
                <svg viewBox="0 0 960 420" preserveAspectRatio="none" aria-hidden="true"><defs><pattern id={`${panelId}-grid`} width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="currentColor" opacity=".16" /></pattern></defs><rect width="960" height="420" fill={`url(#${panelId}-grid)`} />{graph.edges.map(edge => {
                    const from = graph.nodes.find(n => n.key === edge.from)!, to = graph.nodes.find(n => n.key === edge.to)!;
                    const active = connected.has(edge.from) && connected.has(edge.to);
                    return <g key={`${selected.key}|${preview ?? "selected"}|${edge.from}|${edge.to}`}><path pathLength={1} style={{ animationDelay: `${from.kind === "question" ? 0 : from.kind === "claim" ? 45 : 90}ms` }} className={active ? "edge-active" : "edge-muted"} d={`M ${from.x * 9.6} ${from.y * 4.2} C ${(from.x + 12) * 9.6} ${from.y * 4.2}, ${(to.x - 12) * 9.6} ${to.y * 4.2}, ${to.x * 9.6} ${to.y * 4.2}`} /><path className="edge-hit" onClick={() => selectEdge(edge.from, edge.to)} d={`M ${from.x * 9.6} ${from.y * 4.2} C ${(from.x + 12) * 9.6} ${from.y * 4.2}, ${(to.x - 12) * 9.6} ${to.y * 4.2}, ${to.x * 9.6} ${to.y * 4.2}`} />{active && <path pathLength={1} className="edge-flow" d={`M ${from.x * 9.6} ${from.y * 4.2} C ${(from.x + 12) * 9.6} ${from.y * 4.2}, ${(to.x - 12) * 9.6} ${to.y * 4.2}, ${to.x * 9.6} ${to.y * 4.2}`} />}</g>;
                })}</svg>
                {graph.nodes.map((node, index) => <button key={node.key} ref={el => { refs.current[index] = el; }} style={{ left: `${node.x}%`, top: `${node.y}%` }} className={`constellation-node node-${node.kind} ${connected.has(node.key) ? "is-connected" : "is-dimmed"}`} aria-label={`${node.label}: ${node.text}`} aria-pressed={selected.key === node.key} onPointerEnter={event => { if (event.pointerType === "mouse") setPreview(node.key); }} onPointerLeave={() => setPreview(null)} onBlur={() => setPreview(null)} aria-controls={panelId} tabIndex={selected.key === node.key ? 0 : -1} onClick={() => selectNode(node.key)} onKeyDown={event => {
                    let next = index;
                    if (["ArrowRight", "ArrowDown"].includes(event.key)) next = (index + 1) % graph.nodes.length;
                    else if (["ArrowLeft", "ArrowUp"].includes(event.key)) next = (index + graph.nodes.length - 1) % graph.nodes.length;
                    else if (event.key === "Home") next = 0;
                    else if (event.key === "End") next = graph.nodes.length - 1;
                    else return;
                    event.preventDefault(); selectNode(graph.nodes[next].key); refs.current[next]?.focus();
                }}><span className="node-symbol" aria-hidden="true">{node.kind === "question" ? "?" : node.kind === "claim" ? "◇" : node.kind === "evidence" ? "≡" : "↗"}</span><span>{node.label}<small>{node.kind === "question" ? "START HERE" : node.id}</small></span></button>)}
            </div>
        </>}
        <p className="sr-only" role="status">{selected.label} {selected.id} selected. {selectedConnected.size} connected nodes.</p><div ref={detail} id={panelId} className="constellation-detail"><div key={selected.key} className="constellation-detail-content">{selectedPath && <div className="constellation-trail" aria-label="One connected evidence path">{selectedPath.map((key, index) => <span key={key}>{index > 0 && <i aria-hidden="true">→</i>}{key === "question" ? "Question" : key.split(":").slice(1).join(":")}</span>)}</div>}<span className="section-kicker">{selected.kind.toUpperCase()} / {selected.kind === "question" ? "THE STARTING POINT" : selected.id}</span>{selected.kind === "question" && <p>{selected.text}</p>}{(claim || record) && <><ClaimInspector run={run} claimId={claim?.id ?? record!.claim_id} evidenceId={record?.id ?? (selectedFlow ? graph.nodes.find(node => node.key === selectedFlow[2])?.id : undefined)} onSource={onSource} />{onInspect && <button className="citation" onClick={() => onInspect(claim?.id ?? record!.claim_id, record?.id)}>Open claim inspector</button>}</>}{selected.kind === "source" && <SourceDetails run={run} sourceId={selected.id} onEvidence={onInspect} />}<small>{selectedConnected.size > 0 ? `${selectedConnected.size} connected nodes` : "No resolved connections"} · {graph.omitted ? `First 12 claims shown; ${graph.omitted} more in the claim ledger.` : "Only supplied relationships are shown."}</small></div></div>
        <p className="constellation-help">Click a node or use arrow keys to trace it. All demonstration sources and excerpts are fictional.</p>
    </div>;
}
