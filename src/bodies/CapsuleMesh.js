/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import { Mesh, PhysicsBody } from './PhysiMesh.js';
import * as THREE from "../three.module.js";

const _make = function( mesh, opt ){
    
    let geometry = mesh.geometry;

    if ( !geometry.boundingBox ) {
            geometry.computeBoundingBox();
    }

    let width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    let height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
    let depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;

    this._physijs.type = 'capsule';
    this._physijs.radius = Math.max(width / 2, depth / 2);
    this._physijs.height = height;
    this._physijs.mass = (typeof opt.mass === 'undefined') ? width * height * depth : opt.mass;
};

const Body = function( mesh, opt ){
    opt = opt || {};
    PhysicsBody.call( this, mesh, opt );
    _make.call( this, mesh, opt );
};
Body.prototype = Object.assign({}, PhysicsBody.prototype, {
    constructor : Body
});
Body.addPhysics = function( mesh, opt ){
    if ( mesh.parent && mesh.parent instanceof THREE.Scene ) {
        mesh.parent.dispatchEvent({type:"physicsBodyAdded", object:mesh});
    }
};

// Physijs.CapsuleMesh
const CapsuleMesh = function( geometry, material, mass ) {
        
        Mesh.call( this, geometry, material, mass );
        _make.call( this, this, {mass:mass} );
        
        if ( !geometry.boundingBox ) {
                geometry.computeBoundingBox();
        }
};
CapsuleMesh.prototype = Object.create( Mesh.prototype );
CapsuleMesh.prototype.constructor = CapsuleMesh;

export { CapsuleMesh, Body as CapsuleBody }

