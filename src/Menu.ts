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

export function drawMenu(menu: SubMenu, point: Point): HTMLElement {
  // TODO
  // This function should create a HTML element representing the
  // menu object,
  // and render that HTML element at position (x, y)
  // Returns the HTML element
  console.log(menu);
  console.log(`Drawing menu at point (${point.x}, ${point.y})`);

  let root_menu_DOM_elem: HTMLElement;
  return root_menu_DOM_elem;
}

export function deleteMenu() {
  // TODO
  // Will think about how to do this
}
