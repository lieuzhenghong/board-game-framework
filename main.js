let game = {
    canvas: {},
    ctx: {}
}

function init() {
    game.canvas = document.getElementById('game-canvas');
    game.canvas.width = game.canvas.clientWidth;
    game.canvas.height = game.canvas.clientHeight;
    game.UI = {}; // empty object so we can keep adding items to it as the UI grows but maintain
                  // organisation and not clutter up the global namespace.
    game.UI.contextMenu = document.getElementById('context-menu');
    game.canvas.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        menu = document.getElementById('context-menu');
        menu.style.left = e.pageX + "px"; // set position of contextmenu
        menu.style.top = e.pageY + "px";
        menu.style.display = 'flex';

        generateContextMenu();
    })

    document.addEventListener('mousedown', function (e) {
        if (e.which === 1) { // left click
            if (game.UI.contextMenu.style.display === 'flex' && ! game.UI.contextMenu.hasMouseInside) {
                game.UI.contextMenu.style.display = 'none'; // hide context menu if we clicked outside it
            } // this might break later on as we start to need the mouse for other things - feel free to rework
        }
    });
    game.ctx = game.canvas.getContext('2d');

    var divs = document.getElementsByTagName("div");
    for (var i = 0; i < divs.length; i++) {
        divs[i].hasMouseInside = false; // inelegant solution but it works :3
        divs[i].addEventListener('mouseenter', function () {
            this.hasMouseInside = true;
        });
        divs[i].addEventListener('mouseleave', function () {
            this.hasMouseInside = false;
        });
    }
}

window.onload = init;

/*
    Parameters:
        text: the text the action shows up as in the context menu
        action: a function to execute on click
*/
addAction = function (text, action) {
    let menuItem = document.createElement('div')
    menuItem.classList.add('menu-item');
    menuItem.innerHTML = text;
    menuItem.action = action; // add an action property to the menu item, it'll be called on click.

    menuItem.addEventListener('click', function(e) {
        menuItem.action(); // execute the action when this item is clicked
        game.UI.contextMenu.style.display = 'none'; // hide the menu on click
    });
    
    game.UI.contextMenu.appendChild(menuItem);
}

generateContextMenu = function() {
    game.UI.contextMenu.innerHTML = "";
    // Here there should be some calculations for finding out what object is under the mouse,
    // and then generating a context menu based on that info. (use addAction() method)
    addAction("fixme", function() {
        alert('TODO: add context menu generation')
    })
}

/* 
 * Just a test function for now. In reality we'd interface this properly with the networking code
 * Loads all assets for the tic-tac-toe game
*/

function loadGame() {
    fetch("https://raw.githubusercontent.com/lieuzhenghong/board-game-framework/master/examples/tic-tac-toe/image_map.json").then(
        (response) => {
            // success
            image_map = response
        }).catch((err) => {
            console.warn("Something went wrong", err)
        })
    fetch("https://raw.githubusercontent.com/lieuzhenghong/board-game-framework/master/examples/tic-tac-toe/game_state.json").then(
        (response) => {
            // success
            game_state = response
        }).catch((err) => {
            console.warn("Something went wrong", err)
        })
    // Now we have game state and image map, let's fetch all the images
}
