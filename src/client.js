
var SocketClient = require( 'socket.io-client' );
var EventEmitter = require( 'events' );

var inherits     = require('inherits');


var LabsClient = function( url, opts )
{
    EventEmitter.call( this );

    var io = SocketClient( url, opts );
    io.on( 'connect', function(){

        this.emit( LabsClient.CONNECT )
    }.bind(this) );
};


var createClient = function( host, port )
{
    new LabsClient( host, port );
};


LabsClient.CONNECT = 'connect';
LabsClient.START = 'session-start';
LabsClient.END = 'session-end';

LabsClient.POINT = 'point-added';
LabsClient.MESSAGE = 'message-added';

for( var key in LabsClient ){
    createClient[key] = LabsClient[ key ];
}


module.exports = createClient;
inherits( LabsClient, EventEmitter );


LabsClient.prototype.message = function( str ){

};

LabsClient.prototype.point = function( x, y, z ){

};

LabsClient.prototype.disconnect = function(){

};



