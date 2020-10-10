/*
// The game server that hosts the static files,
// handles lobbies/client input etc
*/

const gameport = process.env.PORT || 4004;

/*
import * as io from "socket.io";
import * as express from "express";
import * as http from "http";
// import express from "express";
*/

// TODO try to get this working
const io = require("socket.io");
const express = require("express");
const http = require("http");

// const __dirname = process.cwd();
const __dirname__ = process.cwd();

console.log(express);

//const app = express.default();

// This works
//const app = express["default"]();

const app = express();
const server = http.createServer(app);

app.get("/", (req, res) => {
  console.log("trying to load %s", __dirname__ + "/index.html");
  res.sendfile("/index.html", { root: __dirname__ });
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
  res.sendfile(__dirname__ + "/" + file);
});
