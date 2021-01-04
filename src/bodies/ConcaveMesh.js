/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import { Mesh, PhysicsBody } from './PhysiMesh.js';

// Physijs.ConcaveMesh
let ConcaveMesh = function( geometry, material, mass ) {
        var i,
                width, height, depth,
                vertices, face, triangles = [];

        Mesh.call( this, geometry, material, mass );

        if ( !geometry.boundingBox ) {
                geometry.computeBoundingBox();
        }

        vertices = geometry.vertices;

        for ( i = 0; i < geometry.faces.length; i++ ) {
                face = geometry.faces[i];
                if ( face.d ) {

                        triangles.push([
                                { x: vertices[face.a].x, y: vertices[face.a].y, z: vertices[face.a].z },
                                { x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
                                { x: vertices[face.d].x, y: vertices[face.d].y, z: vertices[face.d].z }
                        ]);
                        triangles.push([
                                { x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
                                { x: vertices[face.c].x, y: vertices[face.c].y, z: vertices[face.c].z },
                                { x: vertices[face.d].x, y: vertices[face.d].y, z: vertices[face.d].z }
                        ]);

                }
                else if ( face.c ) {

                        triangles.push([
                                { x: vertices[face.a].x, y: vertices[face.a].y, z: vertices[face.a].z },
                                { x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
                                { x: vertices[face.c].x, y: vertices[face.c].y, z: vertices[face.c].z }
                        ]);

                } 
        }

        width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
        depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;

        this._physijs.type = 'concave';
        this._physijs.triangles = triangles;
        this._physijs.mass = (typeof mass === 'undefined') ? width * height * depth : mass;
};
ConcaveMesh.prototype = Object.assign( Object.create( Mesh.prototype ), {
        constructor : ConcaveMesh
});

export { ConcaveMesh }