"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
                new Zone(this.playerList, z["name"], z["image"], z["pos"], 
                // the following permissions might be undefined
                // which will default to all permissions
                z["move_to_permissions"], z["move_from_permissions"], z["view_permissions"], z["glance_permissions"]);
            });
            // Load all images and bitmap them
            this.imageMap = yield imageMapPromise;
            // Now initialise all entities
            this.entities = j["game_state"]["entities"].forEach((e, i) => {
                new Entity(i, e["type"], e["state"], e["image"], e["zone"], e["pos"]);
            });
        });
    }
    loadImages(image_map_json) {
        return __awaiter(this, void 0, void 0, function* () {
            let image_urls = [];
            Object.keys(image_map_json).forEach((key, index) => {
                // key: the name of the object key
                // index: the ordinal position of the key within the object
                // Some entities can have multiple states, and so we need to check whether
                // the property is of type Object or of type Array...
                if (Array.isArray(image_map_json[key])) {
                    // so this is an entity with more than one state
                    image_map_json[key].map((state) => {
                        image_urls.push(state["image"]);
                    });
                }
                else {
                    image_urls.push(image_map_json[key]["image"]);
                }
            });
            // TODO don't hardcode url_prepend and game UID
            // get kaminsky to look at how I make the request to the server
            const url_prepend = "https://raw.githubusercontent.com/lieuzhenghong/board-game-framework/master/examples/";
            const game_UID = "tic_tac_toe";
            const img_url_dir = url_prepend + game_UID + "/img/";
            // Now remove duplicates using javascript set and converting back to array
            // using spread operator
            image_urls = [...new Set(image_urls)];
            // console.log(image_urls);
            let imageMap = {}; // ImageMap is just a dictionary
            function fillImageMap(u) {
                return __awaiter(this, void 0, void 0, function* () {
                    const response = yield fetch(img_url_dir + u);
                    const blob = yield response.blob();
                    const imgbitmap = yield createImageBitmap(blob);
                    //imageMap[u] = imgbitmap;
                    return [u, imgbitmap];
                });
            }
            let imageMapPromises = [];
            image_urls.map((u) => __awaiter(this, void 0, void 0, function* () {
                imageMapPromises.push(fillImageMap(u));
            }));
            const imageMapTuples = yield Promise.all(imageMapPromises);
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
                createImageBitmap(image_blob).then((result) => game.ctx.drawImage(result, zone.pos[0], zone.pos[1]));
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
                        createImageBitmap(image_blob).then((result) => game.ctx.drawImage(result, entity.pos[0], entity.pos[1]));
                    }
                });
            });
        }
    }
}
