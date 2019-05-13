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

    function mapIndices( bufGeometry, indexedBufferGeom ) {
            // Creates ammoVertices, ammoIndices and ammoIndexAssociation in bufGeometry
            var vertices = bufGeometry.attributes.position.array;
            var idxVertices = indexedBufferGeom.attributes.position.array;
            var indices = indexedBufferGeom.index.array;
            var numIdxVertices = idxVertices.length / 3;
            var numVertices = vertices.length / 3;
            bufGeometry.ammoVertices = idxVertices;
            bufGeometry.ammoIndices = indices;
            bufGeometry.ammoIndexAssociation = [];
            for ( var i = 0; i < numIdxVertices; i ++ ) {
                    var association = [];
                    bufGeometry.ammoIndexAssociation.push( association );
                    var i3 = i * 3;
                    for ( var j = 0; j < numVertices; j ++ ) {
                            var j3 = j * 3;
                            if ( isEqual( idxVertices[ i3 ], idxVertices[ i3 + 1 ], idxVertices[ i3 + 2 ],
                                    vertices[ j3 ], vertices[ j3 + 1 ], vertices[ j3 + 2 ] ) ) {
                                    association.push( j3 );
                            }
                    }
            }
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
