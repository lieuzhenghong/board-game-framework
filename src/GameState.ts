"use strict";

// ImageMap is a dictionary that maps image names (something.png) to
// an ImageBitmap file which can then be drawn on canvas

class GameState {
  playerList: Array<PlayerName>; // not creating a Player class for now
  zones: Array<Zone>;
  imageMap: ImageMap;
  entities: Array<Entity>;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  // TODO work on this
  constructor(
    gamestate: object,
    imagemap: object,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    // loadState loads players, zones, imageMaps, entities
    this.loadState(gamestate, imagemap);
    this.canvas = canvas;
    this.ctx = ctx;
  }

  async loadState(j: object, im: object) {
    // load state into this object
    // First load the players
    let imageMapPromise: Promise<ImageMap> = this.loadImages(im);
    this.playerList = j["game_state"]["players"];
    this.zones = j["game_state"]["zones"].map((z: object) => {
      new Zone(
        this.playerList,
        z["name"],
        z["image"],
        z["pos"],
        // the following permissions might be undefined
        // which will default to all permissions
        z["move_to_permissions"],
        z["move_from_permissions"],
        z["view_permissions"],
        z["glance_permissions"]
      );
    });
    // Load all images and bitmap them
    this.imageMap = await imageMapPromise;
    // Now initialise all entities

    // Before initialising all entities, we have to compute the
    // entity state map and entity state list for each type of entity

    function lookUpImage(s: string, d: object): string {
      return d[s];
    }

    this.entities = j["game_state"]["entities"].forEach(
      (e: object, i: number) => {
        new Entity(
          i,
          e["type"],
          im[e["type"]]["state_list"],
          im[e["type"]]["states"],
          e["state"],
          lookUpImage(e["state"], im[e["type"]]["states"]),
          im[e["type"]]["glance"],
          e["zone"],
          e["pos"]
        );
      }
    );
  }

  /*
  generate_state_lists(im: object): GSStateListDict {
    let gsStateListDict: GSStateListDict = {};
    Object.keys(im).forEach((key, index) => {
      // key: the name of the object key
      // index: the ordinal position of the key within the object

      // here we're dealing with an entity
      if (im[key] instanceof Object) {
        // Look for the states object
        gsStateListDict[key] = im[key]["state_list"];
      }
    });
    return gsStateListDict;
  }
  */

  /*
  generate_state_map(im: object): GSStateMapDict {
    let gsStateMapDict = {};
    Object.keys(im).forEach((key, index) => {
      // key: the name of the object key
      // index: the ordinal position of the key within the object

      // here we're dealing with an entity
      if (im[key] instanceof Object) {
        // Look for the states object
        const state_list: EntStateList = im[key]["state_list"];
        // Expands state_map (unpacks wildcards)
        const state_map: EntStateMap = im[key]["states"];
        let expanded_state_map = {};
        
      }
    });
    return gsStateMapDict;
  }
  */

  async loadImages(image_map_json: object): Promise<ImageMap> {
    let image_urls: Array<string> = [];

    Object.keys(image_map_json).forEach((key, index) => {
      // key: the name of the object key
      // index: the ordinal position of the key within the object

      // here we're dealing with an entity
      if (image_map_json[key] instanceof Object) {
        // Look for the states object
        image_map_json[key]["states"].forEach((stateString: string) => {
          image_urls.push(image_map_json[key]["states"][stateString]);
        });
      } else {
        image_urls.push(image_map_json[key]);
      }
    });

    // TODO don't hardcode url_prepend and game UID
    // get kaminsky to look at how I make the request to the server

    const url_prepend =
      "https://raw.githubusercontent.com/lieuzhenghong/board-game-framework/master/examples/";
    const game_UID = "tic_tac_toe";
    const img_url_dir = url_prepend + game_UID + "/img/";

    // Now remove duplicates using javascript set and converting back to array
    // using spread operator
    image_urls = [...new Set(image_urls)];
    // console.log(image_urls);

    async function fillImageMap(u: string): Promise<[string, ImageBitmap]> {
      const response = await fetch(img_url_dir + u);
      const blob: Blob = await response.blob();
      const imgbitmap: ImageBitmap = await createImageBitmap(blob);
      //imageMap[u] = imgbitmap;
      return [u, imgbitmap];
    }

    const imageMapPromises: Array<Promise<
      [string, ImageBitmap]
    >> = image_urls.map(async (u: string) => fillImageMap(u));

    const imageMapTuples = await Promise.all(imageMapPromises);

    let imageMap: ImageMap = {}; // ImageMap is just a dictionary

    imageMapTuples.forEach((tuple) => {
      imageMap[tuple[0]] = tuple[1];
    });

    return imageMap;
  }

