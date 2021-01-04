/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// Physijs.BoxMesh

import { Mesh, PhysicsBody } from './PhysiMesh.js';

const _make = function( mesh, opt ){
    
    this._physijs.type = 'box';
    _volume.call( this, mesh, opt );
    this._physijs.mass = (typeof opt.mass === 'undefined') ? this._physijs.volume : opt.mass;
};

const _volume = function( mesh, opt ){
    let geometry = mesh.geometry;

    let width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    let height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
    let depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;
    
    this._physijs.width = width;
    this._physijs.height = height;
    this._physijs.depth = depth;
    
    this._physijs.volume = ( typeof opt.volume === 'number' ) ? opt.volume : width * height * depth;
};

const Body = function( mesh, opt ) {
    opt = Object.assign( {}, mesh.userData.physics, opt );
    PhysicsBody.call( this, mesh, opt );
    _make.call( this, mesh, opt );    
};

Body.prototype = Object.assign( Object.create( PhysicsBody.prototype ), {
    constructor : Body
});

Body.addPhysics = function( mesh, opt ){
    PhysicsBody.add( Body, mesh, opt );
};

const BoxMesh = function( geometry, material, mass ) {

    Mesh.call( this, geometry, material, mass );
    _make.call( this, this, {mass:mass} );
   
};

BoxMesh.prototype = Object.assign( Object.create( Mesh.prototype ), { 
    constructor : BoxMesh 
}); 

export default BoxMesh;
export { BoxMesh, Body as BoxBody }