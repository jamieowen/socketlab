
var promise = require( 'promise' );

var MongoManager = function(){

};


var create = function(){
    var mongo = new MongoManager();
    return mongo;
};


module.exports = create;


MongoManager.prototype = {

    getProject: function( projectId ){

        return new Promise( function( resolve, reject ) {

            setTimeout( function(){
                if( projectId === 655321 ){
                    resolve();
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



