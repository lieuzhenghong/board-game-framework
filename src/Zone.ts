import { PlayerName, Point } from "./Interfaces";

export class Zone {
  name: string;
  image: string;
  move_to_permissions: Array<PlayerName>;
  move_from_permissions: Array<PlayerName>;
  view_permissions: Array<PlayerName>;
  glance_permissions: Array<PlayerName>;
  pos: Point;

  // TODO build a constructor
  constructor(
    playerList: Array<PlayerName>,
    name: string,
    image: string,
    pos: Point,
    move_to_permissions?: Array<PlayerName>,
    move_from_permissions?: Array<PlayerName>,
    view_permissions?: Array<PlayerName>,
    glance_permissions?: Array<PlayerName>
  ) {
    this.name = name;
    this.image = image;
    this.pos = pos;

    // Initialise default permissions let everyone see and move if not otherwise
    // specified
    this.move_to_permissions = move_to_permissions
      ? move_to_permissions
      : playerList;
    this.move_from_permissions = move_from_permissions
      ? move_from_permissions
      : playerList;
    this.view_permissions = view_permissions ? view_permissions : playerList;
    this.glance_permissions = glance_permissions
      ? glance_permissions
      : playerList;
  }
}
