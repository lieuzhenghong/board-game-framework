import { ClientGameCore } from "./GameCore";

class UIHandler {
  window: Window;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  clientCore: ClientGameCore;
  virtualCanvasSize: number;

  constructor(
    window: Window,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    virtualCanvasSize: number,
    clientCore: ClientGameCore
  ) {
    this.window = window;
    this.canvas = canvas;
    this.ctx = ctx;
    this.virtualCanvasSize = virtualCanvasSize;
    this.clientCore = clientCore;
    window.addEventListener("click", this._handle_mouse_event);
    window.addEventListener("mousemove", this._handle_mouse_event);
  }

  _handle_mouse_event(e: MouseEvent): UIAction {
    // send a UIAction to the ClientCore object
    // a UIAction is the [event type : String, Point, button_clicked]

    let tuple: UIAction;
    const cvsRect = this.canvas.getBoundingClientRect();
    const translated: Point = {
      x: e.clientX - cvsRect.x,
      y: e.clientY - cvsRect.y,
    };
    const mouse: Point = {
      x: (translated.x * this.virtualCanvasSize) / this.canvas.width,
      y: (translated.x * this.virtualCanvasSize) / this.canvas.height,
    };

    if (e.type === "click") {
      tuple = [e.type, mouse, e.button];
    } else {
      tuple = [e.type, mouse, -1];
    }
    // TODO send this tuple to the ClientCore object
    this.clientCore.receive_ui_event(tuple);
    return tuple;
  }
}

export { UIHandler };
