class UIHandler {
  window: Window;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(
    window: Window,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    this.window = window;
    this.canvas = canvas;
    this.ctx = ctx;
    window.addEventListener("mousedown", this.handleClick);
  }

  handleClick(e: MouseEvent) {
    // send a mouse position to the ClientCore object
    let buttonPressed = e.button; // 0 is left click, 2 is right click
    const cvsRect = this.canvas.getBoundingClientRect();
    const translated: Point = {
      x: e.clientX - cvsRect.x,
      y: e.clientY - cvsRect.y,
    };
    const mouse: Point = {
      x: (translated.x * virtualCanvasSize) / this.canvas.width,
      y: (translated.x * virtualCanvasSize) / this.canvas.height,
    };

    const tuple: UIAction = [mouse, buttonPressed];
    // TODO send this tuple to the ClientCore object
  }
}
