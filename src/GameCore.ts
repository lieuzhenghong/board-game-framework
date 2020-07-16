/*  Copyright 2012-2016 Sven "underscorediscovery" Bergström
    
    written by : http://underscorediscovery.ca
    written for : http://buildnewgames.com/real-time-multiplayer/
    
    MIT Licensed.
*/

//The main update loop runs on requestAnimationFrame,
//Which falls back to a setTimeout loop on the server
//Code below is from Three.js, and sourced from links below

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

var fixed_time_digits = 3;
function fixed(value: number, digits: number) {
  return parseFloat(value.toFixed(digits));
}

var frame_time = 60 / 1000; // run the local game at 16ms/ 60hz
if ("undefined" != typeof global) frame_time = 45; //on server we run at 45ms, 22hz

(function () {
  var lastTime = 0;
  var vendors = ["ms", "moz", "webkit", "o"];

  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
    window.cancelAnimationFrame =
      window[vendors[x] + "CancelAnimationFrame"] ||
      window[vendors[x] + "CancelRequestAnimationFrame"];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      var currTime = Date.now(),
        timeToCall = Math.max(0, frame_time - (currTime - lastTime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }
})();

//Now the main game class. This gets created on
//both server and client. Server creates one for
//each game that is hosted, and client creates one
//for itself to play the game.
/*
 * The game_core class */

//import GameState from "./GameState";

class Timer {
  public dt: number = new Date().getTime();
  public dte: number = new Date().getTime();
  public current_time: number = 0;
  public previous_time: number = 0;

  public constructor() {}

  public increment = function (t: number) {
    this.dt = t - this.dte;
    this.dte = t;
    this.previous_time = this.current_time;
    this.current_time = this.dt / 1000.0;
  };

  public initialize(interval): void {
    setInterval(
      function () {
        this.increment(new Date().getTime());
      }.bind(this),
      interval
    );
  }
}

// I'm intending this to eventually be extended by GameClientCore and GameServerCore.
abstract class GameCore {
  // GameCore members
  private game_state: GameState;
  private session_description: JSON;
  private local_timer: Timer;
  private physics_timer: Timer;
  private frame_timer: Timer;
  private delta_time_endpoint: number; // Previous time, but somehow not last frame time
  private server: boolean;
  private update_id;
  private viewport;

  // GameCore methods
  public constructor(
    session_description: JSON,
    initial_state: GameState | JSON
  ) {
    this.session_description = session_description;

    if (initial_state instanceof GameState) {
      this.game_state = initial_state;
    }
    if (typeof initial_state === "string") {
      initial_state = JSON.parse(initial_state);
      this.game_state = new GameState(
        initial_state["gamestate"],
        initial_state["imagemap"],
        null,
        null
      );
    }
    this.local_timer.current_time = 0.016;
    this.frame_timer.current_time = 0;
    this.server = session_description !== undefined;

    this.local_timer.initialize(4);
    this.physics_timer.initialize(15);
  } // constructor

  abstract role_specific_update();

  public update(t: any): void {
    //Work out the delta time
    this.local_timer.increment(t);

    this.role_specific_update();

    //schedule the next update
    this.frame_timer.increment(t);
    this.update_id = window.requestAnimationFrame(this.update.bind(this));
  } // update

  process_json_actions(actions: JSON): void {
    for (action in actions) {
      this.game_state.applyAction(action);
    }
  } // process_json_actions

  // what does this do?
  public stop_update(): void {
    window.cancelAnimationFrame(this.updateid);
  }

  public create_ping_timer = setInterval(
    function () {
      this.last_ping_time = new Date().getTime() - this.fake_lag;
      this.socket.send("p." + this.last_ping_time);
    }.bind(this),
    1000
  );
}

class ClientGameCore {
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
  private server_timer: Timer;
  private server_id: string;
  private _ui_state:
    | "Base"
    | "Drag"
    | "Entity UI"
    | "Change Zone"
    | "Change Position";
  gameState: GameState;
  player: PlayerName;

  _click_on_entity(pt: Point, et: Entity): Boolean {
    // check if the point is inside the entity
    const ib: ImageBitmap = this.gameState.imageMap[et.image];

    if (
      pt.x >= et.pos.x &&
      pt.x <= et.pos.x + ib.width &&
      pt.y >= et.pos.y &&
      pt.y <= et.pos.y + ib.height
    ) {
      return true;
    } else {
      return false;
    }
  }

  // Look through all entities and find all entities that were
  // under the cursor and are visible to the player
  _entity_clicked(pt: Point): Entity[] {
    return this.gameState.entities.filter((ent) => {
      this._click_on_entity(pt, ent) &&
        this.gameState
          .zone_an_entity_belongs_to(ent.zone)
          .glance_permissions.includes(this.player);
    });
  }

  // Create context menu of entity
  _create_context_menu(ent: Entity) {
    // Each entity has a custom context menu
    // Give each entity change state menu, change zone menu, change position
    // For the change state menu, add submenus for each substate using statemap
    let state_menu_obj = {};
    ent.stateList.forEach((o: EntStateEnum) => {
      for (const [key, value] of Object.entries(o)) {
        state_menu_obj[key] = value;
      }
    });
    let menu_obj = {};
    /*
    menu_obj = 
    {
      "Change Zone": "Change Zone",
      "Change Position": "Change Position",
      "Change State": {
        "face": {"up", "down"},
        "num": {"J", "Q", "K",
      }
    }
    */
    menu_obj["Change Zone"] = "Change Zone";
    menu_obj["Change Position"] = "Change Position";
    menu_obj["Change State"] = state_menu_obj;

    // TODO create the context menu
    // also put onClick handlers
  }

  receive_ui_event(ui_action: UIAction) {
    // We receive the UI action and send actions to the server
    // but do not update the GameState here.
    // So let's see how to see what action you get given a UI action
    //
    const click_point: Point = ui_action[0];
    const click_type: number = ui_action[1];
    const ents_clicked: Entity[] = this._entity_clicked(click_point);
    const [active_entity] = ents_clicked.slice(-1);

    // How do we handle multiple entities being in the same click field?
    // How do we know which entity is "on top"?
    // Entities are rendered bottom-to-top first

    switch (this._ui_state) {
      case "Base":
        console.log("We are in the base mode");
        // Right click on entity
        if (click_type === 2 && ents_clicked.length > 0) {
          // Get the last entity and open up the context menu
          this._create_context_menu(active_entity);
          this._ui_state = "Entity UI";
        }
        // Left click on entity
        else if (click_type === 0 && ents_clicked.length > 0) {
          // Get the last entity and start drag mode
          this._ui_state = "Drag";
        } else {
          // pass
        }
      case "Drag":
        // If we receive another left or right click (which we have),
        // we cancel out the drag mode.
        // TODO think about the mouse drag event
        console.log("We are in the drag mode");
        // TODO move the active entity to the new position
        // TODO Send off an action that changes the entity's position to server
        // active_entity.pos = click_point;
        this._ui_state = "Base";
      // TODO think about this
      case "Entity UI":
        console.log("We are in the Entity UI mode");
      // TODO change zone
      case "Change Zone":
        console.log("We are in the change zone mode");
        // look at what zone the cursor is in
        const clicked_zones = this.gameState.zone_a_point_belongs_to(
          click_point
        );
        if (
          clicked_zones.length > 0 &&
          clicked_zones[0].move_to_permissions.includes(this.player)
        ) {
          // TODO Send off a changeZone action
          /*
          this.gameState.changeEntityZone(
            active_entity.uid,
            this.player,
            clicked_zones[0].name
          );
          */
        } else {
          this._ui_state = "Base";
        }
      case "Change Position":
        console.log("We are in the change position mode");
        if (click_type === 0) {
          // TODO send an action to move the entity to the new position
          // active_entity.pos = click_point;
        }
        this._ui_state = "Base";
    }
  }

  role_specific_update() {}
}
