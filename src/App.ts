/*
// The game server that hosts the static files,
// handles lobbies/client input etc
*/

const gameport = process.env.PORT || 4004;

import * as io from "socket.io";
import * as express from "express";
import * as http from "http";
// import express from "express";

const __dirname = process.cwd();

console.log(express);

//const app = express.default();
const app = express["default"]();
const server = http.createServer(app);

app.get("/", (req, res) => {
  console.log("trying to load %s", __dirname + "/index.html");
  res.sendfile("/index.html", { root: __dirname });
});

app.listen(gameport, () => {
  console.log(`Example app listening at http://localhost:${gameport}`);
});

// Serving static files
app.get("/*", function (req, res, next) {
  //This is the current file they have requested
  let file = req.params[0];
  //For debugging, we can track what files are requested.
  console.log("\t :: Express :: file requested : " + file);
  //Send the requesting client the file.
  res.sendfile(__dirname + "/" + file);
});

/*
const sio = io.listen(server);

sio.set("authorization", function (handshakeData, callback) {
  callback(null, true); // error first callback style
});
*/

//Enter the game server code. The game server handles
//client connections looking for a game, creating games,
//leaving games, joining games and ending games when they leave.

// import { game_server } from "game.server.js";
