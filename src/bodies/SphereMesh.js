/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import { Mesh, PhysicsBody } from './PhysiMesh.js';
import * as THREE from "../three.module.js";

const _make = function( mesh, opt ){
    let geometry = mesh.geometry;
    if ( !geometry.boundingSphere ) {
        geometry.computeBoundingSphere();
    }

    this._physijs.type = 'sphere';
    this._physijs.radius = geometry.boundingSphere.radius;
    this._physijs.mass = (typeof opt.mass === 'undefined') ? (4/3) * Math.PI * Math.pow(this._physijs.radius, 3) : opt.mass;
};

const Body = function( mesh, opt ){    
    opt = opt || {};
    PhysicsBody.call( this, mesh, opt );
    _make.call( this, mesh, opt );
};

Body.prototype = Object.assign( {}, PhysicsBody.prototype, {
    constructor : Body
});

Body.addPhysics = function( mesh, opt ){
    mesh.physicsBody = new Body( mesh, opt );
    if ( mesh.parent && mesh.parent instanceof THREE.Scene ) {
        mesh.parent.dispatchEvent({type:"physicsBodyAdded", object:mesh});
    }
};

// Physijs.SphereMesh
const SphereMesh = function( geometry, material, mass ) {
        Mesh.call( this, geometry, material, mass );
        _make.call( this, this, { mass: mass } );
};

SphereMesh.prototype = Object.assign( Object.create( Mesh.prototype ), {
    constructor : SphereMesh
});

export { SphereMesh, Body as SphereBody }
