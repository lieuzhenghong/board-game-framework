export var UIState;
(function (UIState) {
    UIState["Base"] = "Base";
    UIState["Drag"] = "Drag";
    UIState["Entity UI"] = "Entity UI";
    UIState["Change Zone"] = "Change Zone";
    UIState["Change Position"] = "Change Position";
})(UIState || (UIState = {}));
export class UIHandler {
    constructor(window, canvas, ctx, virtualCanvasSize, clientCore) {
        this.window = window;
        this.canvas = canvas;
        this.ctx = ctx;
        this.virtualCanvasSize = virtualCanvasSize;
        this.clientCore = clientCore;
        window.addEventListener("click", this._handle_mouse_event);
        window.addEventListener("mousemove", this._handle_mouse_event);
    }
    _handle_mouse_event(e) {
        // send a UIAction to the ClientCore object
        // a UIAction is the [event type : String, Point, button_clicked]
        let tuple;
        const cvsRect = this.canvas.getBoundingClientRect();
        const translated = {
            x: e.clientX - cvsRect.x,
            y: e.clientY - cvsRect.y,
        };
        const mouse = {
            x: (translated.x * this.virtualCanvasSize) / this.canvas.width,
            y: (translated.x * this.virtualCanvasSize) / this.canvas.height,
        };
        if (e.type === "click") {
            tuple = [e.type, mouse, e.button];
        }
        else {
            tuple = [e.type, mouse, -1];
        }
        // TODO send this tuple to the ClientCore object
        this.clientCore.receive_ui_event(tuple);
        return tuple;
    }
}
