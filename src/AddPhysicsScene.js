/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// Physijs.Scene

import * as THREE from './three.module.js';
import { Vehicle } from './PhysicsVehicle.js';
import PhysicsWorld from './AddPhysicsWorld.js';
import AddPhysics from './AddPhysicsGlobals.js';



const  REPORT_ITEMSIZE = 14;
    
    let 
        _temp1, _temp2,
        _temp_vector3_1 = new THREE.Vector3(),
        _temp_vector3_2 = new THREE.Vector3(),
        _temp_matrix4_1 = new THREE.Matrix4(),
        _quaternion_1 = new THREE.Quaternion();


const addObjectChildren = function( parent, object ) {

    for ( let i = 0; i < object.children.length; i++ ) {
            if ( object.children[i]._physijs ) {
                    object.children[i].updateMatrix();
                    object.children[i].updateMatrixWorld();

                    _temp_vector3_1.setFromMatrixPosition( object.children[i].matrixWorld );
                    _quaternion_1.setFromRotationMatrix( object.children[i].matrixWorld );

                    object.children[i]._physijs.position_offset = {
                            x: _temp_vector3_1.x,
                            y: _temp_vector3_1.y,
                            z: _temp_vector3_1.z
                    };

                    object.children[i]._physijs.rotation = {
                            x: _quaternion_1.x,
                            y: _quaternion_1.y,
                            z: _quaternion_1.z,
                            w: _quaternion_1.w
                    };

                    parent._physijs.children.push( object.children[i]._physijs );
            }

            addObjectChildren( parent, object.children[i] );
    }
};




        
const Scene = function( params ) {

    THREE.Scene.call( this );
    PhysicsWorld.call( this, this, params );
    this.physicsWorld = this;
	
};

Scene.prototype = Object.assign( Object.create( THREE.Scene.prototype ), PhysicsWorld.prototype, {
    constructor : Scene,
    
    add : function( object ){

       if ( object instanceof Vehicle ) { 
           THREE.Scene.prototype.add.call( this, object.mesh );
           object.world = this;
           this._vehicles[ object._physijs.id ] = object;
           this.execute( 'addVehicle', object._physijs );

       } else {
           THREE.Scene.prototype.add.call( this, object );
       }
    },
    
    remove : function( object ) {
        THREE.Scene.prototype.remove.call( this, object );
        //this.onRemove( object );
    }
});


AddPhysics.updateFunctions._updateScene = function( data ) {
    let num_objects = data[1],
            object, _physijs,
            offset;

    for ( let i = 0; i < num_objects; i++ ) {
            offset = 2 + i * REPORT_ITEMSIZE;
            object = this._objects[ data[ offset ] ];

            if ( object === undefined ) {
                    continue;
            }

            _physijs = object.physicsBody._physijs;

            if ( object.physicsBody.__dirtyPosition === false ) {
                    object.position.set(
                            data[ offset + 1 ],
                            data[ offset + 2 ],
                            data[ offset + 3 ]
                    );
            }

            if ( object.physicsBody.__dirtyRotation === false ) {
                    object.quaternion.set(
                            data[ offset + 4 ],
                            data[ offset + 5 ],
                            data[ offset + 6 ],
                            data[ offset + 7 ]
                    );
            }

            _physijs.linearVelocity.set(
                    data[ offset + 8 ],
                    data[ offset + 9 ],
                    data[ offset + 10 ]
            );

            _physijs.angularVelocity.set(
                    data[ offset + 11 ],
                    data[ offset + 12 ],
                    data[ offset + 13 ]
            );

    }

    if ( AddPhysics.SUPPORT_TRANSFERABLE ) {
            // Give the typed array back to the worker
            this._worker.transferableMessage( data.buffer, [data.buffer] );
    }

    AddPhysics.status._is_simulating = false;
    this.dispatchEvent( {type : 'update'} );
};
        
export default Scene;
