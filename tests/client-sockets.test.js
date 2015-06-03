
var test        = require( 'tape' );
//var colorize    = require('tap-colorize');

//test = test.createStream().pipe(colorize()).pipe(process.stdout);

var http = require( 'http' );

var server = http.createServer().listen(0);
var socketManager = require( '../src/sockets' )(server);

var LabsClient = require( '../src/client' );

var beforeTest = function( t, beginTest ){

    // create some fake lab clients.
    t.comment( 'setting up clients..' );
    var opts = {
        transports: ['websocket'],
        forceNew: true
    };
    var address = 'http://localhost:' + server.address().port;

    var client1 = LabsClient( address, opts );
    var client2 = LabsClient( address, opts );

    client1.on( LabsClient.CONNECT, function(){
        client2.on( LabsClient.CONNECT, function(){

            // after each.
            beginTest( function( endTest ){

                client1.disconnect();
                client2.disconnect();

                endTest();
            });
        });
    });

};

test( 'test basic connection', function(t){

    beforeTest( t, function( afterTest ){



        afterTest( function(){

            server.close();
            t.end();

        })
    });


} );

