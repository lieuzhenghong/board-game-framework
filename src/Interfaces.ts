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

// The first string is the type of action: e.g. change_zone, change_pos
// second is the affected entity UID,
// third is the properties of the entity that will change
// e.g. {pos: (x, y)}
type ServerAction = [string, EntUID, object];
