
var socket      = require( 'socket.io' );
var redis       = require( 'redis' );
var socketRedis = require( 'socket.io-redis');
var promise     = require( 'promise' );
var events      = require( './events' );

var SocketManager = function(
    server,
    sessionMiddleware,
    mongo,
    redis,
    redisPub,
    redisSub )
{

    this.redis = redis;
    this.mongo = mongo;

    this.io = socket( server );

    this.io.use(function(socket, next){
        sessionMiddleware(socket.request, {}, next);
    });

    //this.io.adapter( socketRedis({ pubClient: redisPub, subClient: redisSub }) );

    this.io.on( 'connection', function( socket ){

        var serverSessionID = socket.request.sessionID;

        console.log( '(server) client connected', serverSessionID );

        // -----------
        // DISCONNECT

        // > Handle disconnect first - this is important to clear cache.

        socket.on( 'disconnect', function(){

            // > Fetch the redis data associated with the disconnecting serverSession id.
            redis.get( 'server-session:projectID:' + serverSessionID, function( err, projectID ){

                // delete the session key
                redis.del( 'server-session:projectID:' + serverSessionID );
                // todo: we would also save any session data to mongo here?
                // todo: or do we wait for all connections to close? ( poss depends on history size )

                if( projectID ){

                    // > Decrement connection count.
                    redis.decr( 'project:numConnections:' + projectID, function( err, numConnections ){

                        if( numConnections === 0 ){

                            // > Clear up cache if this is the last remaining project session.
                            redis.multi()
                                .del( 'project:numConnections:' + projectID )
                                .del( 'project:data-hash:' + projectID )
                                .del( 'project:sessionIndex:' + projectID ) // need to save this to lastSessionIndex

                                // delete other keys...
                                .exec( function( err, res ){

                                    if( res[0] === 0 ){
                                        console.log( 'problem deleting keys' );
                                    }else{
                                        console.log( 'Last project session (' + projectID + ') : Cleaning up project data.' );
                                    }

                                    redis.keys( '*', function( err, res ){
                                        console.log( 'REMAINING KEYS:', res );
                                    } );

                                });
                        }else
                        if( err ){

                            // error should not happen here.
                            // - probably should log it.
                            console.log( 'Disconnect : Error...' );
                        }

                    } );
                }else{
                    // most likely no project id - do nothing
                }
            })

        });

        // -----------
        // CONNECT

        socket.on( events.SESSION_CONNECT, function( projectID ){

            var onConnectError = function( error ){
                socket.emit( events.SESSION_CONNECT_ERROR, error );
            };

            if( !projectID || typeof projectID !== 'string' ){
                onConnectError( 'Not a valid projectID.' );
                return;
            }

            // > Query mongo and check if project exists.
            // todo : This could be speedier by caching project ids in redis.

            mongo.getProject( projectID ).then( function( project ){

                // > Project exists so :
                // Map session id to project id.
                // Increment the project session/active sessions.
                // Store necessary project data.
                // Emit CONNECTED event back to client.

                redis.multi()
                    .incr( 'project:numConnections:' + projectID )
                    .set( 'server-session:projectID:' + serverSessionID, projectID )
                    //.hset( 'project-session:hash:' + pSessionID, projectID )
                    .exec( function( err, res ){

                        if( res ){

                            var numConnections = res[0];
                            project.connectionOrder = numConnections; // debug

                            if( numConnections === 1 ){

                                // > First session on project - cache project data
                                redis.hmset( 'project:data-hash:' + projectID, {
                                        'lastSessionIndex': project.lastSessionIndex,
                                        'maxSessionHistory': project.maxSessionHistory },
                                    function( err, res ){
                                        if( res ){
                                            project.firstSession = true;
                                            socket.emit( events.SESSION_CONNECTED, project );
                                        }else{
                                            onConnectError( 'Problem initialising first session.' );
                                        }
                                    }
                                );

                            }else{
                                // > Otherwise we don't need anything until start event.
                                socket.emit( events.SESSION_CONNECTED, project );
                                // todo: emit an 'info' object for session count?
                            }

                        }else{
                            onConnectError( 'Problem activating session.' );
                        }
                    });

            }, function(error){
                onConnectError( 'Problem fetching project from db : ' + error );
            } );

        } );


        // -----------
        // START SESSION

        socket.on( events.SESSION_START, function(){

            console.log( '(server) session start ', serverSessionID );

            var onSessionStartError = function( error ){
                socket.emit( events.SESSION_START_ERROR, error );
            };

            // TODO : This is probably not needed - we could store the validated projectID
            // TODO: in the scope of this socket connection. As this is not a http request.
            redis.get( 'server-session:projectID:' + serverSessionID, function( err, projectID ){

                if( projectID ){

                    // > Fetch available index.
                    redis.multi()
                        .hgetall( 'project:data-hash:' + projectID )
                        .incr( 'project:sessionIndex:' + projectID )
                        .exec( function( err, res ){

                            if( res ){
                                var projectData = res[0];
                                var maxSessionHistory = parseInt( projectData['maxSessionHistory'] );
                                var sessionIndex = res[1] % maxSessionHistory;

                                console.log( 'session index : ', sessionIndex );
                                console.log( 'session in %  : ', maxSessionHistory );

                                socket.emit( events.SESSION_STARTED, sessionIndex );

                            }else{
                                onSessionStartError( 'Couldnt find project' );
                            }

                        })

                }else{
                    onSessionStartError( 'No project mapped to serverSessionID' );
                }

            })
        });


        // -----------
        // SEND MESSAGE


        // -----------
        // END SESSION

        socket.on( events.SESSION_END, function(){

            console.log( 'SESSION END' );

            socket.emit( events.SESSION_ENDED );
        });


        // -----------
        // HISTORY

        socket.on( events.HISTORY_FETCH, function(){

        });



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


