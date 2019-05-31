/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// Physijs.Scene

import * as THREE from './three.module.js';
import { Vehicle } from './PhysicsVehicle.js';

// constants
const MESSAGE_TYPES = {
        WORLDREPORT: 0,
        COLLISIONREPORT: 1,
        VEHICLEREPORT: 2,
        CONSTRAINTREPORT: 3,
        SOFTBODYREPORT :4
};
const  REPORT_ITEMSIZE = 14,
    COLLISIONREPORT_ITEMSIZE = 5,
    VEHICLEREPORT_ITEMSIZE = 9,
    CONSTRAINTREPORT_ITEMSIZE = 6;
    
    let  _is_simulating = false,
        _temp1, _temp2,
        _temp_vector3_1 = new THREE.Vector3(),
        _temp_vector3_2 = new THREE.Vector3(),
        _temp_matrix4_1 = new THREE.Matrix4(),
        _quaternion_1 = new THREE.Quaternion();

let SUPPORT_TRANSFERABLE;

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

const PhysicsWorld = function( scene, params ){
    var self = this;
    
    scene.addEventListener("physicsBodyAdded", function( event ){
        self.onAdd( event.object );
    });
    //remove physicsBody
    scene.addEventListener("physicsBodyRemoved", function( event ){
        self.onRemove( event.object );
    });
    
    this._worker = new Worker( Scene.scripts.worker || 'physijs_worker.js' );
    this._worker.transferableMessage = this._worker.webkitPostMessage || this._worker.postMessage;
    this._materials_ref_counts = {};
    this._objects = {};
    this._vehicles = {};
    this._constraints = {};
    var ab = new ArrayBuffer( 1 );
        this._worker.transferableMessage( ab, [ab] );
        SUPPORT_TRANSFERABLE = ( ab.byteLength === 0 );

        this._worker.onmessage = function ( event ) {
                let _temp;
                let data = event.data;

                if ( data instanceof ArrayBuffer && data.byteLength !== 1 ) { // byteLength === 1 is the worker making a SUPPORT_TRANSFERABLE test
                        data = new Float32Array( data );
                }

                if ( data instanceof Float32Array ) {

                        // transferable object
                        switch ( data[0] ) {
                                case MESSAGE_TYPES.WORLDREPORT:
                                        self._updateScene( data );
                                        break;

                                case MESSAGE_TYPES.COLLISIONREPORT:
                                        self._updateCollisions( data );
                                        break;

                                case MESSAGE_TYPES.VEHICLEREPORT:
                                        self._updateVehicles( data );
                                        break;

                                case MESSAGE_TYPES.CONSTRAINTREPORT:
                                        self._updateConstraints( data );
                                        break;
                        }

                } else {

                        if ( data.cmd ) {

                                // non-transferable object
                                switch ( data.cmd ) {
                                        case 'objectReady':
                                                _temp = data.params;
                                                if ( self._objects[ _temp ] ) {
                                                        self._objects[ _temp ].dispatchEvent( {type : 'ready'} );
                                                }
                                                break;

                                        case 'worldReady':
                                                self.dispatchEvent( {type : 'ready'} );
                                                break;

                                        case 'vehicle':
                                                window.test = data;
                                                break;

                                        default:
                                                // Do nothing, just show the message
                                                console.debug('Received: ' + data.cmd);
                                                console.dir(data.params);
                                                break;
                                }

                        } else {

                                switch ( data[0] ) {
                                        case MESSAGE_TYPES.WORLDREPORT:
                                                self._updateScene( data );
                                                break;

                                        case MESSAGE_TYPES.COLLISIONREPORT:
                                                self._updateCollisions( data );
                                                break;

                                        case MESSAGE_TYPES.VEHICLEREPORT:
                                                self._updateVehicles( data );
                                                break;

                                        case MESSAGE_TYPES.CONSTRAINTREPORT:
                                                self._updateConstraints( data );
                                                break;
                                                
                                        case MESSAGE_TYPES.SOFTBODYREPORT:
                                                self._updateSoftBodies( data );
                                                break;
                                }

                        }

                }
        };


        params = params || {};
        params.ammo = Scene.scripts.ammo || 'ammo.js';
        params.fixedTimeStep = params.fixedTimeStep || 1 / 60;
        params.rateLimit = params.rateLimit || true;
        this.execute( 'init', params );
        if ( params.gravity ) {
            this.execute( 'setGravity', params.gravity );
	}
};

