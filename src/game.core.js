/*  Copyright 2012-2016 Sven "underscorediscovery" Bergström
    
    written by : http://underscorediscovery.ca
    written for : http://buildnewgames.com/real-time-multiplayer/
    
    MIT Licensed.
*/

//The main update loop runs on requestAnimationFrame,
//Which falls back to a setTimeout loop on the server
//Code below is from Three.js, and sourced from links below

    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

    // requestAnimationFrame polyfill by Erik Möller
    // fixes from Paul Irish and Tino Zijdel

var frame_time = 60/1000; // run the local game at 16ms/ 60hz
if('undefined' != typeof(global)) frame_time = 45; //on server we run at 45ms, 22hz

( function () {

    var lastTime = 0;
    var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

    for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++ x ) {
        window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
        window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ] || window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
    }

    if ( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = function ( callback, element ) {
            var currTime = Date.now(), timeToCall = Math.max( 0, frame_time - ( currTime - lastTime ) );
            var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if ( !window.cancelAnimationFrame ) {
        window.cancelAnimationFrame = function ( id ) { clearTimeout( id ); };
    }

}() );

        //Now the main game class. This gets created on
        //both server and client. Server creates one for
        //each game that is hosted, and client creates one
        //for itself to play the game.
/* 
 * The game_core class
 */

    var game_core = function(game_instance){
        this.instance = game_instance;
        this.server = this.instance !== undefined;


        this.world = {
            width : 720,
            height : 480
        };
        if(this.server) {

            this.players = {
                self : new game_player(this,this.instance.player_host),
                other : new game_player(this,this.instance.player_client)
            };

           this.players.self.pos = {x:20,y:20};

        } else {

            this.players = {
                self : new game_player(this),
                other : new game_player(this)
            };

        }

        //The speed at which the clients move.
        this.playerspeed = 120;

        //A local timer for precision on server and client
        this.local_time = 0.016;            //The local timer
        this._dt = new Date().getTime();    //The local timer delta
        this._dte = new Date().getTime();   //The local timer last frame time

        // Server specific initialisation
        if(this.server){
            this.server_time = 0;
            this.laststate = {};
        }

        //Client specific initialisation
        if(!this.server) {
            
            //Create a keyboard handler
            this.keyboard = new THREEx.KeyboardState();

            //A list of recent server updates we interpolate across
            //This is the buffer that is the driving factor for our networking
            this.server_updates = [];

            //Connect to the socket.io server!
            this.client_connect_to_server();

            //We start pinging the server to determine latency
            this.client_create_ping_timer();

            //Make this only if requested
            if(String(window.location).indexOf('debug') != -1) {
                // No debug info yet
                // this.client_create_debug_gui();
            }

        }
    }; //game_core.constructor

// Export our class globally so we can use it from wherever
if( 'undefined' != typeof global ) {
    module.exports = global.game_core = game_core;
}

/*
    Helper functions for the game code

        Here we have some common maths and game related code to make working with 2d vectors easy,
        as well as some helpers for rounding numbers to fixed point.

*/

    // (4.22208334636).fixed(n) will return fixed point value to n places, default n = 3
Number.prototype.fixed = function(n) { n = n || 3; return parseFloat(this.toFixed(n)); };
// Stop update method:
game_core.prototype.stop_update = function() {  window.cancelAnimationFrame( this.updateid );  };
/*
 * The player class
 *
 * A simple class to maintain state of a player on screen,
 * as well as to draw that state when required.
 */

var game_player = function( game_instance, player_instance ) {

    //Store the instance, if any
    this.instance = player_instance;
    console.log(game_instance)
    this.game = game_instance;

    //Set up initial values for our state information
    this.pos = { x:0, y:0 };
    this.size = { x:16, y:16, hx:8, hy:8 };
    this.state = 'not-connected';
    this.id = '';

    //These are used in moving us around later
    this.old_state = {pos:{x:0,y:0}};
    this.cur_state = {pos:{x:0,y:0}};
    this.state_time = new Date().getTime();

    //Our local history of inputs
    this.inputs = [];

    //The world bounds we are confined to
    this.pos_limits = {
        x_min: this.size.hx,
        x_max: this.game.world.width - this.size.hx,
        y_min: this.size.hy,
        y_max: this.game.world.height - this.size.hy
    };

    //The 'host' of a game gets created with a player instance since
    //the server already knows who they are. If the server starts a game
    //with only a host, the other player is set up in the 'else' below
    if(player_instance) {
        this.pos = { x:20, y:20 };
    } else {
        this.pos = { x:500, y:200 };
    }

}; //game_player.constructor

    // TODO : Update this
    game_player.prototype.draw = function(){

            //Set the color for this player
        game.ctx.fillStyle = 'rgba(255,255,255,0.1)';

            //Draw a rectangle for us
        game.ctx.fillRect(this.pos.x - this.size.hx, this.pos.y - this.size.hy, this.size.x, this.size.y);

            //Draw a status update
        game.ctx.fillStyle = 'rgba(255,255,255,0.1)';
        game.ctx.fillText(this.state, this.pos.x+10, this.pos.y + 4);
    
    }; //game_player.draw
