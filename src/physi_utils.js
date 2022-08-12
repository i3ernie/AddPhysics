/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import * as THREE from "three";

let _temp_matrix4_1 = new THREE.Matrix4(); 
let _temp_vector3_1 = new THREE.Vector3(); 
let _temp_vector3_2 = new THREE.Vector3();

// returns a unique ID for a Physijs mesh object
let getObjectId = (function() {
        var _id = 1;
        return function() {
                return _id++;
        };
})();
        
let getEulerXYZFromQuaternion = function ( x, y, z, w ) {
        return new THREE.Vector3(
                Math.atan2( 2 * ( x * w - y * z ), ( w * w - x * x - y * y + z * z ) ),
                Math.asin( 2 *  ( x * z + y * w ) ),
                Math.atan2( 2 * ( z * w - x * y ), ( w * w + x * x - y * y - z * z ) )
        );
};
// Converts a world-space position to object-space
let convertWorldPositionToObject = function( position, object ) {
        _temp_matrix4_1.identity(); // reset temp matrix

        // Set the temp matrix's rotation to the object's rotation
        _temp_matrix4_1.identity().makeRotationFromQuaternion( object.quaternion );

        // Invert rotation matrix in order to "unrotate" a point back to object space
        _temp_matrix4_1.invert( _temp_matrix4_1 );

        // Yay! Temp vars!
        _temp_vector3_1.copy( position );
        _temp_vector3_2.copy( object.position );

        // Apply the rotation

        return _temp_vector3_1.sub( _temp_vector3_2 ).applyMatrix4( _temp_matrix4_1 );
};

let getQuatertionFromEuler = function( x, y, z ) {
		var c1, s1, c2, s2, c3, s3, c1c2, s1s2;
		c1 = Math.cos( y  );
		s1 = Math.sin( y  );
		c2 = Math.cos( -z );
		s2 = Math.sin( -z );
		c3 = Math.cos( x  );
		s3 = Math.sin( x  );

		c1c2 = c1 * c2;
		s1s2 = s1 * s2;

		return {
			w: c1c2 * c3  - s1s2 * s3,
			x: c1c2 * s3  + s1s2 * c3,
			y: s1 * c2 * c3 + c1 * s2 * s3,
			z: c1 * s2 * c3 - s1 * c2 * s3
		};
	};

export { getObjectId, getEulerXYZFromQuaternion, convertWorldPositionToObject, getQuatertionFromEuler };