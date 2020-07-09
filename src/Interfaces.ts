type PlayerName = string;

interface Point {
  x: number;
  y: number;
}

interface ImageMap {
  [Key: string]: ImageBitmap;
}

type EntUID = number;

interface EntState {
  [Key: string]: string;
}