//Main update loop
game_core.prototype.update = function(t) {
    
    //Work out the delta time
    this.dt = this.lastframetime ? ( (t - this.lastframetime)/1000.0).fixed() : 0.016;

    //Store the last frame time
    this.lastframetime = t;

        //Update the game specifics
    if(this.server) {
        this.server_update();
    } else {
        this.client_update();
    }

    //schedule the next update
    this.updateid = window.requestAnimationFrame( this.update.bind(this), this.viewport );

}; //game_core.update




// Requires
//   this.ctx.clearRect
//   this.client_draw_info
//   this.client_handle_input
//   this.client_process_net_updates
//   player.draw
//   this.client_update_local_position
//   this.client_refresh_fps
game_core.prototype.client_update = function() {

    //Clear the screen area
    this.ctx.clearRect(0,0,720,480);

    //Capture inputs from the player
    this.client_handle_input();

    //Network player just gets drawn normally, with interpolation from
    //the server updates, smoothing out the positions from the past.
    //Note that if we don't have prediction enabled - this will also
    //update the actual local client position on screen as well.
    this.client_process_net_updates();

    //Now they should have updated, we can draw the entity
    this.players.other.draw();

    //When we are doing client side prediction, we smooth out our position
    //across frames using local input states we have stored.
    this.client_update_local_position();

    //And then we finally draw
    this.players.self.draw();

    //Work out the fps average
    this.client_refresh_fps();

}; //game_core.update_client



// Requires:
//   - player.instance.emit
//   - player.instance.pos
//   - player.instance.last_input_seq
game_core.prototype.server_update = function(){

    //Update the state of our local clock to match the timer
    this.server_time = this.local_time;

    //Make a snapshot of the current state, for updating the clients
    // TODO: Replace this with something more sensible for our actual state
    this.laststate = {
        hp  : this.players.self.pos,                //'host position', the game creators position
        cp  : this.players.other.pos,               //'client position', the person that joined, their position
        his : this.players.self.last_input_seq,     //'host input sequence', the last input we processed for the host
        cis : this.players.other.last_input_seq,    //'client input sequence', the last input we processed for the client
        t   : this.server_time                      // our current local time on the server
    };

    //Send the snapshot to the 'host' player
    if(this.players.self.instance) {
        this.players.self.instance.emit( 'onserverupdate', this.laststate );
    }

    //Send the snapshot to the 'client' player
    if(this.players.other.instance) {
        this.players.other.instance.emit( 'onserverupdate', this.laststate );
    }

}; //game_core.server_update


game_core.prototype.handle_server_input = function(client, input, input_time, input_seq) {

        //Fetch which client this refers to out of the two
    var player_client =
        (client.userid == this.players.self.instance.userid) ?
            this.players.self : this.players.other;

        //Store the input on the player instance for processing in the physics loop
   player_client.inputs.push({inputs:input, time:input_time, seq:input_seq});

}; //game_core.handle_server_input

/*

 Client side functions

    These functions below are specific to the client side only,
    and usually start with client_* to make things clearer.

*/

