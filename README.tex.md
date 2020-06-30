# Board Game Engine

## TL; DR

An engine (framework?) that makes it very easy to prototype a board game, then
instantly play it with one's friends.

## Motivation

Wanted to play board games with friends during the quarantine period, but
couldn't find any good alternatives. Looked at many of them: BoardGameArena,
Tabletop Simulator, Tabletopia etc. but none of them came close

## Roadmap: how you can contribute

### Netcode

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

$$\{<card1, Hand, \{face: up\}>\} \rightarrow \{<card2, Hand, \{face: down\}>\}$$

and revealing a card up would be 

$$\{<card1, Board, \{face: down\}>\} \rightarrow \{<card2, Board, \{face: up\}>\}$$

Finally, the *history* is a sequence of game states.

### Some examples of board games in the <Entity, Zone, State> representation


## Netcode

There are really two different types of state here: "display" state, and "game"
state. The display state is a low-level description of all the objects(pngs) in
the frame and their x-y positions, and is constantly synced between clients and
server.

The *game* state is an authoritative description of the board state. This is
something that's synced only occasionally when players take actions, and the
server always holds the authoritative game state.

As an illustration of the difference, consider this (it won't make sense until
you've read the Formal-ish description):

Suppose there are two zones A and B. There is one entity (a red circle) in zone
A to begin. When a player picks up the red circle and moves it around, this
immediately updates the display state for all players. (It should 

Now the player drops the circle in zone B and releases the mouse. This sends an
action event to the server, which checks if the player has permission to move
the entity from zone A to zone B.

If yes, then the server updates the game state: entity Red Circle is now in
zone B.

If no, then the server does not update the game state: entity Red Circle is
still in zone A. 

But in either case, the *display state* has been updated. So an entity can be
*physically* in zone B (i.e. drawn in zone B) but its state is actually in zone
A.
