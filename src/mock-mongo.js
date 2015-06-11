
var promise = require( 'promise' );

var MongoManager = function(){

};


var create = function(){
    var mongo = new MongoManager();
    return mongo;
};

var fakeProjectSchema = function( id ){
    return {
        id: id,
        owner: 'XX',
        name: 'Project Name',

        // saves the last used session index.
        // as we store all session data in redis
        lastSessionIndex: 0,

        maxSessionHistory: 10,
        maxKeyNames: 3,
        maxMessageKeyValues: 1000,
        maxPointKeyValues: 1000
    }
};

module.exports = create;


MongoManager.prototype = {

    getProject: function( projectId ){

        return new Promise( function( resolve, reject ) {
            setTimeout( function(){
                if( projectId === '655321' ){
                    resolve( fakeProjectSchema(projectId) );
                }else{
                    reject( 'No project exists.' );
                }
            }, 500 );

        })
    },

    startSession: function( projectId ){

    },

    endSession: function( projectId ){

    }

};



