"use strict";

let game = {
  canvas: {},
  ctx: {},
};

function init() {
  game.canvas = document.getElementById("game-canvas");
  game.canvas.width = game.canvas.clientWidth;
  game.canvas.height = game.canvas.clientHeight;
  game.UI = {}; // empty object so we can keep adding items to it as the UI grows but maintain
  // organisation and not clutter up the global namespace.
  game.UI.contextMenu = document.getElementById("context-menu");
  game.canvas.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    let menu = document.getElementById("context-menu");
    menu.style.left = e.pageX + "px"; // set position of contextmenu
    menu.style.top = e.pageY + "px";
    menu.style.display = "flex";

    generateContextMenu();
  });

  document.addEventListener("mousedown", function (e) {
    if (e.which === 1) {
      // left click
      if (
        game.UI.contextMenu.style.display === "flex" &&
        !game.UI.contextMenu.hasMouseInside
      ) {
        game.UI.contextMenu.style.display = "none"; // hide context menu if we clicked outside it
      } // this might break later on as we start to need the mouse for other things - feel free to rework
    }
  });
  game.ctx = game.canvas.getContext("2d");

  var divs = document.getElementsByTagName("div");
  for (var i = 0; i < divs.length; i++) {
    divs[i].hasMouseInside = false; // inelegant solution but it works :3
    divs[i].addEventListener("mouseenter", function () {
      this.hasMouseInside = true;
    });
    divs[i].addEventListener("mouseleave", function () {
      this.hasMouseInside = false;
    });
  }
}

window.onload = init;

/*
    Parameters:
        text: the text the action shows up as in the context menu
        action: a function to execute on click
*/
const addAction = function (text, action) {
  let menuItem = document.createElement("div");
  menuItem.classList.add("menu-item");
  menuItem.innerHTML = text;
  menuItem.action = action; // add an action property to the menu item, it'll be called on click.

  menuItem.addEventListener("click", function (e) {
    menuItem.action(); // execute the action when this item is clicked
    game.UI.contextMenu.style.display = "none"; // hide the menu on click
  });

  game.UI.contextMenu.appendChild(menuItem);
};

const generateContextMenu = function () {
  game.UI.contextMenu.innerHTML = "";
  // Here there should be some calculations for finding out what object is under the mouse,
  // and then generating a context menu based on that info. (use addAction() method)
  addAction("fixme", function () {
    alert("TODO: add context menu generation");
  });
};

/*
 * Just a test function for now. In reality we'd interface this properly with
 * the networking code
 * Loads all assets for the tic-tac-toe game
 * What should this return:
 */

function loadGame() {
  // These URLs are hardcoded for now, but ideally we'd feed loadGame a
  // UID corresponding to the board game.
  const urls = [
    "https://raw.githubusercontent.com/lieuzhenghong/board-game-framework/master/examples/tic-tac-toe/image_map.json",
    "https://raw.githubusercontent.com/lieuzhenghong/board-game-framework/master/examples/tic-tac-toe/game_state.json",
  ];

  var promises = urls.map((u) => fetch(u).then((response) => response.json()));

  // TODO handle error case for when one or more of the promises fails
  Promise.all(promises).then((results) => {
    console.log(results);
    // We now have the image map. Use the image map to fetch images.
    // Get the object that has data type image_map
    // TODO check that image_map is not undefined
    let image_map = results.filter((i) => i["data_type"] === "image_map")[0];
    // Really only coding the happy case right now

    // Once we have the image map we can fetch all the images it requires
    // TODO

    // Some entities can have multiple states, and so we need to check whether
    // the property is of type Object or of type Array...

    // Think a little bit about the return type.
    return results;
  });
}

/*
 * This function should take the game state, image map, and all images,
 * and draw it on the canvas. It needs to have knowledge of the image map and
 * all images.
 */

function drawCanvas() {}
