/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import { Mesh, PhysicsBody } from './PhysiMesh.js';

const _make = function( mesh, opt ){
    let geometry = mesh.geometry;

    if ( !geometry.boundingBox ) {
            geometry.computeBoundingBox();
    }

    let width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    let height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
    let depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;

    this._physijs.type = 'cylinder';
    this._physijs.width = width;
    this._physijs.height = height;
    this._physijs.depth = depth;
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
    mesh.physicsBody = new Body( mesh, opt );
    if ( mesh.parent && mesh.parent.type === "Scene" ) { 
        mesh.parent.dispatchEvent({type:"physicsBodyAdded", object:mesh});
    }
};


// Physijs.CylinderMesh
let CylinderMesh = function( geometry, material, mass ) {
        
        Mesh.call( this, geometry, material, mass );
        _make.call( this, this, { mass: mass } );
};
CylinderMesh.prototype = Object.create( Mesh.prototype );
CylinderMesh.prototype.constructor = CylinderMesh;

export { CylinderMesh, Body as CylinderBody }
