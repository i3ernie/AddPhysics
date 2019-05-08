/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import { Mesh, PhysicsBody } from './PhysiMesh.js';
import * as THREE from "../three.module.js";

const _make = function( mesh, opt ){
    let geometry = mesh.geometry;
    
    this._physijs.type   = 'heightfield';
    this._physijs.xsize  = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    this._physijs.ysize  = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
    this._physijs.xpts = (typeof opt.xdiv === 'undefined') ? Math.sqrt(geometry.vertices.length) : opt.xdiv + 1;
    this._physijs.ypts = (typeof opt.ydiv === 'undefined') ? Math.sqrt(geometry.vertices.length) : opt.ydiv + 1;
    // note - this assumes our plane geometry is square, unless we pass in specific xdiv and ydiv
    this._physijs.absMaxHeight = Math.max(geometry.boundingBox.max.z,Math.abs(geometry.boundingBox.min.z));

    var points = [];

    let a, b;
    for ( let i = 0; i < geometry.vertices.length; i++ ) {

            a = i % this._physijs.xpts;
            b = Math.round( ( i / this._physijs.xpts ) - ( (i % this._physijs.xpts) / this._physijs.xpts ) );
            points[i] = geometry.vertices[ a + ( ( this._physijs.ypts - b - 1 ) * this._physijs.ypts ) ].z;

            //points[i] = geometry.vertices[i];
    }

    this._physijs.points = points;
};

const Body = function( mesh, opt ){
    PhysicsBody.call( this, mesh, opt );
    _make.call( this, mesh, opt );
};
Body.prototype = Object.assign({}, PhysicsBody.prototype, {
    constructor : Body
});

Body.addPhysics = function( mesh, opt ){
    mesh.physicsBody = new Body( mesh, opt );
};

// Physijs.HeightfieldMesh
const HeightfieldMesh = function ( geometry, material, mass, xdiv, ydiv) {

    Mesh.call( this, geometry, material, mass );
    _make.call( this, this, { mass: mass, xdiv:xdiv, ydiv:ydiv } );
        
};
HeightfieldMesh.prototype = Object.create( Mesh.prototype );
HeightfieldMesh.prototype.constructor = HeightfieldMesh;

export { HeightfieldMesh, Body as HeightfieldBody }


