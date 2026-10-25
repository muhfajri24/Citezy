export const MOTION = { fast: 140, panel: 220, reveal: 360, ease: "cubic-bezier(.22,1,.36,1)" } as const;
export type Point = { x: number; y: number };
/** Frame-rate-independent exponential settling without overshoot. */
export function dampPoint(current: Point, target: Point, elapsedMs: number): Point {
    const alpha = 1 - Math.exp(-Math.max(0, Math.min(100, elapsedMs)) / 65);
    return { x: current.x + (target.x - current.x) * alpha, y: current.y + (target.y - current.y) * alpha };
}
export function narrativeProgress(top: number, bottom: number, viewportHeight: number): number {
    const distance = bottom - top;
    if (!Number.isFinite(distance) || distance <= 0 || viewportHeight <= 0) return 0;
    return Math.max(0, Math.min(1, (viewportHeight * .5 - top) / distance));
}
export function createDepthMotion(write: (point: Point) => void, schedule = requestAnimationFrame, cancel = cancelAnimationFrame) {
    let current: Point = { x: 0, y: 0 }, target: Point = { x: 0, y: 0 };
    let frame = 0, previous = 0, disposed = false;
    function tick(time: number) {
        frame = 0;
        if (disposed) return;
        current = dampPoint(current, target, previous ? time - previous : 16);
        previous = time;
        if (Math.hypot(current.x - target.x, current.y - target.y) < .025) {
            current = { ...target }; previous = 0; write(current); return;
        }
        write(current); frame = schedule(tick);
    }
    return {
        move(point: Point) { if (disposed) return; target = { ...point }; if (!frame) frame = schedule(tick); },
        reset() { cancel(frame); frame = 0; previous = 0; current = target = { x: 0, y: 0 }; if (!disposed) write(current); },
        dispose() { disposed = true; cancel(frame); frame = 0; },
    };
}
export function inverseLayout(from: { left: number; top: number; width: number; height: number }, to: { left: number; top: number; width: number; height: number }) {
    if (to.width <= 0 || to.height <= 0) return null;
    return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;
}
