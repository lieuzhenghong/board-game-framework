"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
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
  loadState(j, im) {
    return __awaiter(this, void 0, void 0, function* () {
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
      this.imageMap = yield imageMapPromise;
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
  loadImages(image_map_json) {
    return __awaiter(this, void 0, void 0, function* () {
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
      function fillImageMap(u) {
        return __awaiter(this, void 0, void 0, function* () {
          const response = yield fetch(img_url_dir + u);
          const blob = yield response.blob();
          const imgbitmap = yield createImageBitmap(blob);
          //imageMap[u] = imgbitmap;
          return [u, imgbitmap];
        });
      }
      const imageMapPromises = image_urls.map((u) =>
        __awaiter(this, void 0, void 0, function* () {
          return fillImageMap(u);
        })
      );
      const imageMapTuples = yield Promise.all(imageMapPromises);
      let imageMap = {}; // ImageMap is just a dictionary
      imageMapTuples.forEach((tuple) => {
        imageMap[tuple[0]] = tuple[1];
      });
      return imageMap;
    });
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
  getCurrentStateInfo() {
    // either this method or directly accessing the properties of this object
  }
  render() {
    // TODO make sure to render glance. How? Player-dependent.
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
      entities.forEach((entity) => {
        const entityImage = this.imageMap[entity.image];
        this.ctx.drawImage(entityImage, entity.pos.x, entity.pos.y);
      });
    }
  }
}
