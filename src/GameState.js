class GameState {
  constructor(jsonFileName) {
    // could also be jsonStr
    this.loadState(jsonFileName);
    this.zones = [];
    this.images = {}; // storage for images
    this.players = {}; // an object containing player metadata (UID, maybe even client IP or something)
    this.entities = {}; // Entity objects need to contain their position and other useful metadata such as png filename
  }

  loadState(fileName) {
    // load state into this object
  }

  applyAction(zone, entity, action) {}

  getCurrentStateInfo() {
    // either this method or directly accessing the properties of this object
  }

  render() {}
}

// Adding Zone and Entity classes might also be a good idea
