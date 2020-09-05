"use strict";

import { PlayerName, ImageMap, Point } from "./Interfaces.js";
import { Zone } from "./Zone.js";
import { Entity, EntState, EntUID } from "./Entity.js";

// ImageMap is a dictionary that maps image names (something.png) to
// an ImageBitmap file which can then be drawn on canvas

export class GameState {
  playerList: Array<PlayerName>; // not creating a Player class for now
  zones: Array<Zone>;
  imageMap: ImageMap;
  // imageMap: Promise<ImageMap>;
  entities: Array<Entity>;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  rootURL: string;
  gameUID: string;

  // TODO work on this
  constructor(
    gameStateJSON: JSON,
    imageMapJSON: JSON,
    imageMap: ImageMap,
    rootURL: string,
    gameUID: string,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    // loadState loads players, zones, imageMaps, entities
    this.canvas = canvas;
    this.ctx = ctx;
    this.rootURL = rootURL;
    this.gameUID = gameUID;
    this.imageMap = imageMap;
    this.zones = this.initialiseZones(gameStateJSON, imageMapJSON);
    this.entities = this.initialiseEntities(gameStateJSON, imageMapJSON);
    /*
    this.loadImages(imageMapJSON, rootURL, gameUID).then((value) => {
      this.imageMap = value;
      console.log("GameState object initialised");
    });
    */
  }

  initialiseEntities(gameStateJSON: JSON, imageMapJSON: JSON): Array<Entity> {
    const j = gameStateJSON;
    const im = imageMapJSON;
    let entities = [];

    j["game_state"]["entities"].forEach((e: object, i: number) => {
      const image_map_entity = im["image_mapping"][e["type"]]; // "piece" : {...}
      entities.push(
        new Entity(
          i, // 0
          e["type"], // "piece"
          image_map_entity["state_list"], // [{'shape': ["nought", "cross"]}]
          image_map_entity["states"], // {"['nought']" : "nought.png", "['cross']: "cross.png"}
          e["state"], // ["nought"] Should be an array of Strings, also called EntState
          image_map_entity["states"][e["state"].toString()], // "nought.png", a String
          image_map_entity["glance"],
          e["zone"],
          e["pos"]
        )
      );
    });

    return entities;
  }

  initialiseZones(gameStateJSON: JSON, imageMapJSON: JSON): Array<Zone> {
    const j = gameStateJSON;
    const im = imageMapJSON;
    this.playerList = j["game_state"]["players"];
    let zones: Array<Zone> = [];
    j["game_state"]["zones"].forEach((z: object) => {
      zones.push(
        new Zone(
          this.playerList,
          z["name"],
          im["image_mapping"][z["name"]], // get the image associated with the name
          z["pos"],
          // the following permissions might be undefined
          // which will default to all permissions
          z["move_to_permissions"],
          z["move_from_permissions"],
          z["view_permissions"],
          z["glance_permissions"]
        )
      );
    });
    return zones;
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

    console.log("Render function called!");
    console.log(this.canvas.clientWidth);
    console.log(this.canvas.clientHeight);
    console.log(this.canvas.width);
    console.log(this.canvas.height);

    //this.canvas.width = this.canvas.clientWidth;
    // this.canvas.height = this.canvas.clientHeight;
    this.canvas.width = 150;
    this.canvas.height = 500;

    const zones = this.zones;
    const entities = this.entities;

    // First draw all the zones
    zones.forEach((zone, i) => {
      const image_bitmap = this.imageMap[zone["image"]];
      // TODO FIXME why doesn't this work?
      // zone.pos.x is undefined
      // this.ctx.drawImage(image_bitmap, zone.pos.x, zone.pos.y);
      this.ctx.drawImage(image_bitmap, zone.pos[0], zone.pos[1]);
      console.log(`Drawing ${zone.image} at ${zone.pos[0]} and ${zone.pos[1]}`);
    });

    console.log("Zones should be drawn");

    // Now draw all entities
    entities.forEach((entity: Entity) => {
      // Show the entity if and only if the entity is in a
      // zone that the player has permission to glance or view
      const ent_zone = this.zone_an_entity_belongs_to(entity.zone);
      if (
        ent_zone.view_permissions.includes(player_name) &&
        ent_zone.glance_permissions.includes(player_name)
      ) {
        const entityImage: ImageBitmap = this.imageMap[entity.image];
        // this.ctx.drawImage(entityImage, entity.pos.x, entity.pos.y);
        this.ctx.drawImage(entityImage, entity.pos[0], entity.pos[1]);
        console.log(
          `Drawing ${entity.image} at ${entity.pos[0]} and ${entity.pos[1]}`
        );
      } else if (ent_zone.glance_permissions.includes(player_name)) {
        const entityImage: ImageBitmap = this.imageMap[entity.glance_image];
        this.ctx.drawImage(entityImage, entity.pos[0], entity.pos[1]);
        console.log(
          `Drawing ${entity.image} at ${entity.pos[0]} and ${entity.pos[1]}`
        );
      } else {
      }
    });

    console.log("Entities should be drawn");
  }
}
