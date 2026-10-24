"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { ResearchRun } from "@/types/research";
import { Badge } from "@/components/ui";
import { ASSESSMENT_LABELS, selectDemoClaim } from "@/lib/landing/interaction-model";
import { ExternalIcon } from "./icons";

export function EvidencePreview({ run }: { run: ResearchRun }) {
    const claims = run.report?.claims ?? [];
    const [selectedId, setSelectedId] = useState(claims[0]?.id ?? "");
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const panel = useRef<HTMLDivElement>(null);
    const baseId = useId();
    const selected = selectDemoClaim(run, selectedId);
    function navigateClaim(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        let next = index;
        if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % claims.length;
        else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + claims.length) % claims.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = claims.length - 1;
        else return;
        event.preventDefault();
        setSelectedId(claims[next].id);
        tabs.current[next]?.focus();
    }
    return <section id="evidence-preview" className="evidence-demo-section landing-container" aria-labelledby="evidence-demo-title">
        <div className="section-heading">
            <div><p className="section-kicker">DON&apos;T TAKE OUR WORD FOR IT.</p><h2 id="evidence-demo-title">Click a claim.<br /><em>Follow its evidence.</em></h2></div>
            <p>This is a working interaction, not a screenshot.<br />Choose a fictional claim and inspect its support.</p>
        </div>
        <div className="demo-notice"><Badge className="demo-badge">DEMO ONLY</Badge><p>All studies, claims, excerpts and numbers below are fictional. No live research was performed.</p></div>
        <div className="evidence-demo-grid">
            <div className="demo-claim-list" role="tablist" aria-label="Fictional research claims" aria-orientation="vertical">
                {claims.map((claim, index) => <button type="button" role="tab" key={claim.id}
                    ref={(node) => { tabs.current[index] = node; }}
                    id={`${baseId}-tab-${claim.id}`} aria-controls={`${baseId}-panel`}
                    aria-selected={selectedId === claim.id} tabIndex={selectedId === claim.id ? 0 : -1}
                    onClick={(event) => {
                        setSelectedId(claim.id);
                        if (event.detail > 0 && window.matchMedia("(max-width: 900px)").matches) {
                            panel.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
                        }
                    }} onKeyDown={(event) => navigateClaim(event, index)}
                    className={`demo-claim ${selectedId === claim.id ? "is-selected" : ""}`}>
                    <span className="demo-claim-top"><span>CLAIM 0{index + 1}</span><span aria-hidden="true">&#8599;</span></span>
                    <span className="demo-claim-text">{claim.text}</span>
                    <span className={`support-label assessment-${claim.assessment}`}><span aria-hidden="true" />{ASSESSMENT_LABELS[claim.assessment]}</span>
                </button>)}
            </div>
            <div ref={panel} role="tabpanel" id={`${baseId}-panel`} aria-labelledby={selected ? `${baseId}-tab-${selected.claim.id}` : undefined} tabIndex={0} className="demo-evidence-panel">
                <div className="evidence-pane-stack">
                    {(claims.length ? claims.map((claim) => claim.id) : [""]).map((id) => {
                        const active = id === selectedId;
                        return <div key={id} className={`evidence-panel-content ${active ? "is-active" : ""}`} aria-hidden={!active} inert={!active}>
                            <EvidenceDetail selected={selectDemoClaim(run, id)} />
                        </div>;
                    })}
                </div>
                <p className="evidence-caveat">Source support is not independent fact-checking.</p>
            </div>
        </div>
        <p className="demo-keyboard-hint">Use arrow keys to switch claims, then Tab to explore the evidence. These are examples, not findings.</p>
    </section>;
}

function EvidenceDetail({ selected }: { selected: ReturnType<typeof selectDemoClaim> }) {
    return <>
                    <div className="evidence-panel-top"><span className="section-kicker">THE EVIDENCE</span><span className="demo-record-id">{selected?.claim.id ?? "UNAVAILABLE"}</span></div>
                    {!selected ? <p>No claim is available for inspection.</p> : <>
                        <h3>{ASSESSMENT_LABELS[selected.claim.assessment]}</h3>
                        {selected.resolution.available ? <>
                            <div className="demo-source"><span>FICTIONAL SOURCE</span><h4>{selected.resolution.source.title}</h4><a href={selected.resolution.source.url} target="_blank" rel="noopener noreferrer">{selected.resolution.source.domain ?? "example.org"}<ExternalIcon className="small-icon" /><span className="sr-only"> (opens in a new tab)</span></a></div>
                            <span className="excerpt-label">PROVIDED DEMO EXCERPT</span>
                            <blockquote>{selected.resolution.evidence.excerpt}</blockquote>
                            <div className="evidence-explanation"><span>WHY THIS ASSESSMENT?</span><p>{selected.resolution.evidence.explanation ?? selected.claim.explanation ?? "No explanation was provided."}</p></div>
                        </> : <div className="missing-evidence" role="status">Evidence unavailable. The referenced excerpt or source could not be resolved safely. No substitute evidence is shown.</div>}
                    </>}
    </>;
}
