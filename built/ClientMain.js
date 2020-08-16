import { ClientGameCore } from "./GameCore";
import { UIHandler } from "./UI";
async function fetchJSON(url) {
    const response = await fetch(url);
    return response.json();
}
async function fetchGameState(rootURL, gameUID) {
    return fetchJSON(rootURL + gameUID + "/game_state.json");
}
async function fetchImageMap(rootURL, gameUID) {
    return fetchJSON(rootURL + gameUID + "/image_map.json");
}
async function init() {
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    const rootURL = "https://raw.githubusercontent.com/lieuzhenghong/board-game-framework/master/examples/";
    const gameUID = "tic-tac-toe";
    const gameStateJSON = await fetchGameState(rootURL, gameUID);
    const imageMapJSON = await fetchImageMap(rootURL, gameUID);
    const initialState = JSON.stringify({
        gameStateJSON: gameStateJSON,
        imageMapJSON: imageMapJSON,
        rootURL: rootURL,
        gameUID: gameUID,
    });
    const clientGameCore = new ClientGameCore(null, initialState, canvas, ctx);
    // Initialise UI Handler for the ClientGameCore
    // The UI Handler handles mouse clicks and passes these UI events to ClientGameCore
    const virtualClientSize = 600;
    const uiHandler = new UIHandler(window, canvas, ctx, virtualClientSize, clientGameCore);
}
init();
