---
title: Strategy Doc
---

# Outline

## Part 1

- A node application that hosts games from json specifications.

### MVP

- TODO Client UI
- TODO Authoritative Host
- TODO Server to serve static assets
- TODO Something to help user host over internet
- TODO A game
- TODO Documentation for json specification schema

## Part 2
 - A GUI application to create json game specifications.

### MVP

## Part 3
 - Server to host apps from Parts 1 and 2

### MVP

 - Lobby system
 - Matchmaking

## Part 4 

 - Design boardgame

### MVP

# Overview

## Client-side

GameCore: code to process events and detect duplicates (to either
resend messages (if server) or to resend acknowledgement (if client))

Make sure that all events are undoable:
[Game Design Patterns](https://gameprogrammingpatterns.com/command.html#undo-and-redo)

## Server back-end side (core multiplayer server)

(This could be outsourced to one of the players)

## Server front-end side (supporting infrastructure)

(could use React)

The most important thing we need to do now is to set up the proper
routes and requests.

- lobbies
- joining games
- setting up the websockets
- menus
- hosting assets, maybe

# Things to think about

- Right now a hacked client can see everything despite no view/glance
  permissions: is that something we (eventually) want to fix?


# CHANGELOG

## 2020-10-17

Got networking working on dev server. Got multiplayer actually
sending the same events to multiple players.

For networking, we use a combination of ngrok and localtunnel to
forward 2 ports (not possible on either alone for licensing
reasons). Wrote a file called HOWTO_setup_server.md describing how to set up the
tunneling required for dev server.

For multiplayer, changed the echo server to broadcast messages instead of just
sending them back to the host. This causes the server to crash when a message
is sent after anyone disconnects.

### Next Steps

 - Think about whether to have the server host or one of the players
 - Consider having independent hosting for static assets
 - Think about best way to do canvas scaling (are we targeting phone?)
 - Think about dragging vs click to move

#### Next week
 - Fix Menu bug (@lieuzhenghong)
 - Keep a local game state (@epicfarmer)
 - Serve local state to new players on game entry
 - OPTIONAL Validate incoming actions against state

#### Client UI

 - Menu buggy
 - Canvas size scaling needed
 - Modify zone change to be automatic based on position change (change
     position event also needs to fire off a change zone event and
     couple with position event).  This will require the server to do
     something more than echo events back to client
 - Implement UNDO/DO for events

#### Authoritative Host

 - Keep a local game state
 - Serve local state to new players on game entry
 - Validate incoming actions against state
 - Classify actions as valid/invalid on response

#### Server to serve static assets

#### Something to help user host over internet

 - Make it so that user doesn't need to edit code to run ngrok

#### A game

 - Make a game that requires more of the features

#### Documentation for json specification schema

 - Update README.tex.md
 - Write json file specific description
 - Write tutorial style documentation of example game construction
   (e.g., how to implement blackjack)
