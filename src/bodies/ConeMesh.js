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

    this._physijs.type = 'cone';
    this._physijs.radius = width / 2;
    this._physijs.height = height;
    this._physijs.mass = (typeof opt.mass === 'undefined') ? width * height : opt.mass;
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
    if ( mesh.parent && mesh.parent.type ==="Scene" ) {
        mesh.parent.dispatchEvent({type:"physicsBodyAdded", object:mesh});
    }
};

// Physijs.ConeMesh
let ConeMesh = function( geometry, material, mass ) {
        
        Mesh.call( this, geometry, material, mass );
        _make.call( this, this, { mass: mass } );
};
ConeMesh.prototype = Object.assign( Object.create( Mesh.prototype ), {
    constructor : ConeMesh
});

export default ConeMesh;
export { ConeMesh, Body as ConeBody };
