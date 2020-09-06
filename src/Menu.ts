import { Point } from "./Interfaces.js";

export abstract class Menu {
  name: String; // The name of the menu item
  constructor(name) {
    this.name = name;
  }
}

export class MenuItem extends Menu {
  callback: Function; // fn that will be called when MenuItem is clicked

  constructor(name: String, callback: Function) {
    super(name);
    this.callback = callback;
  }
}

export class SubMenu extends Menu {
  children: Menu[];
  constructor(name: String, children: Menu[]) {
    super(name);
    this.children = children;
  }
}

export function drawMenu(menu: SubMenu, point: Point) {
  // TODO
  console.log(menu);
  console.log(`Drawing menu at point (${point.x}, ${point.y})`);

  return root_menu_DOM_elem;
}

export function deleteMenu() {
  // TODO
  // Will think about how to do this
}
