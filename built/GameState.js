"use strict";
// ImageMap is a dictionary that maps image names (something.png) to
// an ImageBitmap file which can then be drawn on canvas
class GameState {
  // TODO work on this
  constructor(gamestate, imagemap, canvas, ctx) {
    // loadState loads players, zones, imageMaps, entities
    this.loadState(gamestate, imagemap);
    this.canvas = canvas;
    this.ctx = ctx;
  }
  async loadState(j, im) {
    // load state into this object
    // First load the players
    let imageMapPromise = this.loadImages(im);
    this.playerList = j["game_state"]["players"];
    this.zones = j["game_state"]["zones"].map((z) => {
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
    function lookUpImage(s, d) {
      return d[s];
    }
    this.entities = j["game_state"]["entities"].forEach((e, i) => {
      // TODO !!! there is no e["image"] property
      //new Entity(i, e["type"], e["state"], e["image"], e["zone"], e["pos"]);
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
    });
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
  async loadImages(image_map_json) {
    let image_urls = [];
    Object.keys(image_map_json).forEach((key, index) => {
      // key: the name of the object key
      // index: the ordinal position of the key within the object
      // here we're dealing with an entity
      if (image_map_json[key] instanceof Object) {
        // Look for the states object
        image_map_json[key]["states"].forEach((stateString) => {
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
    async function fillImageMap(u) {
      const response = await fetch(img_url_dir + u);
      const blob = await response.blob();
      const imgbitmap = await createImageBitmap(blob);
      //imageMap[u] = imgbitmap;
      return [u, imgbitmap];
    }
    const imageMapPromises = image_urls.map(async (u) => fillImageMap(u));
    const imageMapTuples = await Promise.all(imageMapPromises);
    let imageMap = {}; // ImageMap is just a dictionary
    imageMapTuples.forEach((tuple) => {
      imageMap[tuple[0]] = tuple[1];
    });
    return imageMap;
  }
  applyAction() {
    // There are three types of actions:
    // 1. Move an entity from one zone to another
    // 2. Move an entity from one position to another
    // 3. Change the state of an entity
    // An action should take a game state and return another game state
    // but in this case it should simply mutate the existing game state object
    // I would have preferred a functional approach myself: action(GameState) : GameState -> GameState
  }
  changeEntityState(uid, new_state) {
    // TODO should we check here if the new state is valid
    this.entities[uid].change_state(new_state);
  }
  moveEntity(uid, new_zone) {
    // TODO should we check here if the old zone is permissioned?
    const old_zone = this.entities[uid].zone;
    this.entities[uid].change_zone(new_zone);
  }
  _zone_an_entity_belongs_to(zone_string) {
    return this.zones.filter((zone) => zone.name === zone_string)[0];
  }
  render(player_name) {
    // TODO make sure to render glance. How? Player-dependent.
    // TODO I believe this check does absolutely nothing, because in JS empty
    // objects are Truthy.
    const zones = this.zones;
    const entities = this.entities;
    // First draw all the zones
    zones.forEach((zone, i) => {
      const image_bitmap = this.imageMap[zone["image"]];
      game.ctx.drawImage(image_bitmap, zone.pos.x, zone.pos.y);
    });
    // Now draw all entities
    entities.forEach((entity) => {
      const ent_zone = this._zone_an_entity_belongs_to(entity.zone);
      if (
        ent_zone.view_permissions.includes(player_name) &&
        ent_zone.glance_permissions.includes(player_name)
      ) {
        const entityImage = this.imageMap[entity.image];
        this.ctx.drawImage(entityImage, entity.pos.x, entity.pos.y);
      } else if (ent_zone.glance_permissions.includes(player_name)) {
        const entityImage = this.imageMap[entity.glance_image];
        this.ctx.drawImage(entityImage, entity.pos.x, entity.pos.y);
      } else {
        // do nothing
      }
    });
  }
}
