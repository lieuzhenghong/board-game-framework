# Board Game Engine

## TL; DR

An engine (framework?) that makes it very easy to prototype a board game, then
instantly play it with one's friends.

## Motivation

Wanted to play board games with friends during the quarantine period, but
couldn't find any good alternatives. Looked at many of them: BoardGameArena,
Tabletop Simulator, Tabletopia etc. but none of them really gave me what I wanted.

## What we need to do at the minimum for an MVP

1. Get rendering
2. Get representation of game state to exist and be consistent throughout server and client
Encapsulate game state and actions into a class
What the netcode will need to do: take a game state, modify it by an action, check the validity of that action, return a game state
If we have a game state and action class
and we have gameState.apply(action) which returns True or False if the new gameState is valid/otherwise or just gameState
Client sends a list of actions it wants the server to look at
Server takes list of actions from clients and applies those. It keeps track of which actions it's already applied, and applies only the actions it hasn't already seen before and are valid.
It modifies the game state to that point and sends back all the actions that are accepted

### Netcode

We need to build a server that can send and receive game states. This server
needs to be authoritative (i.e. it should have some way of denying invalid
game-states sent by the client, and reconcile two mutually incompatible client
game states)

There needs to be a way to share a link with a friend (to enter the same
lobby), or to create/join a public lobby.

### Client-side

#### State representation

We are now straightforwardly displaying all entities in all zones to all
players without checking zone permissions. We need to display or not display
entities depending on zones' permissions.

- Make sure that every single entity has a "glance" state png in the JSON.

#### Client-side UI

First, we need to find a way to know what object is clicked. We have the
position but this also means knowing the size of each PNG as it is drawn on the
canvas. Maybe Shan can handle this.

Do a simple linear search over the game state (or possibly the "visible
objects" game state, which I will prepare for Shan).

Second, we need to display the context-sensitive UI depending on the object.

### Graphics

### Game state


### UI

## Formal-ish description of board state

The below is 

Three different elements: zones, players, and entities.

An entity has a *property* and can be in a *zone*. An entity is a chess piece,
a card, a die, a Scrabble tile, a piece of paper, etc.

A zone contains entities. A zone is a private hand, the game board, a bag, etc.

Players have *permissions* to see/move entities to and from zones. To move
an entity from a zone is an *action*.

A *game state* $G$ is a list of 3-tuples $<Entity, Zone, State>$, where `State`
is itself a dictionary of key-value pairs denoting the state of the entity.

**Action set**. There are three possible actions that any player can do:

- Add or remove an entity;
- moving an entity from one zone to another;
- changing the state of an entity.

An *action* is a function that takes a game state G and returns another:

$$f:G \rightarrow G$$

For instance, moving an entity from one's hand to the board changes the game
state from

$$\{<card1, Hand, \{face: up\}>\} \rightarrow \{<card1, Hand, \{face: down\}>\}$$

and revealing a card by flipping it face-up would be 

$$\{<card1, Board, \{face: down\}>\} \rightarrow \{<card1, Board, \{face: up\}>\}$$

Finally, the *history* is a sequence of game states.

### Some examples of board games in the <Entity, Zone, State> representation


## Game state

