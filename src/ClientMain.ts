import { ImageMap } from "./Interfaces.js";
import { ClientGameCore } from "./GameCore.js";
import { UIHandler } from "./UI.js";

class ResourceLoader {
  async fetchJSON(url: string): Promise<JSON> {
    const response = await fetch(url);
    return response.json();
  }

  async fetchGameState(rootURL: string, gameUID: string): Promise<JSON> {
    return this.fetchJSON(rootURL + gameUID + "/game_state.json");
  }

  async fetchImageMap(rootURL: string, gameUID: string): Promise<JSON> {
    return this.fetchJSON(rootURL + gameUID + "/image_map.json");
  }
  // Extract Unique images from the image_map_json
  generateImageNames(image_map_json: JSON): Array<string> {
    // TODO : replace references to urls with something more sensible
    let image_urls: Array<string> = [];
    const image_mapping = image_map_json["image_mapping"];

    Object.keys(image_mapping).forEach((key, index) => {
      // key: the name of the object key
      // index: the ordinal position of the key within the object

      // here we're dealing with an entity

      if (image_mapping[key] instanceof Object) {
        // Look for the states object
        image_urls.push(image_mapping[key]["glance"]); // Load the glance image
        Object.keys(image_mapping[key]["states"]).forEach(
          (stateString: string) => {
            image_urls.push(image_mapping[key]["states"][stateString]);
          }
        );
      } else {
        image_urls.push(image_mapping[key]);
      }
    });

    return [...new Set(image_urls)];
  }

  generateImageURLFromImageName(
    image_name: string,
    rootURL: string,
    gameUID: string
  ): string {
    const img_url_dir = rootURL + gameUID + "/img/";
    const abs_image_url = img_url_dir + image_name;
    return abs_image_url;
  }

  async generateImageMap(
    image_map_json: JSON,
    rootURL: string,
    gameUID: string
  ): Promise<ImageMap> {
    console.log("Loading Images...");

    const image_names = this.generateImageNames(image_map_json);

    async function fillImageMap(
      name: string,
      rootURL: string,
      gameUID: string
    ): Promise<[string, ImageBitmap]> {
      const response = await fetch(
        this.generateImageURLFromImageName(name, rootURL, gameUID)
      );
      const blob: Blob = await response.blob();
      const imgbitmap: ImageBitmap = await createImageBitmap(blob);
      return [name, imgbitmap];
    }

    const imageMapPromises: Array<Promise<
      [string, ImageBitmap]
    >> = image_names.map(async (u: string) =>
      fillImageMap.bind(this)(u, rootURL, gameUID)
    );

    const imageMapTuples = await Promise.all(imageMapPromises);

    let imageMap: ImageMap = {}; // ImageMap is just a dictionary

    imageMapTuples.forEach((tuple) => {
      imageMap[tuple[0]] = tuple[1];
    });

    console.log(imageMap);

    return imageMap;
  }
}

async function init() {
  // Create a websocket to the server
  // const socket = new WebSocket(`ws://${window.location.hostname}:4005`);
  // const socket = new WebSocket('ws://stale-bobcat-33.loca.lt')
  const socket = new WebSocket('wss://852ba6e17b59.ngrok.io')

  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  /*
  const rootURL: string =
    "https://raw.githubusercontent.com/lieuzhenghong/board-game-framework/master/examples/";
  */
  const rootURL: string = `https://${window.location.hostname}/examples/`;
  console.log(rootURL)
  const gameUID: string = "card-drinking-game";
  // const gameUID: string = "tic-tac-toe";
  // const gameUID: string = "blotto";
  // const gameUID: string = "tower-of-hanoi";

  const resourceLoader = new ResourceLoader();
  const gameStateJSON = await resourceLoader.fetchGameState(rootURL, gameUID);
  const imageMapJSON = await resourceLoader.fetchImageMap(rootURL, gameUID);
  const imageMap = await resourceLoader.generateImageMap(
    imageMapJSON,
    rootURL,
    gameUID
  );

  const initialState = JSON.stringify({
    gameStateJSON: gameStateJSON,
    imageMapJSON: imageMapJSON,
    rootURL: rootURL,
    gameUID: gameUID,
  });

  console.log("Pre construction");
  // TODO when in the multiplayer server make sure to pass each player
  // their player name
  const clientGameCore = new ClientGameCore(
    "player_one",
    null,
    initialState,
    imageMap,
    canvas,
    ctx,
    socket
  );
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
