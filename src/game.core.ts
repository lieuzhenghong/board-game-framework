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
  return (parseFloat(value.toFixed(digits)))
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

import GameState from "./GameState";

class Timer {
  public dt: number = new Date().getTime();
  public dte: number = new Date().getTime();
  public current_time: number = 0;
  public previous_time: number = 0;

  public constructor() {
  };

  public increment = function (t: number) {
    this.dt = t - this.dte;
    this.dte = t;
    this.previous_time = this.current_time;
    this.current_time = this.dt / 1000.0;
  }

  public initialize(interval): void {
    setInterval(function(){this.increment(new Date().getTime())}.bind(this), interval)
  };
};

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
  public constructor(session_description: JSON, initial_state: GameState | JSON) {
    this.session_description = session_description;

    if (initial_state instanceof GameState) {
      this.game_state = initial_state;
    }
    if (typeof initial_state === "string") {
      initial_state = JSON.parse(initial_state);
      this.game_state = new GameState(initial_state["gamestate"], initial_state["imagemap"], null, null);
    }
    this.local_timer.current_time = .016;
    this.frame_timer.current_time = 0;
    this.server = session_description !== undefined;

    this.local_timer.initialize(4);
    this.physics_timer.initialize(15);
  }; // constructor

  abstract role_specific_update();

  public update(t: any): void {
    //Work out the delta time
    this.local_timer.increment(t);

    this.role_specific_update(); 

    //schedule the next update
    this.frame_timer.increment(t);
    this.update_id = window.requestAnimationFrame(this.update.bind(this));

  }; // update

  process_json_actions(actions : JSON) : void {
    for(action in actions){
      this.game_state.applyAction(action);
    }
  } // process_json_actions

  public stop_update(): void{
    window.cancelAnimationFrame( this.updateid );
  }

  public create_ping_timer = setInterval(function(){

        this.last_ping_time = new Date().getTime() - this.fake_lag;
        this.socket.send('p.' + (this.last_ping_time) );

    }.bind(this), 1000);
}

class ClientGameCore {
    private server_timer: Timer;
    private server_id : string;
}