PhysicsWorld.prototype = Object.assign( PhysicsWorld.prototype , THREE.EventDispatcher.prototype, {
    
    onAdd : function( object ) {
      
        if ( object.physicsBody._physijs ) {
            
            let _physijs = object.physicsBody._physijs;

            object.world = this;

            object.physicsBody.__dirtyPosition = false;
            object.physicsBody.__dirtyRotation = false;
            this._objects[_physijs.id] = object;

            if ( object.children.length ) {
                    _physijs.children = [];
                    addObjectChildren( object, object );
            }

            if ( object.material._physijs ) {
                    if ( !this._materials_ref_counts.hasOwnProperty( object.material._physijs.id ) ) {
                            this.execute( 'registerMaterial', object.material._physijs );
                            _physijs.materialId = object.material._physijs.id;
                            this._materials_ref_counts[object.material._physijs.id] = 1;
                    } else {
                            this._materials_ref_counts[object.material._physijs.id]++;
                    }
            }

            // Object starting position + rotation
            _physijs.position = { x: object.position.x, y: object.position.y, z: object.position.z };
            _physijs.rotation = { x: object.quaternion.x, y: object.quaternion.y, z: object.quaternion.z, w: object.quaternion.w };

            // Check for scaling
            var mass_scaling = new THREE.Vector3( 1, 1, 1 );
            
            if ( _physijs.width ) {
                    _physijs.width *= object.scale.x;
            }
            if ( _physijs.height ) {
                    _physijs.height *= object.scale.y;
            }
            if ( _physijs.depth ) {
                    _physijs.depth *= object.scale.z;
            }

            this.execute( 'addObject', _physijs );
        } 
    },
    
    onRemove : function( object ) {
        
        let _physijs = object.physicsBody._physijs;
        
        if ( object instanceof Vehicle ) {
            this.execute( 'removeVehicle', { id: _physijs.id } );
            while( object.wheels.length ) {
                    this.remove( object.wheels.pop() );
            }
            this.remove( object.mesh );
            delete this._vehicles[ _physijs.id ];
        } else {
                THREE.Mesh.prototype.remove.call( this, object );
                if ( _physijs ) {
                        delete this._objects[_physijs.id];
                        this.execute( 'removeObject', { id: _physijs.id } );
                }
        }
        if ( object.material && object.material._physijs && this._materials_ref_counts.hasOwnProperty( object.material._physijs.id ) ) {
                this._materials_ref_counts[object.material._physijs.id]--;
                if( this._materials_ref_counts[object.material._physijs.id] === 0 ) {
                        this.execute( 'unRegisterMaterial', object.material._physijs );
                        delete this._materials_ref_counts[object.material._physijs.id];
                }
        }
    },
    
    onSimulationResume : function() {
	this.execute( 'onSimulationResume', { } );
    },
    
    simulate : function( timeStep, maxSubSteps ) {
	let object, _physijs, update;
        
        if ( _is_simulating ) {
            return false;
        }
        
        _is_simulating = true;

	let object_id;	
        for ( object_id in this._objects ) {
            
                if ( !this._objects.hasOwnProperty( object_id ) ) continue;

                object = this._objects[object_id];
                _physijs = object.physicsBody._physijs;

                if ( object.physicsBody.__dirtyPosition || object.physicsBody.__dirtyRotation ) {
                        update = { id: _physijs.id };

                        if ( object.physicsBody.__dirtyPosition ) {
                                update.pos = { x: object.position.x, y: object.position.y, z: object.position.z };
                                object.physicsBody.__dirtyPosition = false;
                        }

                        if ( object.physicsBody.__dirtyRotation ) {
                                update.quat = { x: object.quaternion.x, y: object.quaternion.y, z: object.quaternion.z, w: object.quaternion.w };
                                object.physicsBody.__dirtyRotation = false;
                        }

                        this.execute( 'updateTransform', update );
                }
	}

        this.execute( 'simulate', { timeStep: timeStep, maxSubSteps: maxSubSteps } );

        return true;
    },
    
    _updateScene : function( data ) {
		var num_objects = data[1],
			object, _physijs,
			i, offset;

		for ( i = 0; i < num_objects; i++ ) {
			offset = 2 + i * REPORT_ITEMSIZE;
			object = this._objects[ data[ offset ] ];
                        _physijs = object.physicsBody._physijs;

			if ( object === undefined ) {
				continue;
			}

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

		if ( SUPPORT_TRANSFERABLE ) {
			// Give the typed array back to the worker
			this._worker.transferableMessage( data.buffer, [data.buffer] );
		}

		_is_simulating = false;
		this.dispatchEvent( {type : 'update'} );
	},
        
        _updateSoftBodies : function( data ){
            
            const length = data[1];
            
            let object;
            let numVerts;
            
            let offset =2;
            
            for ( var i = 0, il = length; i < il; i ++ ) {
                
                object = this._objects[ data[offset] ];
                offset += 1;
                
                
                let volumePositions = object.geometry.attributes.position.array;
                let volumeNormals = object.geometry.attributes.normal.array;
                let association = object._physijs.ammoIndexAssociation;
                
                numVerts = data[offset];

                for ( let j = 0; j < numVerts; j ++ ) {
                    let assocVertex = association[ j ];

                    for ( let k = 0, kl = assocVertex.length; k < kl; k ++ ) {

                            var indexVertex = assocVertex[ k ];
                            volumePositions[ indexVertex ] = data[offset+1];
                            volumeNormals[ indexVertex ] = data[offset+4];
                            indexVertex ++;
                            volumePositions[ indexVertex ] = data[offset+2];
                            volumeNormals[ indexVertex ] = data[offset+5];
                            indexVertex ++;
                            volumePositions[ indexVertex ] = data[offset+3];
                            volumeNormals[ indexVertex ] = data[offset+6];

                    }
                    offset += 6;
                }
                offset += 1;

                object.geometry.attributes.position.needsUpdate = true;
                object.geometry.attributes.normal.needsUpdate = true;
            }
            
        },
        
        _updateVehicles : function( data ) {
		var vehicle, wheel,
			i, offset;

		for ( i = 0; i < ( data.length - 1 ) / VEHICLEREPORT_ITEMSIZE; i++ ) {
			offset = 1 + i * VEHICLEREPORT_ITEMSIZE;
			vehicle = this._vehicles[ data[ offset ] ];

			if ( vehicle === undefined ) {
				continue;
			}

			wheel = vehicle.wheels[ data[ offset + 1 ] ];

			wheel.position.set(
				data[ offset + 2 ],
				data[ offset + 3 ],
				data[ offset + 4 ]
			);

			wheel.quaternion.set(
				data[ offset + 5 ],
				data[ offset + 6 ],
				data[ offset + 7 ],
				data[ offset + 8 ]
			);
		}

		if ( SUPPORT_TRANSFERABLE ) {
			// Give the typed array back to the worker
			this._worker.transferableMessage( data.buffer, [data.buffer] );
		}
	},
        _updateConstraints : function( data ) {
		var constraint, object,
			i, offset;

		for ( i = 0; i < ( data.length - 1 ) / CONSTRAINTREPORT_ITEMSIZE; i++ ) {
			offset = 1 + i * CONSTRAINTREPORT_ITEMSIZE;
			constraint = this._constraints[ data[ offset ] ];
			object = this._objects[ data[ offset + 1 ] ];

			if ( constraint === undefined || object === undefined ) {
				continue;
			}

			_temp_vector3_1.set(
				data[ offset + 2 ],
				data[ offset + 3 ],
				data[ offset + 4 ]
			);
			_temp_matrix4_1.extractRotation( object.matrix );
			_temp_vector3_1.applyMatrix4( _temp_matrix4_1 );

			constraint.positiona.addVectors( object.position, _temp_vector3_1 );
			constraint.appliedImpulse = data[ offset + 5 ] ;
		}

		if ( SUPPORT_TRANSFERABLE ) {
			// Give the typed array back to the worker
			this._worker.transferableMessage( data.buffer, [data.buffer] );
		}
	},
        _updateCollisions : function( data ) {
		/**
		 * #TODO
		 * This is probably the worst way ever to handle collisions. The inherent evilness is a residual
		 * effect from the previous version's evilness which mutated when switching to transferable objects.
		 *
		 * If you feel inclined to make this better, please do so.
		 */

		var i, j, offset, object, _physijs, object2, _physijs2, id1, id2,
			collisions = {}, normal_offsets = {};

		// Build collision manifest
		for ( i = 0; i < data[1]; i++ ) {
			offset = 2 + i * COLLISIONREPORT_ITEMSIZE;
			object = data[ offset ];
			object2 = data[ offset + 1 ];

			normal_offsets[ object + '-' + object2 ] = offset + 2;
			normal_offsets[ object2 + '-' + object ] = -1 * ( offset + 2 );

			// Register collisions for both the object colliding and the object being collided with
			if ( !collisions[ object ] ) collisions[ object ] = [];
			collisions[ object ].push( object2 );

			if ( !collisions[ object2 ] ) collisions[ object2 ] = [];
			collisions[ object2 ].push( object );
		}

		// Deal with collisions
		for ( id1 in this._objects ) {
			if ( !this._objects.hasOwnProperty( id1 ) ) continue;
			object = this._objects[ id1 ];
                        _physijs = object.physicsBody._physijs;

			// If object touches anything, ...
			if ( collisions[ id1 ] ) {

				// Clean up touches array
				for ( j = 0; j < _physijs.touches.length; j++ ) {
					if ( collisions[ id1 ].indexOf( _physijs.touches[j] ) === -1 ) {
						_physijs.touches.splice( j--, 1 );
					}
				}

				// Handle each colliding object
				for ( j = 0; j < collisions[ id1 ].length; j++ ) {
					id2 = collisions[ id1 ][ j ];
					object2 = this._objects[ id2 ];
                                        

					if ( object2 ) { 
                                            _physijs2 = object2.physicsBody._physijs;
						// If object was not already touching object2, notify object
						if ( _physijs.touches.indexOf( id2 ) === -1 ) {
							_physijs.touches.push( id2 );
							_temp_vector3_1.subVectors( object.physicsBody.getLinearVelocity(), object2.physicsBody.getLinearVelocity() );
							_temp1 = _temp_vector3_1.clone();

							_temp_vector3_1.subVectors( object.physicsBody.getAngularVelocity(), object2.physicsBody.getAngularVelocity() );
							_temp2 = _temp_vector3_1.clone();

							var normal_offset = normal_offsets[ _physijs.id + '-' + _physijs2.id ];
							if ( normal_offset > 0 ) {
								_temp_vector3_1.set(
									-data[ normal_offset ],
									-data[ normal_offset + 1 ],
									-data[ normal_offset + 2 ]
								);
							} else {
								normal_offset *= -1;
								_temp_vector3_1.set(
									data[ normal_offset ],
									data[ normal_offset + 1 ],
									data[ normal_offset + 2 ]
								);
							}

							object.dispatchEvent( {type:'collision'}, object2, _temp1, _temp2, _temp_vector3_1 );
						}
					}
				}

			} else {

				// not touching other objects
				_physijs.touches.length = 0;

			}

		}

		this.collisions = collisions;

		if ( SUPPORT_TRANSFERABLE ) {
			// Give the typed array back to the worker
			this._worker.transferableMessage( data.buffer, [data.buffer] );
		}
	},
        addConstraint : function ( constraint, show_marker ) {
		this._constraints[ constraint.id ] = constraint;
		this.execute( 'addConstraint', constraint.getDefinition() );

		if ( show_marker ) {
			var marker;

			switch ( constraint.type ) {
				case 'point':
					marker = new THREE.Mesh(
						new THREE.SphereGeometry( 1.5 ),
						new THREE.MeshNormalMaterial
					);
					marker.position.copy( constraint.positiona );
					this._objects[ constraint.objecta ].add( marker );
					break;

				case 'hinge':
					marker = new THREE.Mesh(
						new THREE.SphereGeometry( 1.5 ),
						new THREE.MeshNormalMaterial
					);
					marker.position.copy( constraint.positiona );
					this._objects[ constraint.objecta ].add( marker );
					break;

				case 'slider':
					marker = new THREE.Mesh(
						new THREE.BoxGeometry( 10, 1, 1 ),
						new THREE.MeshNormalMaterial
					);
					marker.position.copy( constraint.positiona );
					// This rotation isn't right if all three axis are non-0 values
					// TODO: change marker's rotation order to ZYX
					marker.rotation.set(
						constraint.axis.y, // yes, y and
						constraint.axis.x, // x axis are swapped
						constraint.axis.z
					);
					this._objects[ constraint.objecta ].add( marker );
					break;

				case 'conetwist':
					marker = new THREE.Mesh(
						new THREE.SphereGeometry( 1.5 ),
						new THREE.MeshNormalMaterial
					);
					marker.position.copy( constraint.positiona );
					this._objects[ constraint.objecta ].add( marker );
					break;

				case 'dof':
					marker = new THREE.Mesh(
						new THREE.SphereGeometry( 1.5 ),
						new THREE.MeshNormalMaterial
					);
					marker.position.copy( constraint.positiona );
					this._objects[ constraint.objecta ].add( marker );
					break;
			}
		}

		return constraint;
	}
});
PhysicsWorld.addPhysics = function( scene, params ){
    scene.physicsWorld = new PhysicsWorld( scene, params );
    return scene.physicsWorld;
};

	PhysicsWorld.prototype.removeConstraint = function( constraint ) {
		if ( this._constraints[constraint.id ] !== undefined ) {
			this.execute( 'removeConstraint', { id: constraint.id } );
			delete this._constraints[ constraint.id ];
		}
	};

	PhysicsWorld.prototype.execute = function( cmd, params ) {
		this._worker.postMessage({ cmd: cmd, params: params });
	};
        

	PhysicsWorld.prototype.setFixedTimeStep = function( fixedTimeStep ) {
		if ( fixedTimeStep ) {
			this.execute( 'setFixedTimeStep', fixedTimeStep );
		}
	};

	PhysicsWorld.prototype.setGravity = function( gravity ) {
		if ( gravity ) {
			this.execute( 'setGravity', gravity );
		}
	};
        
        let Scene = function( params ) {

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
        this.onRemove( object );
    }
});

Scene.scripts = {
    ammo : 'ammo.js',
    worker : 'physijs_worker.js'
};
        
export default Scene;
export { Scene, PhysicsWorld }

