import { describe, expect, it, vi } from "vitest";
import { createDepthMotion, dampPoint, inverseLayout, narrativeProgress } from "./system";

function clock() {
    let id = 0;
    const frames = new Map<number, FrameRequestCallback>();
    const request = (callback: FrameRequestCallback) => { frames.set(++id, callback); return id; };
    const cancel = (key: number) => { frames.delete(key); };
    const tick = (time: number) => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(time)); };
    return { frames, request, cancel, tick };
}
describe("purposeful motion lifecycle", () => {
    it("interpolates toward a target without teleporting or overshooting", () => {
        const value = dampPoint({ x: 0, y: 0 }, { x: 14, y: -14 }, 16);
        expect(value.x).toBeGreaterThan(0); expect(value.x).toBeLessThan(14);
        expect(value.y).toBeLessThan(0); expect(value.y).toBeGreaterThan(-14);
    });
    it("settles at the same position for equal time at different frame rates", () => {
        const target = { x: 14, y: -7 };
        let fast = { x: 0, y: 0 }, slow = { x: 0, y: 0 };
        for (let i = 0; i < 10; i++) fast = dampPoint(fast, target, 10);
        for (let i = 0; i < 5; i++) slow = dampPoint(slow, target, 20);
        expect(fast.x).toBeCloseTo(slow.x, 10); expect(fast.y).toBeCloseTo(slow.y, 10);
    });
    it("does not reverse direction on a stale frame timestamp", () => expect(dampPoint({ x: 2, y: 3 }, { x: 8, y: 9 }, -10)).toEqual({ x: 2, y: 3 }));
    it("coalesces targets into one scheduled frame", () => {
        const timer = clock(), write = vi.fn(), motion = createDepthMotion(write, timer.request, timer.cancel);
        motion.move({ x: 3, y: 1 }); motion.move({ x: 10, y: 5 });
        expect(timer.frames.size).toBe(1); expect(write).not.toHaveBeenCalled();
        timer.tick(16); expect(write.mock.calls[0][0].x).toBeGreaterThan(0); expect(timer.frames.size).toBe(1); motion.dispose();
    });
    it("stops requesting frames after reaching rest", () => {
        const timer = clock(), write = vi.fn(), motion = createDepthMotion(write, timer.request, timer.cancel);
        motion.move({ x: 14, y: -14 }); for (let i = 1; i <= 80; i++) timer.tick(i * 16);
        expect(timer.frames.size).toBe(0); expect(write.mock.calls.at(-1)?.[0]).toEqual({ x: 14, y: -14 }); motion.dispose();
    });
    it("cancels work and resets when the hero becomes hidden", () => {
        const timer = clock(), write = vi.fn(), motion = createDepthMotion(write, timer.request, timer.cancel);
        motion.move({ x: 14, y: 4 }); timer.tick(16); motion.reset();
        expect(timer.frames.size).toBe(0); expect(write.mock.calls.at(-1)?.[0]).toEqual({ x: 0, y: 0 }); motion.dispose();
    });
    it("ignores stale callbacks and new targets after disposal", () => {
        const timer = clock(), write = vi.fn(), motion = createDepthMotion(write, timer.request, timer.cancel);
        motion.move({ x: 14, y: 4 }); const stale = [...timer.frames.values()][0]; motion.dispose(); stale(16); motion.move({ x: 9, y: 9 });
        expect(write).not.toHaveBeenCalled(); expect(timer.frames.size).toBe(0);
    });
});
describe("narrative progress and layout continuity", () => {
    it.each([[700, 1700, 700, 0], [0, 1000, 1000, .5], [-1000, 0, 700, 1], [50, 50, 700, 0], [0, Infinity, 700, 0], [0, 1000, 0, 0]])("clamps section %s..%s at viewport %s", (top, bottom, height, expected) => expect(narrativeProgress(top, bottom, height)).toBe(expected));
    it("inverts one layout change using transforms", () => expect(inverseLayout({ left: 222, top: 78, width: 1000, height: 900 }, { left: 76, top: 78, width: 1146, height: 900 })).toBe(`translate(146px, 0px) scale(${1000 / 1146}, 1)`));
    it("skips zero-size hidden layouts", () => expect(inverseLayout({ left: 0, top: 0, width: 100, height: 100 }, { left: 0, top: 0, width: 0, height: 0 })).toBeNull());
});
