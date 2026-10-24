"use client";

import { useEffect, useRef } from "react";
import { pointerOffsets } from "@/lib/landing/interaction-model";
import { Badge } from "@/components/ui";
import { ArrowIcon, MarkIcon } from "./icons";
export function Hero() {
    const hero = useRef<HTMLElement>(null);
    useEffect(() => {
        const element = hero.current;
        if (!element) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        const finePointer = window.matchMedia("(pointer: fine)");
        let frame = 0;
        let x = 0;
        let y = 0;
        function reset() {
            cancelAnimationFrame(frame);
            frame = 0;
            element!.style.removeProperty("--hero-x");
            element!.style.removeProperty("--hero-y");
        }
        function move(event: PointerEvent) {
            if (reduced.matches || !finePointer.matches || event.pointerType !== "mouse") return;
            x = event.clientX;
            y = event.clientY;
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = 0;
                const offset = pointerOffsets(x, y, element!.getBoundingClientRect());
                element!.style.setProperty("--hero-x", `${offset.x}px`);
                element!.style.setProperty("--hero-y", `${offset.y}px`);
            });
        }
        element.addEventListener("pointermove", move, { passive: true });
        element.addEventListener("pointerleave", reset);
        reduced.addEventListener("change", reset);
        finePointer.addEventListener("change", reset);
        return () => {
            reset();
            element.removeEventListener("pointermove", move);
            element.removeEventListener("pointerleave", reset);
            reduced.removeEventListener("change", reset);
            finePointer.removeEventListener("change", reset);
        };
    }, []);
    return <section ref={hero} className="hero landing-container" aria-labelledby="hero-title">
        <div className="hero-coordinate" aria-hidden="true">CITEZY / RESEARCH IN THE OPEN <span>QUESTION → CLAIM → EVIDENCE</span></div>
        <div className="hero-pointer-field" aria-hidden="true" /><div className="hero-copy">
            <div className="hero-eyebrow"><span className="status-dot" aria-hidden="true" /> FOR THE CURIOUS. AND THE SKEPTICAL.</div>
            <h1 id="hero-title" aria-label="Don't just cite it. Check it."><span className="hero-title-line">Don&apos;t just</span><span className="hero-title-line">cite it.</span><em className="hero-title-line">Check it.</em></h1>
            <p className="hero-description">Meet Citezy, the AI research workspace that shows the evidence behind every claim.</p>
            <div className="hero-actions"><a href="#research-question" className="primary-link">Start researching <ArrowIcon className="small-icon" /></a><a href="#how-it-works" className="secondary-link">See how it works <span aria-hidden="true">&#8600;</span></a></div>
            <p className="hero-note"><Badge className="demo-badge">Demo / simulated data</Badge><span>No live AI or source search in this preview.</span></p>
            <a className="hero-map-link" href="#evidence-map">Explore the evidence constellation <span aria-hidden="true">↓</span></a>
        </div>
        <EvidenceIllustration />
    </section>;
}
function EvidenceIllustration() {
    return <figure className="evidence-illustration" aria-labelledby="illustration-caption">
        <div className="orbit orbit-one" aria-hidden="true" /><div className="orbit orbit-two" aria-hidden="true" />
        <div className="illustration-index" aria-hidden="true">[ QUESTION &#8594; EVIDENCE ]</div>
        <div className="source-slip slip-back" aria-hidden="true"><span>THE SOURCE</span><div className="slip-lines"><i /><i /><i /></div></div>
        <div className="source-slip slip-front" aria-hidden="true"><span>THE EXCERPT</span><div className="slip-lines"><i /><i className="highlight-line" /><i /></div></div>
        <div className="evidence-connector" aria-hidden="true"><span /><span /><span /></div>
        <div className="claim-preview">
            <div className="preview-topline"><span><MarkIcon /> A BETTER QUESTION</span><span aria-hidden="true">01 / 03</span></div>
            <p>The citation exists.<br /><em>Does it support<br />the claim?</em></p>
            <div className="preview-bottom"><span className="preview-check" aria-hidden="true">&#8599;</span><span>Follow the evidence.<br /><strong>Keep your own judgment.</strong></span></div>
        </div>
        <div className="evidence-stamp" aria-hidden="true">STAY<br /><em>curious.</em></div>
        <figcaption id="illustration-caption">Illustrative concept. Not a research result.</figcaption>
    </figure>;
}
