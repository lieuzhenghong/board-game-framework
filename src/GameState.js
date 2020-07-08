/*

class GameState {
  constructor(jsonFileName) {
    // could also be jsonStr
    this.loadState(jsonFileName);
    this.zones = {};
    this.images = {}; // storage for images
    this.players = {}; // an object containing player metadata (UID, maybe even client IP or something)
    this.entities = {}; // Entity objects need to contain their position and other useful metadata such as png filename
  }

  loadState(fileName) {
    // load state into this object
  }

  applyAction() {}

  getCurrentStateInfo() {
    // either this method or directly accessing the properties of this object
  }

  render() {}

*/

class GameState {
  constructor(jsonFileName) {
    // could also be jsonStr
    this.loadState(jsonFileName);
    this.zones = {};
    this.images = {}; // storage for images
    this.players = {}; // an object containing player metadata (UID, maybe even client IP or something)
    this.entities = {}; // Entity objects need to contain their position and other useful metadata such as png filename.
  }

  loadState(fileName) {
    // load state into this object
  }

  applyAction() {
    // There are three types of actions:
    // 1. Add or remove an entity
    // 2. Move an entity from one zone to another
    // 3. Change the state of an entity
    // An action should take a game state and return another game state
    // but in this case it should simply mutate the existing game state object
    // I would have preferred a functional approach myself: action(GameState) : GameState -> GameState
  }

  getCurrentStateInfo() {
    // either this method or directly accessing the properties of this object
  }

  render() {
    // TODO make sure to render only things we have permissions to render
    // Work on the JSON file

    // TODO I believe this check does absolutely nothing, because in JS empty
    // objects are Truthy.
    if (game.gameState && game.imageMap && game.assets.images) {
      const players = this.players;
      const zones = this.zones;
      const entities = this.entities;

      // First draw all the zones
      zones.forEach((zone, i) => {
        const zone_name = zone.name;
        const zone_image_name = game.imageMap.image_mapping[zone_name].image;
        // Look for the corresponding image
        const image_blob = game.assets.images[zone_image_name];
        createImageBitmap(image_blob).then((result) =>
          game.ctx.drawImage(result, zone.pos[0], zone.pos[1])
        );
      });

      // Now draw all entities
      entities.forEach((entity, i) => {
        // First look up the correct image for the entity's state
        // We want to find an image corresponding to the same exact
        // state. Assume one exists. (N.B: this means we must exhaustively specify
        // every Cartsian product)

        const entity_image_states = game.imageMap.image_mapping[entity.type];

        // Looking through each of the entity states in the image map
        entity_image_states.forEach((entity_img_state) => {
          // Check that this entity state is identical
          // this is a pretty bad approach because it scales with O(n^2) time
          // TODO --- optimise this when we have time
          if (_isEqual(entity.state, entity_img_state.state)) {
            const entity_image_name = entity_img_state.image;
            const image_blob = game.assets.images[entity_image_name];
            createImageBitmap(image_blob).then((result) =>
              game.ctx.drawImage(result, entity.pos[0], entity.pos[1])
            );
          }
        });
      });
    }
  }
}

// Adding Zone and Entity classes might also be a good idea
