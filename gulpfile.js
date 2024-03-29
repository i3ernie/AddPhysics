/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const gulp = require('gulp');
const concat = require('gulp-concat');
const rollupBuild = require('./build/build.es.js');
const rollupImportMapPlugin = require('rollup-plugin-import-map').rollupImportMapPlugin;


gulp.task('packTHREEAddPhysicsModule', function( done ){
 
    rollupBuild( {
        input: 'src/THREEAddPhysics.js',
        plugins: [rollupImportMapPlugin('./import-map.json')],
        external: ['three']
    }, {
        file: 'dist/AddPhysics.m.js',
        exports : 'named',
        format: 'es'
    }, done );
});
gulp.task('packTHREEAddPhysicsAMD', function( done ){
 
    rollupBuild( {
        input: 'src/THREEAddPhysics.js'
    }, {
        file: 'dist/THREEAddPhysics.amd.js',
        exports : 'named',
        format: 'amd'
    }, done );
});

gulp.task('packTHREEAddPhysicsUMD', function( done ){
 
    rollupBuild( {
        input: 'src/THREEAddPhysics.js'
    }, {
        file: 'dist/THREEAddPhysics.js',
        exports : 'named',
        name: 'AddPhysics',
        format: 'umd'
    }, done );
});

gulp.task('packTHREEAddPhysicsCommon', function( done ){
 
    rollupBuild( {
        input: 'src/THREEAddPhysics.js'
    }, {
        file: 'dist/THREEAddPhysics.common.js',
        exports : 'named',
        format: 'cjs'
    }, done );
});

gulp.task('packWorker', function ( done ) {
    return gulp.src([
        "src/worker/globals.js"
        , "src/worker/init.js" 
        , "src/worker/world.js" 
        , "src/worker/Shapes.js" 
        , "src/worker/SoftShape.js" 
        , "src/worker/vehicle.js" 

        , "src/worker/constraints/Constraints.js" 
        , "src/worker/constraints/DOFConstraint.js" 
        , "src/worker/constraints/HingeConstraint.js" 
        , "src/worker/constraints/SliderConstraint.js" 
        , "src/worker/constraints/ConetwistConstraint.js" 
        , "src/worker/constraints/PointConstraint.js" 
])
    .pipe( concat('AddPhysicsWorker.js') )
    .pipe( gulp.dest('./dist/') );
});

gulp.task('packWorkerAmmo', function ( done ) {
    // place code for your default task here
    return gulp.src([
        "src/ammolib.js"
        ,"src/worker/globals.js"
        
        , "src/worker/init.js" 
        , "src/worker/world.js" 
        , "src/worker/Shapes.js" 
        , "src/worker/SoftShape.js" 
        , "src/worker/vehicle.js" 

        , "src/worker/constraints/Constraints.js" 
        , "src/worker/constraints/DOFConstraint.js" 
        , "src/worker/constraints/HingeConstraint.js" 
        , "src/worker/constraints/SliderConstraint.js" 
        , "src/worker/constraints/ConetwistConstraint.js" 
        , "src/worker/constraints/PointConstraint.js" 
])
    .pipe( concat('AddPhysicsWorkerAmmo.js') )
    .pipe( gulp.dest('./dist/') );
});

gulp.task('default', function () {
    // place code for your default task here
});
