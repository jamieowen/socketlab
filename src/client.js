
var SocketIOClient = require( 'socket.io-client' );
var EventEmitter = require( 'events' );

var inherits     = require( 'inherits' );
var events       = require( './events' );


var Client = function( url, projectID, opts )
{
    EventEmitter.call( this );

    if( projectID === undefined || isNaN( parseInt( projectID, 10 )) ){
        throw new Error( 'project id needs specifying to client.' );
    }

    opts = opts || {};

    this.projectID = projectID;

    this.sessionIndex = null; // project session id ( not server session id )

    this.connected = false;
    this.started   = false;
    this.starting  = false;

    var client = this;

    // define io here to prevent access
    var io = SocketIOClient( url, opts );
    this._io = io;

    // event from socket.io connection
    io.on( 'connect', function(){

        io.on( events.SESSION_CONNECTED, function(project){

            io.removeAllListeners();

            client.connected = true;
            client.emit( Client.CONNECTED );
        });

        io.on( events.SESSION_CONNECT_ERROR, function(error){

            io.removeAllListeners();

            client.connected = false;
            client.emit( Client.ERROR );
        });

        // TODO : Handle disconnect...

        // broadcast back to begin 'real' connection process ( with project id )
        io.emit( events.SESSION_CONNECT, projectID );

    } );

};

// Expose only the events needed for api.

Client.ERROR = 'session-error';
Client.CONNECTED = events.SESSION_CONNECTED;
Client.STARTED = events.SESSION_STARTED;
Client.ENDED = events.SESSION_ENDED;

Client.ADDED = events.ADDED;
Client.REMOVED = events.REMOVED;

Client.MESSAGE = events.MESSAGE;
Client.POINT = events.POINT;
Client.CONFIG = events.CONFIG;


module.exports = Client;
inherits( Client, EventEmitter );


Client.prototype.start = function(){

    if( this.connected && !this.started && !this.starting ){

        this.starting = true;

        var io = this._io;
        var client = this;

        io.removeAllListeners();

        io.on( events.SESSION_START_ERROR, function( error ){
            throw new Error( 'Start Error' );
        });

        io.on( events.SESSION_STARTED, function( sessionIndex ){

            this.starting = false;
            this.started = true;

            this.sessionIndex = sessionIndex;

            io.removeAllListeners();

            // listen for expected in-session events.

            io.on( events.ADDED, function( sessionIndex, config ){
                // will be called for
                client.emit( Client.ADDED, sessionIndex, config );
            });

            io.on( events.REMOVED, function( sessionIndex ){

                client.emit( Client.REMOVED, sessionIndex );
            });

            io.on( events.CONFIG, function( sessionIndex, config ){

                client.emit( Client.CONFIG, sessionIndex, config );
            });

            io.on( events.POINT, function( sessionIndex, point ){

                client.emit( Client.POINT, sessionIndex, point );
            });

            io.on( events.MESSAGE, function( sessionIndex, message ){
                client.emit( Client.POINT, sessionIndex, message );
            });

            // allow client to begin session data capture.
            this.emit( Client.STARTED, this.sessionIndex );

        }.bind(this) );

        // request to start session.
        io.emit( events.SESSION_START );

    }
};

Client.prototype.end = function(){
    // stub

    var io = this._io;

    //io.emit( events.SESSION_END );
};

Client.prototype.config = function( obj ){

};

Client.prototype.message = function( str ){
    // stub
};

Client.prototype.point = function( x, y, z ){
    // stub
};

Client.prototype.disconnect = function(){
    this._io.disconnect();
    this.connected = false;
};



