
// set up express and express middleware.
// returns an express app instance ( which is actually a handler for nodes http client )

var express = require( 'express' );
var session = require( 'express-session' );
//var RedisStore = require('connect-redis')(session);

var create = function( redisClient ){

    var app = express();

    var sessionMiddleware = session({
        secret: '123xABCDEF655321',
        //store: null, // set later
        name:'slabs.sid',
        cookie: {
            httpOnly: true, secure: false, maxAge: null
        },
        resave: false,
        rolling: false,
        saveUninitialized: false, // does not set the store uninitialised.
        unset: 'destroy'
    });

    app.use( sessionMiddleware );

    return {
        app: app,
        sessionMiddleware: sessionMiddleware
    };
};

module.exports = create;