// This function handles taking user input and turning it into a sequence of packets to pass to the server
game_core.prototype.client_handle_input = function(){

    // Handle keyboard/mouse events:
    // Side effects: input.push(string) representing the input
    var x_dir = 0;
    var y_dir = 0;
    var input = [];
    this.client_has_input = false;

    if( this.keyboard.pressed('A') ||
        this.keyboard.pressed('left')) {

            x_dir = -1;
            input.push('l');

        } //left

    if( this.keyboard.pressed('D') ||
        this.keyboard.pressed('right')) {

            x_dir = 1;
            input.push('r');

        } //right

    if( this.keyboard.pressed('S') ||
        this.keyboard.pressed('down')) {

            y_dir = 1;
            input.push('d');

        } //down

    if( this.keyboard.pressed('W') ||
        this.keyboard.pressed('up')) {

            y_dir = -1;
            input.push('u');

        } //up

    // If any inputs happened
    if(input.length) {
        this.input_seq += 1

        this.players.self.inputs.push({inputs: input, time: this.local_time.fixed(3), seq: this.input_seq})
        //Send the packet of information to the server.
        //The input packets are labelled with an 'i' in front.
        var server_packet = 'i.';
            server_packet += input.join('-') + '.';
            server_packet += this.local_time.toFixed(3).replace('.','-') + '.';
            server_packet += this.input_seq;

            //Go
        this.socket.send(  server_packet  );
    }
    return {x:0,y:0};

}


// Predict states based on current input state and what you've heard from the server
// TODO : Currently this only reads from the server
game_core.prototype.client_process_net_prediction_correction = function() {

    //No updates...
    if(!this.server_updates.length) return;

    //The most recent server update
    var latest_server_data = this.server_updates[this.server_updates.length-1];

    //Our latest server position
    var my_server_pos = this.players.self.host ? latest_server_data.hp : latest_server_data.cp;

    // Handle local position by prediction, correcting it with the server and reconciling the differences
    var my_last_input_on_server = this.players.self.host ? latest_server_data.his : latest_server_data.cis;
    if(my_last_input_on_server) { // process last server input
        // Obtain the most recent input
        var lastinputseq_index = -1;
        for(var i = 0 ; i < this.players.self.inputs.length; ++i){
            if(this.players.self.inputs[i].seq == my_last_input_on_server) {
                lastinputseq_index = i;
                break;
            }
        }
        if(lastinputseq_index > 0) {
            var number_to_clear = lastinputseq_index + 1;
            
            this.players.self.inputs.splice(0, number_to_clear);
            //The player is now located at the new server position, authoritive server
            // this.players.self.cur_state.pos = this.pos(my_server_pos);
            this.players.self.last_input_seq = lastinputseq_index;
            // Skipping physics based prediction for now.  we can add it back in if we see problems
            //Now we reapply all the inputs that we have locally that
            //the server hasn't yet confirmed. This will 'keep' our position the same,
            //but also confirm the server position at the same time.
            // this.client_update_physics();
            // this.client_update_local_position();
        }
    } // end process last server input
} //game_core.prototype.client_process_net_prediction_correction
    

// TODO: FIX ME
game_core.prototype.client_process_net_updates = function() {

    //No updates...
    if(!this.server_updates.length) return;
    //First : Find the position in the updates, on the timeline
    //We call this current_time, then we find the past_pos and the target_pos using this,
    //searching throught the server_updates array for current_time in between 2 other times.
    // Then :  other player position = lerp ( past_pos, target_pos, current_time );

    //Find the position in the timeline of updates we stored.
    var current_time = this.client_time;
    var count = this.server_updates.length-1;
    var target = null;
    var previous = null;

    //We look from the 'oldest' updates, since the newest ones
    //are at the end (list.length-1 for example). This will be expensive
    //only when our time is not found on the timeline, since it will run all
    //samples. Usually this iterates very little before breaking out with a target.
    for(var i = 0; i < count; ++i) {

        var point = this.server_updates[i];
        var next_point = this.server_updates[i+1];

            //Compare our point in time with the server times we have
        if(current_time > point.t && current_time < next_point.t) {
            target = next_point;
            previous = point;
            break;
        }
    }

    //With no target we store the last known
    //server position and move to that instead
    if(!target) {
        target = this.server_updates[0];
        previous = this.server_updates[0];
    }

    //Now that we have a target and a previous destination,
    //We can interpolate between then based on 'how far in between' we are.
    //This is simple percentage maths, value/target = [0,1] range of numbers.
    //lerp requires the 0,1 value to lerp to? thats the one.

    if(target && previous) {
        this.target_time = target.t;

        var difference = this.target_time - current_time;
        var max_difference = (target.t - previous.t).fixed(3);
        var time_point = (difference/max_difference).fixed(3);

            //Because we use the same target and previous in extreme cases
            //It is possible to get incorrect values due to division by 0 difference
            //and such. This is a safe guard and should probably not be here. lol.
        if( isNaN(time_point) ) time_point = 0;
        if(time_point == -Infinity) time_point = 0;
        if(time_point == Infinity) time_point = 0;

        //The most recent server update
        var latest_server_data = this.server_updates[ this.server_updates.length-1 ];

        //These are the exact server positions from this tick, but only for the ghost
        var other_server_pos = this.players.self.host ? latest_server_data.cp : latest_server_data.hp;

        //The other players positions in this timeline, behind us and in front of us
        var other_target_pos = this.players.self.host ? target.cp : target.hp;
        var other_past_pos = this.players.self.host ? previous.cp : previous.hp;

        //These are the exact server positions from this tick, but only for the ghost
        var my_server_pos = this.players.self.host ? latest_server_data.hp : latest_server_data.cp;

        //The other players positions in this timeline, behind us and in front of us
        var my_target_pos = this.players.self.host ? target.hp : target.cp;
        var my_past_pos = this.players.self.host ? previous.hp : previous.cp;

        // this.players.self.pos = this.pos( local_target );
        // this.players.other.pos = this.pos(other_server_pos);
    }
}; //game_core.client_process_net_updates

