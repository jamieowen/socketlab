var express = require('express');
var app     = express();

var redis   = require( 'redis' );

var client = redis.createClient( '6379', 'redis' );

app.get('/', function (req, res, next){

    client.incr( 'counter', function(err, counter ) {
        
        if(err) return next(err);
        //res.send('This page has been viewed ' + counter + ' times!');

        var json = {
            redis: {
                name: process.env.REDIS_NAME,
                address: process.env.REDIS_PORT_6379_TCP_ADDR,
                port: process.env.REDIS_PORT_6379_TCP_PORT
            },

            count: counter
        };

        res.send( JSON.stringify(json) );

    });

});

 
app.listen(8080);