export class Zone {
    // TODO build a constructor
    constructor(playerList, name, image, pos, move_to_permissions, move_from_permissions, view_permissions, glance_permissions) {
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
