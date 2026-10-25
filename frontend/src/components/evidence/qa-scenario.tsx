"use client";
import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { createEvidenceQaRun } from "@/lib/mock/qa-fixture";
import { ClaimInspector, SourceDetails } from "./claim-inspector";
const run = createEvidenceQaRun();
export function EvidenceQaScenario() {
    const [evidence, setEvidence] = useState("e3");
    const [claim, setClaim] = useState("c3");
    const [view, setView] = useState("inspector");
    const [source, setSource] = useState("s3");
    return <main id="main" className="workspace-main"><h1>DEMO ONLY · Evidence interaction QA</h1><p>Development-only scenario. Existing fictional excerpts are deliberately linked to an unsupported claim. Neither excerpt establishes the claim. The final reference is intentionally missing.</p><div className="claim-pagination"><Button onClick={() => setView("inspector")}>Show inspector</Button><Button onClick={() => setView("other")}>Hide inspector</Button></div><Card>{view === "inspector" ? <ClaimInspector run={run} claimId={claim} evidenceId={evidence} onEvidence={(_, id) => setEvidence(id)} onSource={id => { setSource(id); setView("source"); }} /> : view === "source" ? <SourceDetails run={run} sourceId={source} onEvidence={(claimId, id) => { setClaim(claimId); setEvidence(id); setView("inspector"); }} /> : <p>Inspector unmounted; selected evidence remains {evidence}.</p>}</Card></main>;
}
