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

    this._physijs.type = 'plane';
    this._physijs.normal = geometry.faces[0].normal.clone();
    this._physijs.mass = (typeof opt.mass === 'undefined') ? width * height : opt.mass;
};

const Body = function( mesh, opt ){
    opt = opt || {};
    PhysicsBody.call( this, mesh, opt );
    _make.call( this, mesh, opt );
};
Body.prototype = Object.assign( Object.create( PhysicsBody.prototype ), {
    constructor : Body
});

Body.addPhysics = function( mesh, opt ) {
    opt = opt || {};
    PhysicsBody.call( this, mesh, opt );
    _make.call( this, mesh, opt );
    
};

// Physijs.PlaneMesh
class PlaneMesh extends Mesh {
    constructor ( geometry, material, mass ) {
        super( geometry, material, mass );
        _make.call( this, this, { mass: mass } );
    }
};

export { PlaneMesh, Body as PlaneBody }