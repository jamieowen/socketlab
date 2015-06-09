
var test        = require( 'tape' );

/**
 Server side..
 */

var fakeRedis   = require( 'fakeredis' );
var http        = require( 'http' );
var server      = http.createServer();

// fake redis clients.
var redisCache  = fakeRedis.createClient( 'cache' );
var redisPub    = fakeRedis.createClient( 'pubscribe' );
var redisSub    = fakeRedis.createClient( 'subscribe' );

var mongo       = require( '../src/mock-mongo' )();

var socketManager = require( '../src/sockets' )(server,mongo,redisCache,redisPub,redisSub);

server.listen(0);
/**
 Client side..
 */

var LabsClient = require( '../src/client' );

var beforeTest = function( t, beginTest ){

    // create some fake lab clients.
    console.log( 'setup test..' );
    t.comment( 'setting up clients..' );

    var opts = {
        transports: ['websocket'],
        forceNew: true
    };
    var address = 'http://localhost:' +    server.address().port;
    var projectId = 655321;

    var client1 = LabsClient( address, projectId, opts );
    var client2 = LabsClient( address, projectId, opts );

    client1.on( LabsClient.CONNECTED, function(){

        t.comment( 'client 1 connected.' );
        client2.on( LabsClient.CONNECTED, function(){

            t.comment( 'client 2 connected.' );

            console.log( 'begin test..' );
            beginTest( [ client1, client2 ], function( endTest ){

                // After Test..
                client1.disconnect();
                client2.disconnect();

                endTest();
            });
        });
    });

};

test( 'test basic connection', function(t){

    beforeTest( t, function( clients, afterTest ){

        t.comment( 'during test..' );

        afterTest( function(){

            t.comment( 'finalise test - close server ');

            socketManager.close();
            server.close();

            console.log( 'close' );
            t.end();

        })
    });

} );

