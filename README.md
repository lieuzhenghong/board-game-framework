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

A *game state* <img src="/tex/5201385589993766eea584cd3aa6fa13.svg?invert_in_darkmode&sanitize=true" align=middle width=12.92464304999999pt height=22.465723500000017pt/> is a list of 3-tuples <img src="/tex/7a13792788c72ac8bba49c0ba6288587.svg?invert_in_darkmode&sanitize=true" align=middle width=175.5777144pt height=22.465723500000017pt/>, where `State`
is itself a dictionary of key-value pairs denoting the state of the entity.

An *action* is a function that takes a game state G and returns another:

<p align="center"><img src="/tex/4cf0cdda1f9dc487ab8dcb716345d882.svg?invert_in_darkmode&sanitize=true" align=middle width=74.93572185pt height=14.611878599999999pt/></p>

For instance, moving an entity from one's hand to the board is

<p align="center"><img src="/tex/4b7c84743b2c3edab467d0f1997c528e.svg?invert_in_darkmode&sanitize=true" align=middle width=439.55451045pt height=14.611878599999999pt/></p>

and revealing a card up would be 

<p align="center"><img src="/tex/b26779622c564af2915d50db468a3e02.svg?invert_in_darkmode&sanitize=true" align=middle width=448.08961064999994pt height=14.611878599999999pt/></p>


Action set :

- moving an entity from one zone to another;
- changing the state of an entity;

Finally, the *history* is a sequence of game states.
