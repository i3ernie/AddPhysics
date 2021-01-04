import Stats from "../stats.module.js";

let render_stats = new Stats();
render_stats.domElement.style.position = 'absolute';
render_stats.domElement.style.top = '0px';
render_stats.domElement.style.zIndex = 100;

let physics_stats = new Stats();
physics_stats.domElement.style.position = 'absolute';
physics_stats.domElement.style.top = '50px';
physics_stats.domElement.style.zIndex = 100;
document.getElementById( 'viewport' ).appendChild( physics_stats.domElement );

export { render_stats, physics_stats };