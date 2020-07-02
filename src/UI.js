/*
    Parameters:
        text: the text the action shows up as in the context menu
        action: a function to execute on click
*/
const addAction = function (text, action) {
    let menuItem = document.createElement("div");
    menuItem.classList.add("menu-item");
    menuItem.innerHTML = text;
    menuItem.action = action; // add an action property to the menu item, it'll be called on click.

    menuItem.addEventListener("click", function (e) {
        menuItem.action(); // execute the action when this item is clicked
        game.UI.contextMenu.style.display = "none"; // hide the menu on click
    });

    game.UI.contextMenu.appendChild(menuItem);
};

const generateContextMenu = function () {
    game.UI.contextMenu.innerHTML = "";
    // Here there should be some calculations for finding out what object is under the mouse,
    // and then generating a context menu based on that info. (use addAction() method)
    addAction("fixme", function () {
        alert("TODO: add context menu generation");
    });
};