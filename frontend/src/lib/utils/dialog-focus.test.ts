import { describe, expect, it, vi } from "vitest";
import type { KeyboardEvent } from "react";
import { restoreDialogFocus, trapDialogFocus } from "./dialog-focus";
function control(visible = true, hidden = false) {
    return { getClientRects: () => visible ? [{}] : [], closest: () => hidden ? {} : null, focus: vi.fn(), isConnected: true };
}
describe("modal focus boundaries", () => {
    it.each([false,true])("wraps focus at the visible boundary, reverse=%s", reverse => {
        const first=control(), last=control(), hidden=control(true,true), invisible=control(false);
        const event={key:"Tab",shiftKey:reverse,preventDefault:vi.fn(),currentTarget:{querySelectorAll:()=>[first,last,hidden,invisible],ownerDocument:{activeElement:reverse?first:last}}};
        trapDialogFocus(event as unknown as KeyboardEvent<HTMLDialogElement>);
        expect(event.preventDefault).toHaveBeenCalled(); expect(reverse?last.focus:first.focus).toHaveBeenCalled();
    });
    it("retains focus on the modal when no usable controls remain", () => {
        const focus=vi.fn(), preventDefault=vi.fn();
        trapDialogFocus({key:"Tab",preventDefault,currentTarget:{querySelectorAll:()=>[],focus}} as unknown as KeyboardEvent<HTMLDialogElement>);
        expect(focus).toHaveBeenCalled(); expect(preventDefault).toHaveBeenCalled();
    });
    it("does not focus a detached or hidden opener", () => {
        const node=control(); node.isConnected=false; restoreDialogFocus(node as unknown as HTMLElement); expect(node.focus).not.toHaveBeenCalled();
        const hidden=control(true,true); restoreDialogFocus(hidden as unknown as HTMLElement); expect(hidden.focus).not.toHaveBeenCalled();
        const visible=control(); restoreDialogFocus(visible as unknown as HTMLElement); expect(visible.focus).toHaveBeenCalled();
    });
});
