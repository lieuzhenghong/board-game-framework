"use strict";
const virtualCanvasSize = 600;
let game = {
    canvas: {},
    ctx: {},
    assets: {},
    game_state: {},
    image_map: {},
};
function init() {
    game.canvas = document.getElementById("game-canvas");
    game.canvas.width = game.canvas.clientWidth;
    game.canvas.height = game.canvas.clientHeight;
    game.UI = {};
    // empty object so we can keep adding items to it as the UI grows but maintain
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
            if (game.UI.contextMenu.style.display === "flex" &&
                !game.UI.contextMenu.hasMouseInside) {
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
    loadGame("tic-tac-toe");
    game.ctx.scale(virtualCanvasSize / game.canvas.width, virtualCanvasSize / game.canvas.height);
    window.addEventListener("resize", function () {
        game.ctx.setTransform(1, 0, 0, 1, 0, 0);
        game.canvas.width = game.canvas.clientWidth;
        game.canvas.height = game.canvas.clientHeight;
        game.ctx.scale(game.canvas.width / virtualCanvasSize, game.canvas.height / virtualCanvasSize);
    });
    window.requestAnimationFrame(drawCanvas);
}
window.onload = init;
/*
 * Just a test function for now. In reality we'd interface this properly with
 * the networking code
 * Loads all assets for the tic-tac-toe game
 * What should this return:
 */
function loadGame(game_UID) {
    // These URLs are hardcoded for now, but ideally we'd feed loadGame a
    // UID corresponding to the board game.
    const url_prepend = "https://raw.githubusercontent.com/lieuzhenghong/board-game-framework/master/examples/";
    const urls = [
        url_prepend + game_UID + "/game_state.json",
        url_prepend + game_UID + "/image_map.json",
    ];
    var promises = urls.map((u) => fetch(u).then((response) => response.json()));
    // TODO handle error case for when one or more of the promises fails
    Promise.all(promises).then((results) => {
        const game_state = results.filter((i) => i["data_type"] === "game_state")[0];
        const image_mapping = results.filter((i) => i["data_type"] === "image_map")[0];
        const image_map = image_mapping["image_mapping"];
        // We now have the image map. Use the image map to fetch images.
        // Get the object that has data type image_map
        // TODO check that image_map is not undefined
        // Really only coding the happy case right now
        // Once we have the image map we can fetch all the images it requires
        let image_urls = [];
        Object.keys(image_map).forEach((key, index) => {
            // key: the name of the object key
            // index: the ordinal position of the key within the object
            // Some entities can have multiple states, and so we need to check whether
            // the property is of type Object or of type Array...
            if (Array.isArray(image_map[key])) {
                // so this is an entity with more than one state
                image_map[key].map((state) => {
                    image_urls.push(state["image"]);
                });
            }
            else {
                image_urls.push(image_map[key]["image"]);
            }
        });
        // Now remove duplicates using javascript set and converting back to array
        // using spread operator
        image_urls = [...new Set(image_urls)];
        console.log(image_urls);
        const img_url_dir = url_prepend + game_UID + "/img/";
        var img_promises = image_urls.map((u) => fetch(img_url_dir + u).then((response) => response.blob()));
        // TODO handle error case for when one or more of the promises fails
        Promise.all(img_promises).then((results) => {
            // TODO Check that each promise returns in the right order
            let images = {};
            results.map((blob, index) => {
                // note the brackets around image_urls[index]: computed property names
                images[image_urls[index]] = blob;
            });
            console.log(images); // Images is a mapping of entity/zone names to PNG blobs.
            // return game_state, image_mapping, images;
            game.gameState = game_state;
            console.log(game_state);
            game.imageMap = image_mapping;
            game.assets.images = images;
        });
    });
}
