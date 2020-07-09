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
    // TODO change image as well
    this.state = new_state;
    /*
    const entity_image_states = game.imageMap.image_mapping[entity.type];
    // Looking through each of the entity states in the image map
    entity_image_states.forEach((entity_img_state) => {
    // Check that this entity state is identical
    // this is a pretty bad approach because it scales with O(n^2) time
    // TODO --- optimise this when we have time
    if (_isEqual(entity.state, entity_img_state.state)) {
    const entity_image_name = entity_img_state.image;
    const image_blob = game.assets.images[entity_image_name];
    createImageBitmap(image_blob).then((result) => game.ctx.drawImage(result, entity.pos[0], entity.pos[1]));
    }
    });
    });
    */
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
