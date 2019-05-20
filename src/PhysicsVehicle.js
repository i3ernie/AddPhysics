/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import * as THREE from './three.module.js';
import { getObjectId } from './physi_utils.js';

// Physijs.Vehicle
let Vehicle = function( mesh, tuning ) {
    
    tuning = tuning || new VehicleTuning();
    
    this.mesh = mesh;
    this.wheels = [];
    
    this._physijs = {
            id: getObjectId(),
            rigidBody: mesh._physijs.id,
            suspension_stiffness: tuning.suspension_stiffness,
            suspension_compression: tuning.suspension_compression,
            suspension_damping: tuning.suspension_damping,
            max_suspension_travel: tuning.max_suspension_travel,
            friction_slip: tuning.friction_slip,
            max_suspension_force: tuning.max_suspension_force
    };
};

Vehicle.prototype.addWheel = function( wheel_geometry, wheel_material, connection_point, wheel_direction, wheel_axle, suspension_rest_length, wheel_radius, is_front_wheel, tuning ) {
        var wheel = new THREE.Mesh( wheel_geometry, wheel_material );
        wheel.castShadow = wheel.receiveShadow = true;
        wheel.position.copy( wheel_direction ).multiplyScalar( suspension_rest_length / 100 ).add( connection_point );
        this.world.add( wheel );
        this.wheels.push( wheel );

        this.world.execute( 'addWheel', {
                id: this._physijs.id,
                connection_point: { x: connection_point.x, y: connection_point.y, z: connection_point.z },
                wheel_direction: { x: wheel_direction.x, y: wheel_direction.y, z: wheel_direction.z },
                wheel_axle: { x: wheel_axle.x, y: wheel_axle.y, z: wheel_axle.z },
                suspension_rest_length: suspension_rest_length,
                wheel_radius: wheel_radius,
                is_front_wheel: is_front_wheel,
                tuning: tuning
        });
};
Vehicle.prototype.setSteering = function( amount, wheel ) {
        if ( wheel !== undefined && this.wheels[ wheel ] !== undefined ) {
                this.world.execute( 'setSteering', { id: this._physijs.id, wheel: wheel, steering: amount } );
        } else if ( this.wheels.length > 0 ) {
                for ( var i = 0; i < this.wheels.length; i++ ) {
                        this.world.execute( 'setSteering', { id: this._physijs.id, wheel: i, steering: amount } );
                }
        }
};
Vehicle.prototype.setBrake = function( amount, wheel ) {
        if ( wheel !== undefined && this.wheels[ wheel ] !== undefined ) {
                this.world.execute( 'setBrake', { id: this._physijs.id, wheel: wheel, brake: amount } );
        } else if ( this.wheels.length > 0 ) {
                for ( var i = 0; i < this.wheels.length; i++ ) {
                        this.world.execute( 'setBrake', { id: this._physijs.id, wheel: i, brake: amount } );
                }
        }
};
Vehicle.prototype.applyEngineForce = function( amount, wheel ) {
        if ( wheel !== undefined && this.wheels[ wheel ] !== undefined ) {
                this.world.execute( 'applyEngineForce', { id: this._physijs.id, wheel: wheel, force: amount } );
        } else if ( this.wheels.length > 0 ) {
                for ( var i = 0; i < this.wheels.length; i++ ) {
                        this.world.execute( 'applyEngineForce', { id: this._physijs.id, wheel: i, force: amount } );
                }
        }
};

// Physijs.VehicleTuning
let VehicleTuning = function( suspension_stiffness, suspension_compression, suspension_damping, max_suspension_travel, friction_slip, max_suspension_force ) {
        this.suspension_stiffness = suspension_stiffness !== undefined ? suspension_stiffness : 5.88;
        this.suspension_compression = suspension_compression !== undefined ? suspension_compression : 0.83;
        this.suspension_damping = suspension_damping !== undefined ? suspension_damping : 0.88;
        this.max_suspension_travel = max_suspension_travel !== undefined ? max_suspension_travel : 500;
        this.friction_slip = friction_slip !== undefined ? friction_slip : 10.5;
        this.max_suspension_force = max_suspension_force !== undefined ? max_suspension_force : 6000;
};
/*
    _updateVehicles = function( data ) {
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
    };
        */
export { Vehicle, VehicleTuning };

