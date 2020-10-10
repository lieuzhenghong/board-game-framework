---
title: Things to do
---

1. Joshua will write some explanation about the multiplayer architecture in detail

## Client-side

GameCore: code to process events and detect duplicates
(to either resend messages (if server) or to resend acknowledgement (if client))

Make sure that all events are undoable:
[Game Design Patterns](https://gameprogrammingpatterns.com/command.html#undo-and-redo)

## Server back-end side (core multiplayer server)

(This could be outsourced to one of the players)

## Server front-end side (supporting infrastructure)

(could use React)

The most important thing we need to do now is to set up the proper routes
and requests.

- lobbies
- joining games
- setting up the websockets
- menus
- hosting assets, maybe
