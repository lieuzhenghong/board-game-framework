class Entity {
  uid: EntUID;
  type: string;
  state: EntState; // a dictionary of strings
  image: string;
  // looking up ImageMap[image] in GameState points to the correct
  // ImageBitmap
  zone: string;
  pos: Point;

  constructor(
    uid: EntUID,
    type: string,
    state: EntState,
    image: string,
    zone: string,
    pos: Point
  ) {
    this.uid = uid;
    this.type = type;
    this.state = state;
    this.image = image;
    this.zone = zone;
    this.pos = pos;
  }

  change_zone(new_zone: string) {
    this.zone = new_zone;
  }

  change_state(new_state: EntState) {
    this.state = new_state;
  }

  change_pos(new_pos: Point) {
    this.pos = new_pos;
  }

  draw(gameState: GameState) {
    // You need the gameState object
    let bitmap: ImageBitmap = gameState.imageMap[this.image];
    gameState.ctx.drawImage(bitmap, this.pos.x, this.pos.y);
  }
}
