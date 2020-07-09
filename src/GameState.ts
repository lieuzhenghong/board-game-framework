"use strict";
type PlayerName = string;

interface Point {
  x: number;
  y: number;
}

type EntUID = number;

interface EntState {
  [Key: string]: string;
}

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

  draw(gameState: GameState) {
    // You need the gameState object
    let bitmap: ImageBitmap = gameState.imageMap[this.image];
    gameState.ctx.drawImage(bitmap, this.pos.x, this.pos.y);
  }
}

class Zone {
  name: string;
  image: string;
  move_to_permissions?: Array<PlayerName>;
  move_from_permissions?: Array<PlayerName>;
  view_permissions?: Array<PlayerName>;
  glance_permissions?: Array<PlayerName>;
  pos: Point;

  // TODO build a constructor
}

// ImageMap is a dictionary that maps image names (something.png) to
// an ImageBitmap file which can then be drawn on canvas
interface ImageMap {
  [Key: string]: ImageBitmap;
}

class GameState {
  zones: Array<Zone>;
  playerList: Array<PlayerName>; // not creating a Player class for now
  imageMap: ImageMap;
  entities: Array<Entity>;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  // TODO work on this
  constructor(jsonFileName) {
    // could also be jsonStr
    this.loadState(jsonFileName);
  }

  loadState(fileName) {
    // load state into this object
  }

  applyAction() {
    // There are three types of actions:
    // 1. Move an entity from one zone to another
    // 2. Change the state of an entity
    // 3. Add or remove an entity (I won't implement this rn)
    // An action should take a game state and return another game state
    // but in this case it should simply mutate the existing game state object
    // I would have preferred a functional approach myself: action(GameState) : GameState -> GameState
  }

  changeEntityState(uid: EntUID, new_state: EntState) {
    // TODO should we check here if the new state is valid
    this.entities[uid].change_state(new_state);
  }

  moveEntity(uid: EntUID, new_zone: string) {
    // TODO should we check here if the old zone is permissioned?
    const old_zone = this.entities[uid].zone;

    this.entities[uid].change_zone(new_zone);
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
      const players = this.playerList;
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
