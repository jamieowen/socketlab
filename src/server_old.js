//var express = require('express');
//var app     = express();
//var server  = require('http').Server(app);
//var io      = require('socket.io')(server);
var redis   = require( 'redis' );

var express = require('express');
var app     = express();
var server  = app.listen(8080);
var io      = require('socket.io').listen(server);

var client = redis.createClient( '6379', 'redis' );

app.get('/', function (req, res) {
    res.sendfile( 'src/index.html' );
});

io.on('connection', function (socket) {

    socket.emit('news', { hello: 'world' });

    socket.on('my other event', function (data) {
    });

    socket.on( 'startCapture', function( clientId, projectId ){

        console.log( 'startCapture :', clientId, projectId );

        client.get( clientId + ':' + projectId, function(err, reply) {
            // reply is null when the key is missing
            console.log( 'check', err, reply );

        });
    });

});


/**

 Models - outline.

 User
 - id, name, email, emailVerified, clientId, clientSecret( OAuth )

 Project
 - id, userId, name, description, domain,
 - nextEntryIndex, maxEntries, maxKeys, maxKeySize

 ProjectKey
 - projectId,

 projectId:entryIndex:config[ 'sessionStart' ] = value
 projectId:entryIndex:config[ 'sessionEnd' ]   = value

 projectId:entryIndex:keys:key_name:[ time,value,time,value,time,value ]


 */

//app.use( express.static('src/client') );

/**
app.get('/info', function (req, res, next){

    client.incr( 'counter', function(err, counter ) {

        if(err) return next(err);
        //res.send('This page has been viewed ' + counter + ' times!');

        var json = {
            redis: {
                name: process.env.REDIS_NAME,
                address: process.env.REDIS_PORT_6379_TCP_ADDR,
                port: process.env.REDIS_PORT_6379_TCP_PORT,
                dir: __dirname,
                cwd: process.cwd()
            },

            count: counter
        };

        res.set( {
            'Content-Type':'application/json'
        });
        res.send( JSON.stringify(json) );

    });

});**/

