let game = {
    canvas: {},
    ctx: {}
}

function init() {
    game.canvas = document.getElementById('game-canvas');
    game.canvas.width = game.canvas.clientWidth;
    game.canvas.height = game.canvas.clientHeight;
    game.UI = {};
    game.UI.contextMenu = document.getElementById('context-menu');
    game.canvas.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        menu = document.getElementById('context-menu');
        menu.style.left = e.pageX + "px";
        menu.style.top = e.pageY + "px";
        menu.style.display = 'flex';
    })

    document.addEventListener('mousedown', function(e) {
        if (e.which === 1) { // left click
            if (game.UI.contextMenu.style.display === 'flex' && !game.UI.contextMenu.hasMouseInside) {
                game.UI.contextMenu.style.display = 'none';
            }
            else {

            }
        }
    });
    game.ctx = game.canvas.getContext('2d');

    var divs = document.getElementsByTagName("div");
    for (var i = 0; i < divs.length; i++) {
        divs[i].hasMouseInside = false;
        divs[i].addEventListener('mouseenter', function () { this.hasMouseInside = true });
        divs[i].addEventListener('mouseleave', function () { this.hasMouseInside = false });
    }
}

window.onload = init;