game_core.prototype.client_onserverupdate_recieved = function(data){

    //Lets clarify the information we have locally. One of the players is 'hosting' and
    //the other is a joined in client, so we name these host and client for making sure
    //the positions we get from the server are mapped onto the correct local sprites
    var player_host = this.players.self.host ?  this.players.self : this.players.other;
    var player_client = this.players.self.host ?  this.players.other : this.players.self;
    var this_player = this.players.self;
        
    //Store the server time (this is offset by the latency in the network, by the time we get it)
    this.server_time = data.t;
    //Update our local offset time from the last server update
    this.client_time = this.server_time - (this.net_offset/1000);

    //Cache the data from the server,
    //and then play the timeline
    //back to the player with a small delay (net_offset), allowing
    //interpolation between the points.
    this.server_updates.push(data);

    //we limit the buffer in seconds worth of updates
    //60fps*buffer seconds = number of samples
    if(this.server_updates.length >= ( 60*this.buffer_size )) {
        this.server_updates.splice(0,1);
    }

    //We can see when the last tick we know of happened.
    //If client_time gets behind this due to latency, a snap occurs
    //to the last tick. Unavoidable, and a reallly bad connection here.
    //If that happens it might be best to drop the game after a period of time.
    this.oldest_tick = this.server_updates[0].t;

    //Handle the latest positions from the server
    //and make sure to correct our local predictions, making the server have final say.
    this.client_process_net_prediction_correction();

}; //game_core.client_onserverupdate_recieved

// Not actually sure what this does...
game_core.prototype.client_update_local_position = function(){

    if(this.client_predict) {
        var old_state = this.players.self.old_state.pos;
        var current_state = this.players.self.cur_state.pos;
        this.players.self.pos = current_state;
    }  //if(this.client_predict)
}; //game_core.prototype.client_update_local_position

game_core.prototype.client_create_ping_timer = function() {

        //Set a ping timer to 1 second, to maintain the ping/latency between
        //client and server and calculated roughly how our connection is doing

    setInterval(function(){

        this.last_ping_time = new Date().getTime() - this.fake_lag;
        this.socket.send('p.' + (this.last_ping_time) );

    }.bind(this), 1000);
    
}; //game_core.client_create_ping_timer
game_core.prototype.client_reset_positions = function() {

    var player_host = this.players.self.host ?  this.players.self : this.players.other;
    var player_client = this.players.self.host ?  this.players.other : this.players.self;

        //Host always spawns at the top left.
    player_host.pos = { x:20,y:20 };
    player_client.pos = { x:500, y:200 };

        //Make sure the local player physics is updated
    // this.players.self.old_state.pos = this.pos(this.players.self.pos);
    // this.players.self.pos = this.pos(this.players.self.pos);
    // this.players.self.cur_state.pos = this.pos(this.players.self.pos);

}; //game_core.client_reset_positions

