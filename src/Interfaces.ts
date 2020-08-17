import { EntStateMap, EntUID } from "./Entity.js";

export type PlayerName = string;

export interface Point {
  x: number;
  y: number;
}

export interface ImageMap {
  [Key: string]: ImageBitmap;
}

export interface GSStateMapDict {
  [Key: string]: EntStateMap;
}

// The first number is a timestamp
// The first string is the type of action: e.g. change_zone, change_pos
// second is the affected entity UID,
// third is the properties of the entity that will change
// e.g. {pos: (x, y)}
export interface ServerAction {
  time: number;
  action_type: string;
  entity_uid: EntUID;
  payload: object;
}
