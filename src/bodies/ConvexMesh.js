/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import { Mesh, PhysicsBody } from './PhysiMesh.js';

const _make = function( mesh, opt ){
    
    let points = [];
    const geometry =  mesh.geometry;
    const vertices = geometry.attributes.position.array;

    for ( let i = 0; i < vertices.length; i+=3 ) {
        points.push({
                x: vertices[i],
                y: vertices[i+1],
                z: vertices[i+2]
        });
    }

    const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    const height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
    const depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;

    this._physijs.type = 'convex';
    this._physijs.points = points;
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


// Physijs.ConvexMesh
const ConvexMesh = function( geometry, material, mass ) {

    Mesh.call( this, geometry, material, mass );
    _make.call( this, this, { mass: mass } );

};
ConvexMesh.prototype = Object.assign( Object.create( Mesh.prototype ), {
    constructor : ConvexMesh
});

export { ConvexMesh, Body as ConvexBody }