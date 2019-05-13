/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import { Mesh, PhysicsBody } from './PhysiMesh.js';
import * as THREE from "../three.module.js";

_make = function( mesh, opt ){
    processGeometry( mesh.geometry );
};

let Body = function( mesh, opt){
    
};

function processGeometry( bufGeometry ) {
        // Ony consider the position values when merging the vertices
        var posOnlyBufGeometry = new THREE.BufferGeometry();
        posOnlyBufGeometry.addAttribute( 'position', bufGeometry.getAttribute( 'position' ) );
        posOnlyBufGeometry.setIndex( bufGeometry.getIndex() );
        // Merge the vertices so the triangle soup is converted to indexed triangles
        var indexedBufferGeom = THREE.BufferGeometryUtils.mergeVertices( posOnlyBufGeometry );
        // Create index arrays mapping the indexed vertices to bufGeometry vertices
        mapIndices( bufGeometry, indexedBufferGeom );
}

let SoftMesh = function( geometry, material, mass, pessure ){
    
    Mesh.call( this, geometry, material, mass );
    _make.call( this, this, { mass: mass, pessure: pessure } );
    
    
    //var volume = new THREE.Mesh( bufferGeom, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
    //volume.frustumCulled = false;
};

SoftMesh.prototype = Object.assign( Object.create( Mesh.prototype ), { 
    constructor : SoftMesh 
}); 

export { SoftMesh, Body as SoftBody }
