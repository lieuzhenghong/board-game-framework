class UIHandler {
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

  handleRightClick() {}

  handleLeftClick() {}
}
