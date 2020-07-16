class UIHandler {
    constructor(window, canvas, ctx) {
        this.window = window;
        this.canvas = canvas;
        this.ctx = ctx;
        window.addEventListener("mousedown", this.handleClick);
    }
    handleClick(e) {
        // send a mouse position to the ClientCore object
        let buttonPressed = e.button; // 0 is left click, 2 is right click
        const cvsRect = this.canvas.getBoundingClientRect();
        const translated = {
            x: e.clientX - cvsRect.x,
            y: e.clientY - cvsRect.y,
        };
        const mouse = {
            x: (translated.x * virtualCanvasSize) / this.canvas.width,
            y: (translated.x * virtualCanvasSize) / this.canvas.height,
        };
        const tuple = [mouse, buttonPressed];
        // TODO send this tuple to the ClientCore object
    }
}
