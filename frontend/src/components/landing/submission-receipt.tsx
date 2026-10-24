"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Brand } from "./brand";
import { Badge } from "@/components/ui";
import { getDemoResearchApi } from "@/lib/api/demo-client";

/** A submission receipt only: no polling, pipeline timeline or report/workbench UI. */
export function SubmissionReceipt({ id }: { id: string }) {
    const [receipt, setReceipt] = useState<{ question: string } | { error: true } | null>(null);
    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        async function readReceipt() {
            try {
                const run = await getDemoResearchApi().getRun(id, controller.signal);
                if (active) setReceipt({ question: run.question });
            } catch {
                if (active) setReceipt({ error: true });
            }
        }
        void readReceipt();
        return () => { active = false; controller.abort(); };
    }, [id]);
    return <div className="landing-page receipt-page"><header className="landing-container receipt-nav"><Brand /><Badge className="demo-badge">Demo / simulated data</Badge></header><main id="main" tabIndex={-1} className="landing-container receipt-main">
        <p className="section-kicker">{receipt && "error" in receipt ? "DEMO SESSION UNAVAILABLE" : "YOUR QUESTION, RECEIVED."}</p>
        <h1>{receipt === null ? "Opening your demo request..." : "error" in receipt ? "Let's start fresh." : "A good place to start."}</h1>
        <div role="status">{receipt === null ? <p>Looking for your simulated request.</p> : "error" in receipt ? <p>This request is unavailable. Demo requests stay in this tab&apos;s session and reset on reload. Start a new request to continue.</p> : <><p className="receipt-label">YOUR RESEARCH QUESTION</p><blockquote>{receipt.question}</blockquote><p>Your simulated request has been created. No live search or AI processing has taken place. Progress and research reports are not available in this preview.</p></>}</div>
        <Link href="/#research-question" className="primary-link">Ask another question <span aria-hidden="true">&#8594;</span></Link>
    </main></div>;
}
