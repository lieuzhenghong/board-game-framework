class UIHandler {
  // Idea: store a finite state machine here so that we can be sensitive
  // to context.

  // There are a couple of actions I want to support right now
  // as an MVP:

  // == OPTION TYPE 1 ==
  // Right-click on object to open context menu, then
  // left-click on an option.

  // Choice of options:
  // --> change state of Entity (maybe this is a submenu)
  // --> enter "change of Zone" mode where the next left click on a new Zone
  // changes the entity to that zone, if permitted
  // --> enter "change position" mode where the next left click at any position
  // moves the entity to that position

  // We should also implement the following option type:
  // == OPTION TYPE 2 ==

  // Left-click an object to enter "drag" mode, then
  // move the mouse anywhere to move the entity's position.
  // Left-click again to drop the entity.
  // Note that this doesn't change the entity's zone.

  //             Change State Mode
  //                    ^
  //                    |
  //                    |
  // Base Mode --> Entity UI Mode -->  Change Position Mode
  //   |  ^             |
  //   |  |             |
  //   v  |             v
  // Drag mode    Change Zone mode

  // We will also have a ContextMenu that is generated
  // and probably also some flags like CurrentlyDraggingEntity
  // and EntityCurrentlyDragged

  //
  //                                ________________                _________
  //                                |               |               |        |
  // UI [posx, posy, LMB, RMB] ===> |    GameCore   | Action[] ===> | Server |
  //                                |_______________|          <=== |________|
  //                                        |
  //                                        | Action[]
  //                                        v
  //                                    GameState
  //
  /*
  // Client UI sends mouse positions/clicks to Client Core
  // Client Core converts mouse states to actions (by referencing current game state)
  // Client Core sends actions to Server Core
  // Server Core accumulates and validates actions from all Client Cores
  // Server Core sends actions to Client Cores
  // Client Core converts mouse states into Context UI
  // Client Core applies actions to GameState
  // Client Core renders GameState
  // ClientCore renders Context UI
*/
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

    const tuple: [Point, number] = [mouse, buttonPressed];
    // TODO send this tuple to the ClientCore object
  }
}
