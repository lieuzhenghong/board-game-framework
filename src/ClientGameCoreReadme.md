```
// Idea: store a finite state machine here so that we can be sensitive
// to context.

// There are a couple of actions I want to support right now
// as an MVP:

// == OPTION TYPE 1 ==
// Right-click on object to open context menu, then
// left-click on an option.

// Choice of options:
// --> change state of Entity (maybe this is a submenu)
// --> enter "change of Zone" mode where the next left click on a new Zone
// changes the entity to that zone, if permitted
// --> enter "change position" mode where the next left click at any position
// moves the entity to that position

// We should also implement the following option type:
// == OPTION TYPE 2 ==

// Left-click an object to enter "drag" mode, then
// move the mouse anywhere to move the entity's position.
// Left-click again to drop the entity.
// Note that this doesn't change the entity's zone.

// Change State Mode
// ^
// |
// |
// Base Mode --> Entity UI Mode --> Change Position Mode
// | ^ |
// | | |
// v | v
// Drag mode Change Zone mode

// We will also have a ContextMenu that is generated
// and probably also some flags like CurrentlyDraggingEntity
// and EntityCurrentlyDragged

//
// ******\_\_\_\_****** ****\_****
// | | | |
// UI [posx, posy, LMB, RMB] ===> | GameCore | Action[] ===> | Server |
// |******\_\_\_******| <=== |**\_\_\_\_**|
// |
// | Action[]
// v
// GameState
//
/\*
// == Time-based loop (every 15ms?): ==
// Client Core sends actions to Server Core from the action queue
// Server Core accumulates and validates actions from all Client Cores
// Server Core sends actions to Client Cores
// Client Core applies actions to GameState
// Client Core renders GameState

// == Event-based loop: ==
// on RightClick on Entity, Client Core generates Context UI
// ClientCore responds to clicks on Context UI and generates ServerActions

// on MouseMove or any other Click, Client UI sends mouse positions/clicks to Client Core
// Client Core converts mouse states to ServerActions
// Both types of actions are pushed into an action queue
\*/
```
