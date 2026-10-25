import { afterEach, describe, expect, it, vi } from "vitest";
import { createBrowserDemoId } from "./demo-id";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe("browser demo IDs across local and LAN origins", () => {
    it("uses UUID when the browser supports it", () => {
        vi.stubGlobal("crypto", { randomUUID: () => "test-uuid" });
        expect(createBrowserDemoId()).toBe("demo-test-uuid");
    });
    it.each([undefined, {}])("works without secure-context UUID support: %s", crypto => {
        vi.stubGlobal("crypto", crypto);
        vi.spyOn(Date, "now").mockReturnValue(1000);
        vi.spyOn(Math, "random").mockReturnValue(0.5);
        const first = createBrowserDemoId(), second = createBrowserDemoId();
        expect(first).toMatch(/^demo-[a-z0-9-]+$/);
        expect(second).not.toBe(first);
    });
});
