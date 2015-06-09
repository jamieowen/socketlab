
var SocketClient = require( 'socket.io-client' );
var EventEmitter = require( 'events' );

var inherits     = require( 'inherits' );
var events       = require( './events' );


var LabsClient = function( url, projectId, opts )
{
    EventEmitter.call( this );

    if( projectId === undefined || isNaN( parseInt( projectId, 10 )) ){
        throw new Error( 'project id needs specifying to client.' );
    }

    var client = this;
    // define io here to prevent access
    var io = SocketClient( url, opts );

    // event from socket.io connection
    io.on( 'connect', function(){

        var count = 0;
        io.on( LabsClient.CONNECTED, function(project){
            count++;
            console.log( count, 'Client fully connected', project );

            client.emit( LabsClient.CONNECTED );
        });

        io.on( LabsClient.CONNECT_ERROR, function(error){
            console.log( 'Client connection error', error );

            client.emit( LabsClient.CONNECT_ERROR );
        });

        // broadcast back to begin 'real' connection process ( with project id )
        io.emit( LabsClient.CONNECT, projectId );

    } );

    this._disconnect = function(){
        io.disconnect();
    }
};


var createClient = function( url, projectId, opts )
{
    return new LabsClient( url, projectId, opts );
};


LabsClient.CONNECT = events.CONNECT;
LabsClient.CONNECTED = events.CONNECTED;
LabsClient.CONNECT_ERROR = events.CONNECT_ERROR;

LabsClient.START = events.START;
LabsClient.STARTED = events.STARTED;
LabsClient.START_ERROR = events.START_ERROR;

LabsClient.HISTORY_FETCH = events.HISTORY_FETCH;
LabsClient.HISTORY_FETCHED = events.HISTORY_FETCHED;
LabsClient.HISTORY_ERROR = events.HISTORY_ERROR;

LabsClient.MESSAGE_SEND = events.MESSAGE_SEND;
LabsClient.MESSAGE_SENT = events.MESSAGE_SENT;
LabsClient.MESSAGE_ERROR = events.MESSAGE_ERROR;

LabsClient.POINT_SEND = events.POINT_SEND;
LabsClient.POINT_SENT = events.POINT_SENT;
LabsClient.POINT_ERROR = events.POINT_ERROR;

LabsClient.END = events.END;
LabsClient.ENDED = events.ENDED;
LabsClient.END_ERROR = events.END_ERROR;


for( var key in LabsClient ){
    createClient[key] = LabsClient[ key ];
}


module.exports = createClient;
inherits( LabsClient, EventEmitter );


LabsClient.prototype.message = function( str ){
    // validate message


};

LabsClient.prototype.point = function( x, y, z ){

};

LabsClient.prototype.disconnect = function(){
    if( this._disconnect ){
        this._disconnect();
    }
};



