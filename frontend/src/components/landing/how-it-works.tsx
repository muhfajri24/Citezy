"use client";

import { useEffect, useRef, useState } from "react";
import type { ResearchRun } from "@/types/research";
import { Badge } from "@/components/ui";
import { STORY_STAGES, ASSESSMENT_LABELS, getActiveStoryIndex, getStoryScrollTarget } from "@/lib/landing/interaction-model";
import { MarkIcon } from "./icons";

export function HowItWorks({ run }: { run: ResearchRun }) {
    const [active, setActive] = useState(0);
    const steps = useRef<(HTMLLIElement | null)[]>([]);
    useEffect(() => {
        if (!("IntersectionObserver" in window)) return;
        let observer: IntersectionObserver | undefined;
        function observe() {
            observer?.disconnect();
            const height = window.innerHeight;
            const line = height * (window.matchMedia("(max-width: 900px)").matches ? 0.7 : 0.45);
            const margin = Math.min(35, height / 10);
            observer = new IntersectionObserver((entries) => {
                if (!entries.some((entry) => entry.isIntersecting)) return;
                const rects = steps.current.map((step) => step?.getBoundingClientRect() ?? { top: Infinity, bottom: Infinity });
                setActive(getActiveStoryIndex(rects, line));
            }, { rootMargin: `-${Math.max(0, line - margin)}px 0px -${Math.max(0, height - line - margin)}px 0px`, threshold: 0 });
            steps.current.forEach((step) => { if (step) observer!.observe(step); });
        }
        observe();
        window.addEventListener("resize", observe, { passive: true });
        return () => { observer?.disconnect(); window.removeEventListener("resize", observe); };
    }, []);
    function choose(index: number) {
        setActive(index);
        const step = steps.current[index];
        if (!step) return;
        const line = window.innerHeight * (window.matchMedia("(max-width: 900px)").matches ? 0.7 : 0.45);
        window.scrollTo({ top: getStoryScrollTarget(window.scrollY, step.getBoundingClientRect(), line), behavior: "instant" });
    }
    return <section id="how-it-works" className="how-section living-story landing-container" aria-labelledby="how-title">
        <div className="section-heading"><div><p className="section-kicker">A RESEARCH TRAIL YOU CAN FOLLOW.</p><h2 id="how-title">How Citezy works.<br /><em>One step closer.</em></h2></div><p>Scroll to explore the intended workflow.<br />Or choose a stage to jump straight in.<br /><span className="section-disclaimer">DEMO walkthrough. Scroll position is not AI progress.</span></p></div>
        <div className="story-layout">
            <ol className="story-steps">{STORY_STAGES.map((stage, index) => <li key={stage.id} ref={(node) => { steps.current[index] = node; }} id={`story-${stage.id}`} className={`story-step ${active === index ? "is-active" : ""}`}>
                <span className="story-step-number">0{index + 1} / {stage.label.toUpperCase()}</span>
                <h3>{stage.title}</h3><p>{stage.description}</p>
                {index === 0 && <a href="#research-question">Try your own question &#8599;</a>}
                {index === 3 && <a href="#evidence-preview">Inspect the demo evidence &#8599;</a>}
            </li>)}</ol>
            <div className="story-panel">
                <div className="story-panel-heading"><span><MarkIcon /> A FICTIONAL RESEARCH TRAIL</span><Badge className="demo-badge">DEMO</Badge></div>
                <div className="story-stage-controls" role="group" aria-label="Explore research stages">{STORY_STAGES.map((stage, index) => <button type="button" key={stage.id} aria-pressed={active === index} aria-controls="story-visual" onClick={() => choose(index)}>{stage.label}</button>)}</div>
                <div id="story-visual" className="story-visual" role="region" tabIndex={0} aria-label={`${STORY_STAGES[active].label} stage illustration`}>
                    <div key={active} className="story-visual-content"><StoryVisual stage={STORY_STAGES[active].id} run={run} /></div>
                </div>
                <div className="story-panel-footer"><span>Illustrated step {active + 1} of 5</span><span>No live search or inference</span></div>
            </div>
        </div>
    </section>;
}

function StoryVisual({ stage, run }: { stage: typeof STORY_STAGES[number]["id"]; run: ResearchRun }) {
    if (stage === "question") return <><span className="story-visual-kicker">THE STARTING POINT</span><h3>A focused question.<br /><em>A traceable direction.</em></h3><div className="story-question">{run.question}</div><p className="story-visual-note">This example uses fictional retrieval methods.</p></>;
    if (stage === "search") return <><span className="story-visual-kicker">IDENTIFIABLE SOURCES</span><h3>A source trail.<br /><em>No mystery citations.</em></h3><div className="story-source-list">{run.sources.map((source) => <div key={source.id}><span>{source.id}</span><p>{source.title}<small>{source.domain ?? "example.org"}</small></p></div>)}</div></>;
    if (stage === "read") return <><span className="story-visual-kicker">THE WORDS BEHIND A CLAIM</span><h3>Go back<br /><em>to the excerpt.</em></h3><blockquote className="story-excerpt">{run.evidence[0]?.excerpt ?? "No excerpt provided."}</blockquote><p className="story-visual-note">Provided fictional text, not a quotation from a real paper.</p></>;
    if (stage === "verify") return <><span className="story-visual-kicker">SUPPORT, WITH LIMITS</span><h3>A reason.<br /><em>And clear limits.</em></h3><div className="story-assessments">{run.report?.claims.map((claim) => <div key={claim.id}><span>{claim.id}</span><span className={`support-label assessment-${claim.assessment}`}>{ASSESSMENT_LABELS[claim.assessment]}</span></div>)}</div><p className="story-visual-note">Source support is not independent fact-checking.</p></>;
    return <><span className="story-visual-kicker">THE BIGGER PICTURE</span><h3>Make room<br /><em>for the caveats.</em></h3><div className="story-report"><span>DEMO SUMMARY</span><p>{run.report?.summary ?? "No summary provided."}</p></div><p className="story-warning">Different datasets and metrics are not directly comparable.</p></>;
}
