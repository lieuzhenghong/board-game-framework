import { ClientGameCore } from "./GameCore.js";
import { UIHandler } from "./UI.js";

async function fetchJSON(url: string): Promise<JSON> {
  const response = await fetch(url);
  return response.json();
}

async function fetchGameState(rootURL: string, gameUID: string): Promise<JSON> {
  return fetchJSON(rootURL + gameUID + "/game_state.json");
}

async function fetchImageMap(rootURL: string, gameUID: string): Promise<JSON> {
  return fetchJSON(rootURL + gameUID + "/image_map.json");
}

async function init() {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  const rootURL: string =
    "https://raw.githubusercontent.com/lieuzhenghong/board-game-framework/master/examples/";
  const gameUID: string = "tic-tac-toe";

  /*
  const GameStatePromise = fetchGameState(rootURL, gameUID);
  const ImageMapPromise = fetchImageMap(rootURL, gameUID);
  const AllPromises = [GameStatePromise, ImageMapPromise];
  Promise.all(AllPromises).then((values) => {
    const initialState = JSON.stringify({
      gameStateJSON: values[0],
      imageMapJSON: values[1],
      rootURL: rootURL,
      gameUID: gameUID,
    });

    console.log("Pre construction");
    const clientGameCore = new ClientGameCore(null, initialState, canvas, ctx);
    console.log("Post Construction");
    console.log(clientGameCore.game_state);

    clientGameCore.update(15);
  });
  */

  const gameStateJSON = await fetchGameState(rootURL, gameUID);
  const imageMapJSON = await fetchImageMap(rootURL, gameUID);

  const initialState = JSON.stringify({
    gameStateJSON: gameStateJSON,
    imageMapJSON: imageMapJSON,
    rootURL: rootURL,
    gameUID: gameUID,
  });

  console.log("Pre construction");
  const clientGameCore = new ClientGameCore(null, initialState, canvas, ctx);
  console.log("Post Construction");
  console.log(clientGameCore.game_state);

  // Initialise UI Handler for the ClientGameCore
  // The UI Handler handles mouse clicks and passes these UI events to ClientGameCore
  const virtualClientSize = 600;
  const uiHandler = new UIHandler(
    window,
    canvas,
    ctx,
    virtualClientSize,
    clientGameCore
  );

  // Call the update function of ClientGameCore every 15ms
  clientGameCore.update(15);
}

init();
