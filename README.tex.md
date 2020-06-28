# Board Game Engine

## TL; DR

An engine (framework?) that makes it very easy to prototype a board game, then
instantly play it with one's friends.

## Motivation


## Formal-ish description

Three different elements: zones, players, and entities.

An entity has a *property* and can be in a *zone*.

A zone contains entities.

Players have permissions to take see/move entities to and from zones. To move
an entity from a zone is an action (defined later).

A *game state* $G$ is a list of 3-tuples $<Entity, Zone, State>$, where `State`
is itself a dictionary of key-value pairs denoting the state of the entity.

**Action set**. There are three possible actions that any player can do:

- Add an entity to the zone
- moving an entity from one zone to another;
- changing the state of an entity;

An *action* is a function that takes a game state G and returns another:

$$f:G \rightarrow G$$

For instance, moving an entity from one's hand to the board is

$${<card1, Hand, {face: up}>} \rightarrow {<card2, Hand, {face: down}>}$$

and revealing a card up would be 

$${<card1, Board, {face: down}>} \rightarrow {<card2, Board, {face: up}>}$$


Finally, the *history* is a sequence of game states.
