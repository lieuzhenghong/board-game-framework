class Menu {
    constructor(name) {
        this.name = name;
    }
}
class MenuItem extends Menu {
    constructor(name, callback) {
        super(name);
        this.callback = callback;
    }
}
class SubMenu extends Menu {
    constructor(name, children) {
        super(name);
        this.children = children;
    }
}
