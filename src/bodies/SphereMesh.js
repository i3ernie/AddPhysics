/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import { Mesh, PhysicsBody } from './PhysiMesh.js';

const _make = function( mesh, opt ){
    const geometry = mesh.geometry;
    
    if ( !geometry.boundingSphere ) {
        geometry.computeBoundingSphere();
    }
    _volume.call( this, mesh, opt );

    this._physijs.type = 'sphere';
    this._physijs.radius = geometry.boundingSphere.radius;
    this._physijs.mass = (typeof opt.mass === 'undefined') ? this._physijs.volume : opt.mass;
};

const _volume = function( mesh, opt ){
    const geometry = mesh.geometry;
    this._physijs.volume = (4/3) * Math.PI * Math.pow( geometry.boundingSphere.radius, 3 );
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
    PhysicsBody.add( Body, mesh, opt );
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
