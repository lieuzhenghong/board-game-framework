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

// Point (x,y) and whether it's left or rightclick
type UIAction = [Point, number];
