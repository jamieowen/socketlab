var gulp = require( 'gulp' );

var cprocess = require( 'child_process' );


gulp.task( 'watch', function(){
    gulp.watch( 'src/**/*.js', [ 'docker:restart' ] );
});

gulp.task( 'docker:restart', function(){
    cprocess.spawn( 'docker', [ 'exec', 'socketlab', 'npm', 'run', 'restart' ])
});