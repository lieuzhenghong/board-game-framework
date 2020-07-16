type PlayerName = string;

interface Point {
  x: number;
  y: number;
}

interface ImageMap {
  [Key: string]: ImageBitmap;
}

type EntUID = number;

interface GSStateMapDict {
  [Key: string]: EntStateMap;
}

// actiontype as string,
// Point (x,y) and
// and whether it's left or rightclick (if actiontype == "mousedown")
type UIAction = [string, Point, number?];

// The first number is a timestamp
// The first string is the type of action: e.g. change_zone, change_pos
// second is the affected entity UID,
// third is the properties of the entity that will change
// e.g. {pos: (x, y)}
interface ServerAction {
  time: number;
  action_type: string;
  entity_uid: EntUID;
  payload: object;
}

enum UIState {
  "Base" = "Base",
  "Drag" = "Drag",
  "Entity UI" = "Entity UI",
  "Change Zone" = "Change Zone",
  "Change Position" = "Change Position",
}
