"use strict";
/*
 * This function should take the game state, image map, and all images, and draw
 * it on the canvas. It needs to have knowledge of the image map and all images.
 */

const _isEqual = (obj1, obj2) => {
  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj1);

  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }

  for (let objKey of obj1Keys) {
    if (obj1[objKey] !== obj2[objKey]) {
      return false;
    }
  }

  return true;
};

function drawCanvas() {
  // TODO I believe this check does absolutely nothing, because in JS empty
  // objects are Truthy
  if (game.gameState && game.imageMap && game.assets.images) {
    const players = game.gameState.game_state.players;
    const zones = game.gameState.game_state.zones;
    const entities = game.gameState.game_state.entities;
    // First draw all the zones
    zones.forEach((zone, i) => {
      // Look at
      const zone_name = zone.name;
      const zone_image_name = game.imageMap.image_mapping[zone_name].image;
      // Look for the corresponding image
      //console.log(zone_image_name);
      //console.log(game.assets.images);
      const image_blob = game.assets.images[zone_image_name];
      //console.log(image_blob);
      createImageBitmap(image_blob).then((result) =>
        game.ctx.drawImage(result, zone.pos[0], zone.pos[1])
      );
    });
    entities.forEach((entity, i) => {
      // First look up the correct image for the entity's state
      // We want to find an image corresponding to the same exact
      // state. Assume one exists.

      const entity_image_states = game.imageMap.image_mapping[entity.type];

      // Looking through each of the entity states in the image map
      entity_image_states.forEach((entity_img_state) => {
        // Check that this entity state is identical
        // this is a pretty bad approach because it scales with O(n^2) time
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
  window.requestAnimationFrame(drawCanvas);
}
