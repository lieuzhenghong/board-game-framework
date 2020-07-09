/* The following is fake header files for the netcode:
 * I'll be documentin function signatures, arguments, returns and side effects here
 * There is no code in this file
 */

/* unnamed function
 * This function has something to do with animations, I'm not sure exactly what, but left it alone since there's no way for me to edit it
 * This *might* be the class structure that was mentioned, in which case this is a class?
 * It has something to do with rendering
 */


/*
 * game_core
 *
 * game_core is an instance of a game state.
 * It can be initialized by a game instance, which is just an identifying structure used by the server
 * This object contains the full state of the game.
 * It has the following members:
 *     game_state     : a game_state object
 *     instance       : a unique identifier of the game, including information about the server and all clients
 *     local_time     : a local clock (.016 ahead of server time)
 *     server         : [boolean] is this the server?
 *     server_time    : a local clock (0 ahead of server time).  only defined if server is true
 *     laststate      : previous game_state.  only defined if server is true
 *     UI             : UI state.  only defined if server is false
 *     server_updates : A list of actions to modify game_state from the server
 *
 * It has the following methods:
 *     stop_update() : stops the current animationframe?
 *     update() : this method runs each tick, and updates all of the states
 *     client_update() : this method runs on the client each tick.  It blanks the canvas, processes authoritative state from the server, processes local client state, and draws the results
 *     server_update() : this method runs on the server each tick.  It saves the previous state, and sends that state to both clients.  TODO: make the server compute authoritative state by processing actions sent from client.
 *     handle_server_input(client,input,input_time,input_seq) : Handle input in the form of messages from the server
 *         client     : Which client the mesasge comes from
 *         input      : Not sure
 *         input_time : The timestamp of the message
 *         input_seq  : Not sure
 *     client_handle_input() : Handle input in the form of keyboard/mouse input on the client.  This method basically loops over all possible inputs, collects them into actions, and sends those actions to the server over socket
 *     client_process_net_prediction_correction() : Calculate the deviation from the previously predicted position and the actual position given by the server (NOTE: Mostly gutted for now)
 *     client_process_net_updates() : Calculate the current expected position of all renderables based on the actions passed from the server and their last known state (NOTE: Mostly gutted for now)
 *     client_onserverupdate_received(data) : Update the list of actions that the server has received of those sent, as well as the list of actions to apply to the current state
 *         data : The action list (Note: I am currently not sure if it's an action list or state, but should eventually be action list)
 *     client_update_local_position() : This stores some things for calculation.  (NOTE: This is currently gutted)
 *     client_create_ping_timer() : Used for calculating ping/latency
 *     client_reset_positions() : Return the game to it's initial state (NOTE: This is not currently in use)
 *     client_onreadygame(data) : Initialization function for a game.  Includes local setup, as well as communication with the server to make sure initial state is synced
 *         data : A timestamp with the current server_time
 *     client_onjoingame(data)  : Code run on joining an existing game
 *         data : A timestamp with the current server_time
 *     client_onhostgame(data)  : Code run on hosting a new game
 *         data : A timestamp with the current server_time
 *     client_onconnected(data) : Code run when connected to a game
 *         data : A timestamp with the current server_time
 *     client_onping(data) : Set latency based on difference between current time and server time
 *         data : A timestamp with the current server_time
 *     client_onnetmessage(data) : How to react to different messages from the server (This triggers the other client_on* with subsets of the command as arguments)
 *         data : A set of commands separated by '.'
 *     client_ondisconnect(data) : Code run when disconnecting
 *         data : A set of commands separated by '.'
 *     client_connect_to_server() : Connect to a server and bind different socket behaviour to functions
 *     client_refresh_fps() : track the fps over every 10 frames
 */

/* renderable
 *
 * renderable is anything that can be drawn to screen.
 * It can be initialized from a game_instance, and ... TODO FILL ME IN
 * In general, I expect zones and entities (and more?) to be renderables.
 *
 * It has the following members:
 *     game             : The game instance it is associated with
 *     pos              : A point to keep track of it's position (which point will depend on render code)
 *     size             : The dimensions of the renderable
 *     image            : The image to associate with this entity
 *     pos_limits       : Bounds for pos
 *     old_state        : previous pos
 *     cur_state        : current pos
 *     state_time       : time associated with cur_state and old_state
 *     relevant_actions : list of (position movement) actions affecting this renderable
 *
 * It has the following methods:
 *     draw()   : Get this ready for rendering
 */