game_core.prototype.client_onreadygame = function(data) {

    var server_time = parseFloat(data.replace('-','.'));

    var player_host = this.players.self.host ?  this.players.self : this.players.other;
    var player_client = this.players.self.host ?  this.players.other : this.players.self;

    this.local_time = server_time + this.net_latency;
    console.log('server time is about ' + this.local_time);

        //Store their info colors for clarity. server is always blue
    player_host.info_color = '#2288cc';
    player_client.info_color = '#cc8822';
        
        //Update their information
    player_host.state = 'local_pos(hosting)';
    player_client.state = 'local_pos(joined)';

    this.players.self.state = 'YOU ' + this.players.self.state;

        //Make sure colors are synced up
     this.socket.send('c.' + this.players.self.color);

}; //client_onreadygame
game_core.prototype.client_onjoingame = function(data) {

        //We are not the host
    this.players.self.host = false;
        //Update the local state
    this.players.self.state = 'connected.joined.waiting';

        //Make sure the positions match servers and other clients
    this.client_reset_positions();

}; //client_onjoingame
game_core.prototype.client_onhostgame = function(data) {

        //The server sends the time when asking us to host, but it should be a new game.
        //so the value will be really small anyway (15 or 16ms)
    var server_time = parseFloat(data.replace('-','.'));

        //Get an estimate of the current time on the server
    this.local_time = server_time + this.net_latency;

        //Set the flag that we are hosting, this helps us position respawns correctly
    this.players.self.host = true;

        //Update debugging information to display state
    this.players.self.state = 'hosting.waiting for a player';

        //Make sure we start in the correct place as the host.
    this.client_reset_positions();

}; //client_onhostgame
game_core.prototype.client_onconnected = function(data) {

        //The server responded that we are now in a game,
        //this lets us store the information about ourselves and set the colors
        //to show we are now ready to be playing.
    this.players.self.id = data.id;
    this.players.self.state = 'connected';
    this.players.self.online = true;

}; //client_onconnected
game_core.prototype.client_onping = function(data) {

    this.net_ping = new Date().getTime() - parseFloat( data );
    this.net_latency = this.net_ping/2;

}; //client_onping
game_core.prototype.client_onnetmessage = function(data) {

    var commands = data.split('.');
    var command = commands[0];
    var subcommand = commands[1] || null;
    var commanddata = commands[2] || null;

    switch(command) {
        case 's': //server message

            switch(subcommand) {

                case 'h' : //host a game requested
                    this.client_onhostgame(commanddata); break;

                case 'j' : //join a game requested
                    this.client_onjoingame(commanddata); break;

                case 'r' : //ready a game requested
                    this.client_onreadygame(commanddata); break;

                case 'e' : //end game requested
                    this.client_ondisconnect(commanddata); break;

                case 'p' : //server ping
                    this.client_onping(commanddata); break;

                case 'c' : //other player changed colors
                    this.client_on_otherclientcolorchange(commanddata); break;

            } //subcommand

        break; //'s'
    } //command
                
}; //client_onnetmessage

game_core.prototype.client_ondisconnect = function(data) {
    
    //When we disconnect, we don't know if the other player is
    //connected or not, and since we aren't, everything goes to offline

    this.players.self.state = 'not-connected';
    this.players.self.online = false;

    this.players.other.state = 'not-connected';

}; //client_ondisconnect
game_core.prototype.client_connect_to_server = function() {
        
        //Store a local reference to our connection to the server
        this.socket = io.connect();

        //When we connect, we are not 'connected' until we have a server id
        //and are placed in a game by the server. The server sends us a message for that.
        this.socket.on('connect', function(){
            this.players.self.state = 'connecting';
        }.bind(this));

        //Sent when we are disconnected (network, server down, etc)
        this.socket.on('disconnect', this.client_ondisconnect.bind(this));
        //Sent each tick of the server simulation. This is our authoritive update
        this.socket.on('onserverupdate', this.client_onserverupdate_recieved.bind(this));
        //Handle when we connect to the server, showing state and storing id's.
        this.socket.on('onconnected', this.client_onconnected.bind(this));
        //On error we just show that we are not connected for now. Can print the data.
        this.socket.on('error', this.client_ondisconnect.bind(this));
        //On message from the server, we parse the commands and send it to the handlers
        this.socket.on('message', this.client_onnetmessage.bind(this));

}; //game_core.client_connect_to_server


game_core.prototype.client_refresh_fps = function() {

        //We store the fps for 10 frames, by adding it to this accumulator
    this.fps = 1/this.dt;
    this.fps_avg_acc += this.fps;
    this.fps_avg_count++;

        //When we reach 10 frames we work out the average fps
    if(this.fps_avg_count >= 10) {

        this.fps_avg = this.fps_avg_acc/10;
        this.fps_avg_count = 1;
        this.fps_avg_acc = this.fps;

    } //reached 10 frames

}; //game_core.client_refresh_fps
