import { Point } from "./Interfaces.js";

export abstract class Menu {
  name: string; // The name of the menu item
  constructor(name) {
    this.name = name;
  }
}

export class MenuItem extends Menu {
  callback: (ev:Event) => any; // fn that will be called when MenuItem is clicked

  constructor(name: string, callback: (ev: Event) => any) {
    super(name);
    this.callback = callback;
  }
}

export class SubMenu extends Menu {
  children: Array<SubMenu|MenuItem>;
  constructor(name: string, children: Array<SubMenu|MenuItem>) {
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

  function isSubMenu(menu: MenuItem | SubMenu): menu is SubMenu {
    return (menu as SubMenu).children !== undefined;
  }

  function isMenuItem(menu: MenuItem | SubMenu): menu is MenuItem {
    return (menu as MenuItem).callback !== undefined;
  }

  // This is BFS! I'm glad I got to use it 
  const depth = 0;
  const queue : [(MenuItem | SubMenu), HTMLElement, number, number][] = [];
  const MENUITEM_WIDTH = 150;
  const MENUITEM_HEIGHT = 50;

  const context_menu_DOM_elem: HTMLElement = document.getElementById('context-menu');
  context_menu_DOM_elem.style.display = "block"
  let root_menu_DOM_elem: HTMLElement = document.createElement("div")
  context_menu_DOM_elem.innerHTML = ''; // reset the context menu
  context_menu_DOM_elem.appendChild(root_menu_DOM_elem)

  menu.children.map((child, idx) => {
    queue.push([child, root_menu_DOM_elem, idx, depth])
  })

  while (queue.length > 0) {
    let top = queue.shift();
    // Render top element
    const new_menu_item = document.createElement("div")
    new_menu_item.appendChild(document.createTextNode(top[0].name))
    if (isMenuItem(top[0])) {
      // new_menu_item.onclick(this, top[0].callback)
      new_menu_item.addEventListener('click',
      top[0].callback, false)
    }
    top[1].appendChild(new_menu_item)


    if (isSubMenu(top[0])) {
      top[0].children.map((child, idx) => {
        queue.push([child, new_menu_item, idx, top[3] + 1])
      })
    } 


  }

  console.log(root_menu_DOM_elem.outerHTML)
  return root_menu_DOM_elem;
}

export function deleteMenu() {
  // TODO
  // Will think about how to do this
}
