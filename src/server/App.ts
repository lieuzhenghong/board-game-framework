/*
// The game server that hosts the static files,
// handles lobbies/client input etc
*/

// The require syntax works only with CommonJS modules,
// and Node.js will only run it correctly if the package.json file
// has a "type": "commonjs" key-value.
// See the NodeJS docs for an explanation:
// https://nodejs.org/api/packages.html#packages_modules_packages

const express = require("express");
const http = require("http");
const webSocket = require("ws");
const cors = require("cors");
const gamecore = require("../GameCore")
// import { ServerGameCore } from "../GameCore.js";

const gameport = process.env.PORT || 4004;
const __dirname__ = process.cwd();
const app = express();
const server = http.createServer(app);

app.use(cors());

app.get("/", (req, res) => {
  console.log("trying to load %s", __dirname__ + "/index.html");
  res.sendfile("/index.html", { root: __dirname__ });
});

// Serving static files
app.get("/*", function (req, res, next) {
  //This is the current file they have requested
  let file = req.params[0];
  //For debugging, we can track what files are requested.
  // console.log("\t :: Express :: file requested : " + file);
  //Send the requesting client the file.
  res.sendfile(__dirname__ + "/" + file);
});

const wss = new webSocket.Server({ port: 4005 });
const clients = [];
let serverGameCore; 

function buildInitialState(gameUID: string):string {
  // TODO refactor this
  const rootURL = '../../examples'
  const gameStateJSON = require(rootURL + gameUID + "/game_state.json");
  const imageMapJSON = require(rootURL + gameUID + "/image_map.json");
  
  const initialState = JSON.stringify({
    gameStateJSON: gameStateJSON,
    imageMapJSON: imageMapJSON,
    rootURL: rootURL,
    gameUID: gameUID,
  });
  return initialState
}

wss.on("connection", (ws) => {
  clients.push(ws);
  if (clients.length == 1) {
    const initialState = buildInitialState('card-drinking-game')
    serverGameCore = new gamecore.ServerGameCore(null, initialState, ws, clients)
  }
  else {
    // We should be using a setter here not just pushing to the value
    serverGameCore.clients.push(ws)
  }
  ws.on("message", (message: string) => {
    clients.map((ws) => {
      ws.send(message); // Echo server
    })
    console.log("Message received!");
    console.log(message);
  });

  console.log("Connection established!");
  ws.send("Connection established!");
});

app.listen(gameport, () => {
  console.log(`Example app listening at http://localhost:${gameport}`);
});
