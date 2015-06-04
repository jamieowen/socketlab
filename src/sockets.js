
var socket = require( 'socket.io' );

var SocketManager = function( server )
{
    this.io = socket( server );

    this.io.on( 'connection', function( socket ){

        console.log( 'server - client connected' );

        // events

        // project-connect ->
        // project-connected <-
        // project-connect-error <-

        // project-history-fetch ->
        // project-history-fetched <-
        // project-history-error <-

        // project-message-send ->
        // project-message-receive <-
        // project-message-error <-

        // project-point-send ->
        // project-point-receive <-
        // project-point-error <-

        // project-disconnect ?


        socket.on( 'project-connect', function( data ){

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

var create = function( server ){

    var manager = new SocketManager( server );
    return manager;

};

module.exports = create;

SocketManager.prototype = {};


SocketManager.prototype.close = function(){

    //this.io.disconnect();
};