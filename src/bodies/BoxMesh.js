/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// Physijs.BoxMesh

import { Mesh, PhysicsBody } from './PhysiMesh.js';
import * as THREE from "../three.module.js";

const _make = function( mesh, opt ){
    let geometry = mesh.geometry;

    let width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    let height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
    let depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;


    this._physijs.type = 'box';
    this._physijs.width = width;
    this._physijs.height = height;
    this._physijs.depth = depth;
    this._physijs.mass = (typeof opt.mass === 'undefined') ? width * height * depth : opt.mass;
};

const Body = function( mesh, opt ) {
    opt = opt || {};
    PhysicsBody.call( this, mesh, opt );
    _make.call( this, mesh, opt );
    
};
Body.prototype = Object.assign({}, PhysicsBody.prototype, {
    constructor : Body
});

Body.addPhysics = function( mesh, opt ){
    mesh.physicsBody = new Body( mesh, opt );
};


let BoxMesh = function( geometry, material, mass ) {

    Mesh.call( this, geometry, material, mass );
    _make.call( this, this, {mass:mass} );
   
};

BoxMesh.prototype = Object.assign( Object.create( Mesh.prototype ), { 
    constructor : BoxMesh 
}); 

export default BoxMesh;
export { BoxMesh, Body as BoxBody }
