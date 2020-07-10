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
