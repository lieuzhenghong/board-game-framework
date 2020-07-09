class Entity {
    constructor(uid, type, state, image, zone, pos) {
        this.uid = uid;
        this.type = type;
        this.state = state;
        this.image = image;
        this.zone = zone;
        this.pos = pos;
    }
    change_zone(new_zone) {
        this.zone = new_zone;
    }
    change_state(new_state) {
        this.state = new_state;
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
