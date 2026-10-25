"use client";
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { createDepthMotion, narrativeProgress } from "@/lib/motion/system";
import { pointerOffsets } from "@/lib/landing/interaction-model";

export function usePointerDepth<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const reduced = matchMedia("(prefers-reduced-motion: reduce)"), fine = matchMedia("(pointer: fine)");
        let visible = true;
        const motion = createDepthMotion(point => { element.style.setProperty("--hero-x", `${point.x}px`); element.style.setProperty("--hero-y", `${point.y}px`); });
        const reset = () => motion.reset();
        const move = (event: PointerEvent) => {
            if (reduced.matches || !fine.matches || !visible || document.hidden || event.pointerType !== "mouse") return;
            motion.move(pointerOffsets(event.clientX, event.clientY, element.getBoundingClientRect()));
        };
        const leave = () => { if (!reduced.matches && visible) motion.move({ x: 0, y: 0 }); else reset(); };
        const visibility = () => { if (document.hidden) reset(); };
        const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; if (!visible) reset(); }) : null;
        observer?.observe(element);
        element.addEventListener("pointermove", move, { passive: true }); element.addEventListener("pointerleave", leave);
        reduced.addEventListener("change", reset); fine.addEventListener("change", reset); document.addEventListener("visibilitychange", visibility);
        return () => { motion.dispose(); observer?.disconnect(); element.style.removeProperty("--hero-x"); element.style.removeProperty("--hero-y"); element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", leave); reduced.removeEventListener("change", reset); fine.removeEventListener("change", reset); document.removeEventListener("visibilitychange", visibility); };
    }, []);
    return ref;
}

/** Scroll writes one CSS variable per frame, only while the section is in view. */
export function useNarrativeProgress(ref: RefObject<HTMLElement | null>) {
    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        let frame = 0, visible = false;
        const update = () => {
            frame = 0;
            if (!visible || document.hidden) return;
            const rect = element.getBoundingClientRect();
            element.style.setProperty("--story-progress", String(narrativeProgress(rect.top, rect.bottom, innerHeight)));
        };
        const schedule = () => { if (visible && !document.hidden && !frame) frame = requestAnimationFrame(update); };
        const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; if (visible) schedule(); else { cancelAnimationFrame(frame); frame = 0; } }) : null;
        observer?.observe(element);
        if (!observer) { visible = true; schedule(); }
        window.addEventListener("scroll", schedule, { passive: true }); window.addEventListener("resize", schedule, { passive: true }); document.addEventListener("visibilitychange", schedule);
        return () => { observer?.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); document.removeEventListener("visibilitychange", schedule); element.style.removeProperty("--story-progress"); };
    }, [ref]);
}

export function useTabIndicator(ref: RefObject<HTMLDivElement | null>, selected: string) {
    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;
        const update = () => {
            const tab = element.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
            if (!tab) return;
            element.style.setProperty("--tab-x", `${tab.offsetLeft}px`); element.style.setProperty("--tab-width", `${tab.offsetWidth}px`);
        };
        update();
        const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
        observer?.observe(element);
        const tab = element.querySelector('[aria-selected="true"]'); if (tab) observer?.observe(tab);
        return () => observer?.disconnect();
    }, [ref, selected]);
}
