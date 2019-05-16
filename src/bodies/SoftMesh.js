/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

'use strict';

import { Mesh, PhysicsBody } from './PhysiMesh.js';
import * as THREE from "../three.module.js";
import BufferGeometryUtils from "../utils/BufferGeometryUtils.js"

let _make = function( mesh, opt ){
    let obj = processGeometry( mesh.geometry );
    
    this._physijs.type = 'soft';
    this._physijs.ammoVertices = obj.ammoVertices;
    this._physijs.ammoIndices = obj.ammoIndices;
    this._physijs.ammoIndexAssociation = obj.ammoIndexAssociation; 
    this._physijs.mass = opt.mass;
    this._physijs.pressure = opt.pressure;
};

let Body = function( mesh, opt){
    
};

function isEqual( x1, y1, z1, x2, y2, z2 ) {
        var delta = 0.000001;
        return Math.abs( x2 - x1 ) < delta &&
                        Math.abs( y2 - y1 ) < delta &&
                        Math.abs( z2 - z1 ) < delta;
}

function processGeometry( bufGeometry ) {
    // Ony consider the position values when merging the vertices
    var posOnlyBufGeometry = new THREE.BufferGeometry();
    posOnlyBufGeometry.addAttribute( 'position', bufGeometry.getAttribute( 'position' ) );
    posOnlyBufGeometry.setIndex( bufGeometry.getIndex() );
    // Merge the vertices so the triangle soup is converted to indexed triangles
    var indexedBufferGeom = BufferGeometryUtils.mergeVertices( posOnlyBufGeometry );
    // Create index arrays mapping the indexed vertices to bufGeometry vertices
    let ret = mapIndices( bufGeometry, indexedBufferGeom );
    return ret;
}

    function mapIndices( bufGeometry, indexedBufferGeom ) {
            // Creates ammoVertices, ammoIndices and ammoIndexAssociation in bufGeometry
            let ret = {};
            var vertices = bufGeometry.attributes.position.array;
            var idxVertices = indexedBufferGeom.attributes.position.array;
            var indices = indexedBufferGeom.index.array;
            var numIdxVertices = idxVertices.length / 3;
            var numVertices = vertices.length / 3;
           
            ret.ammoVertices = idxVertices;
            ret.ammoIndices = indices;
            ret.ammoIndexAssociation = [];
            
            for ( let i = 0; i < numIdxVertices; i ++ ) {
                var association = [];
                ret.ammoIndexAssociation.push( association );
                var i3 = i * 3;
                for ( let j = 0; j < numVertices; j ++ ) {
                    var j3 = j * 3;
                    if ( isEqual( idxVertices[ i3 ], idxVertices[ i3 + 1 ], idxVertices[ i3 + 2 ],
                            vertices[ j3 ], vertices[ j3 + 1 ], vertices[ j3 + 2 ] ) ) {
                            association.push( j3 );
                    }
                }
            }
        return ret;
    }

let SoftMesh = function( geometry, material, mass, pressure ){
    
    Mesh.call( this, geometry, material, mass );
    _make.call( this, this, { mass: mass, pressure: pressure } );
    
    
    //var volume = new THREE.Mesh( bufferGeom, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
    //volume.frustumCulled = false;
};

SoftMesh.prototype = Object.assign( Object.create( Mesh.prototype ), { 
    constructor : SoftMesh 
}); 

export { SoftMesh, Body as SoftBody }
