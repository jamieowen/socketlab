
var socket = require( 'socket.io' );

var SocketManager = function( server )
{
    this.io = socket.listen( server );

    this.io.on( 'connection', function(){
        console.log( 'connected' );
    })
};

var create = function( server ){

    var manager = new SocketManager( server );
    return manager;

};

module.exports = create;