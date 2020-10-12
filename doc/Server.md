# Overview

We are setting up a realtime multiplayer server.  The purposes of the server are to
 - manage message passing between clients to create games.
 - allow users to interact with their client separately, but see consistent output in approximately real time.

Throughout this document, we will use an example involving two players (Alice and Bob), and a server (Steve).

## Architecture

For our purposes, we will discuss 4 different types of machines on this network:
 - Server
 - Client
 - Host
 - Player

### Server

The machine running the node server.  This machine is responsible for serving the initial webpage, doing match making, and initiating communication between clients.

### Client

A machine connecting to the website.  This machine is responsible for displaying the webpage and handling user input.  A machine is either a server or a client but not both.

### Host

A machine responsibe for maintaining an authoritative state of the game, and ensuring that all associated Players have equivalent states.

### Player

A client machine responsible for processing user input into game actions to send to the host, and processing game actions from the host to render game state.

### Other

In general, one server has multiple clients and each client has one server.  Similarly, each host has multiple players but each player has only one host.  Communication is only between clients and servers or hosts and players.  Clients do not talk to eachother, except in the case that the host is a client and the players are other clients.  Players never talk to eachother directly.

### Example

In our example, Steve is the server and Bob and Alice are players.  We want to be open to either having a game server (Steve is host), or peer to peer games (Bob is Host).

#### Steve is Host

Steve can talk to both Alice and Bob.  Bob and Alice can talk to Steve.  Bob and Alice cannot talk to eachother.

#### Bob is Host

Steve can talk to both Alice and Bob.  Bob and Alice can talk to Steve. Bob and Alice can talk, but only about the game they are playing.

## Lobby and Game Selection

### Example

 - Steve is running a node server
 - Bob makes a GET request to Steve
 - Steve serves Bob an html menu to select the type of game Bob wants to play from those available.
 - Bob makes a GET request with the type of game.
 - Steve serves Bob a Lobby for games of that type.
 - Bob creates a game.
 - Steve upgrades Bob to a websocket connection
 - Alice makes a GET request to Steve
 - Steve serves Alice an html menu to select the type of game Alice wants to play from those available.
 - Alice makes a GET request with the type of game.
 - Steve serves Alice a Lobby for games of that type.
 - Alice joins Bob's game
 - Steve upgrades Alice to a websocket connection
 - Alice sends Alice ready to Steve via websocket.
 - Steve sends Alice ready to Bob via websocket.
 - Bob sends Bob ready to Steve via websocket.
 - Steve sends Bob ready to Alice via websocket.
 - Steve assigns a game id, host and port.
 - Steve sends the game id, host and port to Bob and Alice via websocket.
 - Steve closes the websocket.


## Game Actions

The life cycle of game actions is as follows:
 - player UI creates actions asynchronously and adds to action outbound queue
 - player client periodically sends actions from action outbound queue to host
 - host receives actions asynchronously and adds to received queue, tracking first inserted action
 - host refreshes the current state of the game based on the event queue (rejecting events that are not permitted)
 - host sends received events back to player with whether they are rejected or accepted
 - player receives accepted events
 - player removes matching events from action outbound queue
 - player merges valid events into inbound action queue
 - player removes invalid events
 - player refreshes state

### Objects

#### Action Queues

An event queue consists of
 - A starting state
 - A set of invertible actions which modify that state, sorted by time
 - A current state
 - A boolean for each action reflecting whether the current state reflects that action (for addition)
 - A boolean for each action reflecting whether the current state should reflect that action (for removal)
 - A time reflecting the earliest modified state since last refresh
The state can be run forward/backward in time by applying actions or their inverses.

To add a new action to the queue, simply add it in at the appropriate time to the set of actions.
To refresh the current state:
 - start at the last action
 - iterate backwards until the time is the earliest modified time, undoing actions that the current state reflects
 - iterate forwards until the end of the array, applying actions the current state should reflect
 - remove actions from the queue that both the current state doesn't reflect and the current state shouldn't reflect

To increase the initial time of the queue, apply actions up to the new starting time, set the resulting state to the initial state, and remove the applied actions from the queue.

### Example

#### Steve is Host, basic architecture

 - User interacts with UI on Bob
 - Bob handles UI based on displayed game state and creates an action
 - Bob appends that action to a set of actions to send to Steve
 - At discrete time steps, Bob sends the queued actions to Steve
 - Steve receives the actions and merges them with an actions received queue (merge primary key is time and player).
 - Steve iterates through the actions received queue, and either accepts or rejects each action based on Steve's copy of the game state.
 - Steve stores the processed actions, and adds them to a queue to broadcast to Bob and Alice.
 - At discrete time steps, Steve sends queued actions to Bob and Alice.
 - Bob and Alice receive the sent actions
 - Bob removes actions from the queue to send that match received actions
 - Bob inserts new actions into the history queue, and sends confirmation to Steve for each action received.
 - Steve receives confirmation, and removes the actions from the queue of actions to send.
 - Bob checks the first action added to the history queue.
 - Bob undoes history up to that time.
 - Bob applies all actions after that time in the queue to the current game state.
 - Bob renders the current game state.

## FAQ

### Why use discrete time action sends?

We are not commmitted to having actions occur at discrete times at this stage.  However, there are advantages in terms of state forecasting if we do things this way.  At this stage, however, our main concern is to appropriately decouple receiving/creating actions from processing those actions, and handle the asynchronicity at that stage.
