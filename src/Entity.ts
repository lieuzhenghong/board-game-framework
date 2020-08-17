import { GameState } from "./GameState.js";
import { Point } from "./Interfaces.js";

export type EntUID = number;

// An EntState is an array of strings
// ["up", "D", "J"]
export type EntState = Array<string>;

// An EntStateEnum is an object that maps a property name
// to all possible properties
// e.g. {"face": ["up", "down"]}
export interface EntStateEnum {
  [Key: string]: Array<string>;
}

// An EntStateList lists all EntStateEnums
/*
statelist = [
  {"face": ["down", "up"]},
  {"suit": ["R", "B", "G"]}
]
*/
export type EntStateList = Array<EntStateEnum>;

// EntStateMap maps each possible entity state into a string which is a
// png image filename
export type EntStateMap = {
  [Key: string]: string;
};

export class Entity {
  uid: EntUID;
  type: string;
  stateList: EntStateList;
  stateMap: EntStateMap;
  state: EntState; // an array of strings
  image: string;
  // looking up ImageMap[image] in GameState points to the correct
  // ImageBitmap
  glance_image: string;
  // the image that is instead used for when you are only glancing
  // e.g back of card
  zone: string;
  pos: Point;

  constructor(
    uid: EntUID,
    type: string,
    stateList: EntStateList,
    stateMap: EntStateMap,
    state: EntState,
    image: string,
    glance_image: string,
    zone: string,
    pos: Point
  ) {
    this.uid = uid;
    this.type = type;
    this.state = state;
    this.stateList = stateList;
    this.stateMap = stateMap;
    this.image = image;
    this.zone = zone;
    this.pos = pos;
  }

  change_zone(new_zone: string): void {
    this.zone = new_zone;
  }

  change_state(new_state: EntState): void {
    this.state = new_state;
    const stateString = this.state.toString();
    this.image = this.stateMap[stateString];
  }

  change_pos(new_pos: Point): void {
    this.pos = new_pos;
  }

  draw(gameState: GameState) {
    // You need the gameState object
    let bitmap: ImageBitmap = gameState.imageMap[this.image];
    gameState.ctx.drawImage(bitmap, this.pos.x, this.pos.y);
  }
}
