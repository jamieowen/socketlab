
var SocketClient = require( 'socket.io-client' );
var EventEmitter = require( 'events' );

var inherits     = require('inherits');


var LabsClient = function( url, opts )
{
    EventEmitter.call( this );

    // define io here to prevent access

    var io = SocketClient( url, opts );

    io.on( 'connect', function(){

        this.emit( LabsClient.CONNECT )
    }.bind(this) );

    this._disconnect = function(){
        io.disconnect();
    }
};


var createClient = function( url, opts )
{
    return new LabsClient( url, opts );
};


LabsClient.CONNECT = 'labs-connected';
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
    // validate message


};

LabsClient.prototype.point = function( x, y, z ){

};

LabsClient.prototype.disconnect = function(){
    if( this._disconnect ){
        this._disconnect();
    }
};



