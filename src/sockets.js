
var socket      = require( 'socket.io' );
var redis       = require( 'redis' );
var socketRedis = require( 'socket.io-redis');
var promise     = require( 'promise' );
var events      = require( './events' );

var SocketManager = function( server, mongo, redisCache, redisPub, redisSub )
{
    this.io = socket( server );

    this.redisCache = redisCache;

    this.mongo = mongo;

    //this.io.adapter( socketRedis({ pubClient: redisPub, subClient: redisSub }) );

    this.io.on( 'connection', function( socket ){

        console.log( 'server - client connected' );

        var id = ( Math.random() * 10000 ).toFixed(2);
        socket.on( events.CONNECT, function( projectId ){

            // returns a session id - this will be passed
            // back and forth - BUT not for production.
            // use cookies for this.

            // could call this from redis cache first.
            mongo.getProject( projectId )
                .then( function( project ){
                    var p = {
                        id: id,
                        name: 'project name',
                        activeSessions: 1,
                        totalSessions: 100
                    };
                    socket.emit( events.CONNECTED, p );
                }, function( error ){

                    socket.emit( events.CONNECT_ERROR, error );
                });


            console.log( '( server ) ', arguments.length, arguments );

            // check project exists ( mongo )
            // check calling client id & auth can access
            // check project active ( redis )

            // set/get project active and increment active sessions
            // active sessions can not be greater than the history size.

            // project entry with next session index data needs to exist.
            // check redis or fetch from mongo.

            // pop/unshift new project session index. & clear existing session data?

            // notify back to client with success
            // project-connected

            // obj.projectId
            // obj.sessionId ( reused )
            // obj.activeSessions =
            // obj.totalSessions = will usually be max unless just started
            // obj.sessionStartTime
            // ** define. some session averages - size(in transfer bytes), time, etc.

        } );

        socket.on( 'project-history-fetch', function(){

            // if not data, get project data & session data ( mongo -> redis )
            // ( would need to set a 'fetch' status when getting data )
            // and use redis pub subs to tell other clients data has arrived
            // if others are requesting data.

            // socket.emit( 'project-history-fetched' );
            // socket.emit( 'project-history-error' );
        });

        socket.on( 'project-message-send', function(){

            // socket.emit( 'project-message-error' ); < sent back only to calling socket

            // socket.emit( 'project-message-receive' ); < sent to all sockets in this project room
            // -sessionId
            // -message
            // -time

        });

        socket.on( 'project-point-send', function(){

            // socket.emit( 'project-point-error' ); < sent back only to calling socket

            // socket.emit( 'project-point-receive' ); < sent to all sockets in this project room
            // -sessionId
            // -point
            // -time

        });

        socket.on( 'disconnect', function( ){
            // disconnect client

        })



    });


};

var create = function( server, redisCache, redisPub, redisSub ){

    var manager = new SocketManager( server, redisCache, redisPub, redisSub );
    return manager;

};

module.exports = create;

SocketManager.prototype = {};


SocketManager.prototype.close = function(){

    //this.io.disconnect();
};

SocketManager.prototype.onConnection = function(){

};


SocketManager.prototype.onHistoryEvent = function(){

};

SocketManager.prototype.onConnection = function(){

};





