
var test        = require( 'tape' );

/**
 Server side..
 */

var fakeRedis   = require( 'fakeredis' );
var http        = require( 'http' );
var express     = require( '../src/express' )();
var server      = http.createServer( express.app );
server.listen(0);

// fake redis clients.
var redisCache  = fakeRedis.createClient( 'cache' );
var redisPub    = fakeRedis.createClient( 'pubscribe' );
var redisSub    = fakeRedis.createClient( 'subscribe' );

var mongo       = require( '../src/mock-mongo' )();

var socketManager = require( '../src/sockets' )(
    server,
    express.sessionMiddleware,
    mongo,
    redisCache,redisPub,redisSub);


/**
 Client side..
 */

var Client = require( '../src/client' );

var beforeTest = function( t, opts, beginTest ){

    // create some fake lab clients.
    t.comment( 'setting up clients..' );

    opts = opts || {};

    var numClients = opts.numClients || 2;

    var socketOpts = {
        transports: ['websocket'],
        forceNew: true
    };

    var address = 'http://localhost:' +    server.address().port;
    var projectId = '655321';

    var clients = [];
    var connected = 0;

    var onClientConnected = function(){
        connected++;
        console.log( '(test setup) client ' + clients.indexOf(this) + ' connected.' );

        if( connected >= numClients ){
            beginTest( clients.slice(0), function( killServer ){
                // After Test..
                var client;
                while( clients.length ){
                    client = clients.pop();
                    client.disconnect();
                }

                if( killServer ){

                    t.comment( 'finalise all tests - kill server ');
                    socketManager.close();
                    server.close();
                }
            });
        }
    };

    var onClientError = function(){
        throw new Error( 'Unhandled error' );
    };

    var client;
    for( var i = 0; i<numClients; i++ ){
        client = new Client( address, projectId, socketOpts );
        clients.push( client );
        client.on( Client.CONNECTED, onClientConnected.bind(client) );
        client.on( Client.ERROR, onClientError.bind(client) );
    }

};

test( 'test basic connection', function(t){

    beforeTest( t, { numClients: 2 }, function( clients, done ){

        var client1 = clients[0];
        var client2 = clients[1];

        t.equals( client1.connected, true, 'client 1 connected' );
        t.equals( client2.connected, true, 'client 2 connected' );

        done( false );

        t.equals( client1.connected, false, 'client 1 disconnected' );
        t.equals( client2.connected, false, 'client 2 disconnected' );

        t.end();
    });

} );


test( 'test start/end session events', function(t){

    beforeTest( t, { numClients: 2 }, function( clients, done ){

        var client1 = clients[0];
        var client2 = clients[1];

        var clientsStarted = clients.slice(0);

        var clientStarted = function(){
            clientsStarted.pop();
            if( clientsStarted.length === 0 ){
                endClients();
            }
        };

        client1.on( Client.STARTED, function( sessionIndex ){
            t.equals( client1.started, true, 'Test client1 started.' );
            clientStarted();
        } );

        client2.on( Client.STARTED, function( sessionIndex ){
            t.equals( client2.started, true, 'Test client2 started.' );
            clientStarted();
        });

        client1.start();
        client2.start();

        var clientsEnded = clients.slice(0);

        var clientEnded = function(){
            clientsEnded.pop();
            if( clientsEnded.length === 0 ){
                done( true );
                t.end();
            }
        };

        var endClients = function(){

            client1.on( Client.ENDED, function( sessionIndex ){
                t.equals( client1.started, false, 'Test client1 ended.' );
                clientEnded();
            } );

            client2.on( Client.ENDED, function( sessionIndex ){
                t.equals( client2.started, false, 'Test client2 ended.' );
                clientEnded();
            });

            client1.end();
            client2.end();

        }

    });

} );