  applyAction(
    uid: EntUID,
    action_type: string,
    player: PlayerName,
    payload: EntState | string | Point
  ) {
    // There are three types of actions:
    // 1. Move an entity from one zone to another
    // 2. Move an entity from one position to another
    // 3. Change the state of an entity
    // An action should take a game state and return another game state
    // but in this case it should simply mutate the existing game state object

    switch (action_type) {
      case "change_state":
        this.changeEntityState(uid, payload as EntState);
      case "change_zone":
        this.changeEntityZone(uid, player, payload as string);
      case "change_zone":
        this.changeEntityPos(uid, player, payload as Point);
    }
  }

  // Change entity's state given a partial property kv pair
  // e.g. given the key-value pair {"face": "up"},
  // change the entity's state from ["down", "J"] to ["up", "J"]
  changeEntityStatePartial(uid: EntUID, property_kv_pair: object): void {
    // First, get the StateList of the entity
    const ent = this._entity_by_uid(uid);
    // Make a (shallow) copy of the entity's state
    let new_state = [...ent.state];
    ent.stateList.forEach((esEnum, i) => {
      if (Object.keys(ent.stateList)[0] === Object.keys(property_kv_pair)[0]) {
        new_state[i] = Object.values(property_kv_pair)[0];
      }
    });
    this.entities[uid].change_state(new_state);
  }

  changeEntityState(uid: EntUID, new_state: EntState): void {
    // TODO should we check here if the new state is valid
    // TODO we need to add change_state_permissions I guess
    this.entities[uid].change_state(new_state);
  }

  changeEntityZone(
    uid: EntUID,
    player: PlayerName,
    new_zone_name: string
  ): void {
    // TODO check if the old zone was permissioned
    // and also check if the new zone was permissioned
    // Leaving this for now because you need to pass which player
    // is moving inside the entity zone

    const old_zone_name: string = this._entity_by_uid(uid).zone;
    const old_zone: Zone = this.zone_an_entity_belongs_to(old_zone_name);
    const new_zone: Zone = this.zone_an_entity_belongs_to(new_zone_name);

    if (
      old_zone.move_from_permissions.includes(player) &&
      new_zone.move_to_permissions.includes(player)
    )
      this.entities[uid].change_zone(new_zone_name);
    else {
      // do nothing?
    }
  }

  changeEntityPos(uid: EntUID, player: PlayerName, new_pos: Point): void {
    // TODO think about whether "move_from" permissions
    // means moving in terms of changing state or just moving the object
    const old_zone_name: string = this._entity_by_uid(uid).zone;
    const old_zone: Zone = this.zone_an_entity_belongs_to(old_zone_name);

    if (old_zone.move_from_permissions.includes(player))
      this.entities[uid].change_pos(new_pos);
    else {
      // do nothing?
    }
  }

  // Utility function to get the entity given a EntUID
  _entity_by_uid(uid: EntUID): Entity {
    return this.entities.filter((entity) => entity.uid === uid)[0];
  }

  // Utility function to get the zone an entity belongs to given a
  // name of a zone (string)
  zone_an_entity_belongs_to(zone_string: string): Zone {
    return this.zones.filter((zone) => zone.name === zone_string)[0];
  }

  _point_is_in_zone(pt: Point, zone: Zone): Boolean {
    return (
      pt.x >= zone.pos.x &&
      pt.x <= zone.pos.x + this.imageMap[zone.image].width &&
      pt.y >= zone.pos.y &&
      pt.y <= zone.pos.y + this.imageMap[zone.image].height
    );
  }

  zone_a_point_belongs_to(pt: Point): Zone[] {
    return this.zones.filter((zone) => this._point_is_in_zone(pt, zone));
  }

  render(player_name: string) {
    // TODO think about how to render the special UI (e.g. glowing entities,
    // glowing zones
    // Need to pass it a UI state?
    const zones = this.zones;
    const entities = this.entities;

    // First draw all the zones
    zones.forEach((zone, i) => {
      const image_bitmap = this.imageMap[zone["image"]];
      this.ctx.drawImage(image_bitmap, zone.pos.x, zone.pos.y);
    });

    // Now draw all entities
    entities.forEach((entity: Entity) => {
      const ent_zone = this.zone_an_entity_belongs_to(entity.zone);
      if (
        ent_zone.view_permissions.includes(player_name) &&
        ent_zone.glance_permissions.includes(player_name)
      ) {
        const entityImage: ImageBitmap = this.imageMap[entity.image];
        this.ctx.drawImage(entityImage, entity.pos.x, entity.pos.y);
      } else if (ent_zone.glance_permissions.includes(player_name)) {
        const entityImage: ImageBitmap = this.imageMap[entity.glance_image];
        this.ctx.drawImage(entityImage, entity.pos.x, entity.pos.y);
      } else {
        // do nothing
      }
    });
  }
}
