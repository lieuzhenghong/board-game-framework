class Entity {
    constructor(uid, type, stateList, stateMap, state, image, glance_image, zone, pos) {
        this.uid = uid;
        this.type = type;
        this.state = state;
        this.stateList = stateList;
        this.stateMap = stateMap;
        this.image = image;
        this.zone = zone;
        this.pos = pos;
    }
    change_zone(new_zone) {
        this.zone = new_zone;
    }
    change_state(new_state) {
        // TODO change image as well
        this.state = new_state;
        const stateString = this.state.toString();
        // Look through each entity state in the ImageMap
        // memory issues?
        this.image = this.stateMap[stateString];
    }
    change_pos(new_pos) {
        this.pos = new_pos;
    }
    draw(gameState) {
        // You need the gameState object
        let bitmap = gameState.imageMap[this.image];
        gameState.ctx.drawImage(bitmap, this.pos.x, this.pos.y);
    }
}
