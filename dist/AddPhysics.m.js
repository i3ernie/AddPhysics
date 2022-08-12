import * as THREE from 'three';
export { THREE };

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

let _temp_matrix4_1$1 = new THREE.Matrix4(); 
let _temp_vector3_1$1 = new THREE.Vector3(); 
let _temp_vector3_2 = new THREE.Vector3();

// returns a unique ID for a Physijs mesh object
let getObjectId = (function() {
        var _id = 1;
        return function() {
                return _id++;
        };
})();
// Converts a world-space position to object-space
let convertWorldPositionToObject = function( position, object ) {
        _temp_matrix4_1$1.identity(); // reset temp matrix

        // Set the temp matrix's rotation to the object's rotation
        _temp_matrix4_1$1.identity().makeRotationFromQuaternion( object.quaternion );

        // Invert rotation matrix in order to "unrotate" a point back to object space
        _temp_matrix4_1$1.invert( _temp_matrix4_1$1 );

        // Yay! Temp vars!
        _temp_vector3_1$1.copy( position );
        _temp_vector3_2.copy( object.position );

        // Apply the rotation

        return _temp_vector3_1$1.sub( _temp_vector3_2 ).applyMatrix4( _temp_matrix4_1$1 );
};

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

let _Physijs$1 = window.Physijs; // used for noConflict method

let AddPhysics = {
    updateFunctions : {  
    },
    addFunctions : {
        constraint:{}
    },
    SUPPORT_TRANSFERABLE : false,
    status : {
        _is_simulating : false
    },
    options : {

    },
    config : function( obj ){
        Object.assign(AddPhysics.options, obj );
    },
    noConflict : function() {
        window.Physijs = _Physijs$1;
        return Physijs;
    }
};

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

AddPhysics.addFunctions.constraint.dof = function( constraint ){
    let marker = new THREE.Mesh(
            new THREE.SphereGeometry( 1.5 ),
            new THREE.MeshNormalMaterial
    );
    marker.position.copy( constraint.positiona );
    this._objects[ constraint.objecta ].add( marker );
};

let DOFConstraint = function( objecta, objectb, position ) {
        if ( position === undefined ) {
                position = objectb;
                objectb = undefined;
        }
        this.type = 'dof';
        this.appliedImpulse = 0;
        this.id = getObjectId();
        this.scene = objecta.parent;
        this.objecta = objecta._physijs.id;
        this.positiona = convertWorldPositionToObject( position, objecta ).clone();
        this.axisa = { x: objecta.rotation.x, y: objecta.rotation.y, z: objecta.rotation.z };

        if ( objectb ) {
                this.objectb = objectb._physijs.id;
                this.positionb = convertWorldPositionToObject( position, objectb ).clone();
                this.axisb = { x: objectb.rotation.x, y: objectb.rotation.y, z: objectb.rotation.z };
        }
};

DOFConstraint.prototype.getDefinition = function() {
    return {
        type: this.type,
        id: this.id,
        objecta: this.objecta,
        objectb: this.objectb,
        positiona: this.positiona,
        positionb: this.positionb,
        axisa: this.axisa,
        axisb: this.axisb
    };
};

DOFConstraint.prototype.setLinearLowerLimit = function( limit ) {
        this.scene.execute( 'dof_setLinearLowerLimit', { constraint: this.id, x: limit.x, y: limit.y, z: limit.z } );
};
DOFConstraint.prototype.setLinearUpperLimit = function( limit ) {
        this.scene.execute( 'dof_setLinearUpperLimit', { constraint: this.id, x: limit.x, y: limit.y, z: limit.z } );
};
DOFConstraint.prototype.setAngularLowerLimit = function( limit ) {
        this.scene.execute( 'dof_setAngularLowerLimit', { constraint: this.id, x: limit.x, y: limit.y, z: limit.z } );
};
DOFConstraint.prototype.setAngularUpperLimit = function( limit ) {
        this.scene.execute( 'dof_setAngularUpperLimit', { constraint: this.id, x: limit.x, y: limit.y, z: limit.z } );
};
DOFConstraint.prototype.enableAngularMotor = function( which ) {
        this.scene.execute( 'dof_enableAngularMotor', { constraint: this.id, which: which } );
};
DOFConstraint.prototype.configureAngularMotor = function( which, low_angle, high_angle, velocity, max_force ) {
        this.scene.execute( 'dof_configureAngularMotor', { constraint: this.id, which: which, low_angle: low_angle, high_angle: high_angle, velocity: velocity, max_force: max_force } );
};
DOFConstraint.prototype.disableAngularMotor = function( which ) {
        this.scene.execute( 'dof_disableAngularMotor', { constraint: this.id, which: which } );
};

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

AddPhysics.addFunctions.constraint.point = function( constraint ){
    let marker = new THREE.Mesh(
            new THREE.SphereGeometry( 1.5 ),
            new THREE.MeshNormalMaterial
    );
    marker.position.copy( constraint.positiona );
    this._objects[ constraint.objecta ].add( marker );
};


let PointConstraint = function( objecta, objectb, position ) {
        if ( position === undefined ) {
                position = objectb;
                objectb = undefined;
        }

        this.type = 'point';
        this.appliedImpulse = 0;
        this.id = getObjectId();
        this.objecta = objecta._physijs.id;
        this.positiona = convertWorldPositionToObject( position, objecta ).clone();

        if ( objectb ) {
                this.objectb = objectb._physijs.id;
                this.positionb = convertWorldPositionToObject( position, objectb ).clone();
        }
};

PointConstraint.prototype.getDefinition = function() {
        return {
                type: this.type,
                id: this.id,
                objecta: this.objecta,
                objectb: this.objectb,
                positiona: this.positiona,
                positionb: this.positionb
        };
};

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

AddPhysics.addFunctions.constraint.slider = function( constraint ){
    let marker = new THREE.Mesh(
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
};

let SliderConstraint = function( objecta, objectb, position, axis ) {
        if ( axis === undefined ) {
                axis = position;
                position = objectb;
                objectb = undefined;
        }

        this.type = 'slider';
        this.appliedImpulse = 0;
        this.id = getObjectId();
        this.scene = objecta.parent;
        this.objecta = objecta._physijs.id;
        this.positiona = convertWorldPositionToObject( position, objecta ).clone();
        this.axis = axis;

        if ( objectb ) {
                this.objectb = objectb._physijs.id;
                this.positionb = convertWorldPositionToObject( position, objectb ).clone();
        }
};
SliderConstraint.prototype.getDefinition = function() {
        return {
                type: this.type,
                id: this.id,
                objecta: this.objecta,
                objectb: this.objectb,
                positiona: this.positiona,
                positionb: this.positionb,
                axis: this.axis
        };
};
SliderConstraint.prototype.setLimits = function( lin_lower, lin_upper, ang_lower, ang_upper ) {
        this.scene.execute( 'slider_setLimits', { constraint: this.id, lin_lower: lin_lower, lin_upper: lin_upper, ang_lower: ang_lower, ang_upper: ang_upper } );
};
SliderConstraint.prototype.setRestitution = function( linear, angular ) {
        this.scene.execute(
                'slider_setRestitution',
                {
                        constraint: this.id,
                        linear: linear,
                        angular: angular
                }
        );
};
SliderConstraint.prototype.enableLinearMotor = function( velocity, acceleration) {
        this.scene.execute( 'slider_enableLinearMotor', { constraint: this.id, velocity: velocity, acceleration: acceleration } );
};
SliderConstraint.prototype.disableLinearMotor = function() {
        this.scene.execute( 'slider_disableLinearMotor', { constraint: this.id } );
};
SliderConstraint.prototype.enableAngularMotor = function( velocity, acceleration ) {
        this.scene.execute( 'slider_enableAngularMotor', { constraint: this.id, velocity: velocity, acceleration: acceleration } );
};
SliderConstraint.prototype.disableAngularMotor = function() {
        this.scene.execute( 'slider_disableAngularMotor', { constraint: this.id } );
};

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

AddPhysics.addFunctions.constraint.hinge = function( constraint ){
    let marker = new THREE.Mesh(
            new THREE.SphereGeometry( 1.5 ),
            new THREE.MeshNormalMaterial
    );
    marker.position.copy( constraint.positiona );
    this._objects[ constraint.objecta ].add( marker );
};

let HingeConstraint = function( objecta, objectb, position, axis ) {
        if ( axis === undefined ) {
                axis = position;
                position = objectb;
                objectb = undefined;
        }

        this.type = 'hinge';
        this.appliedImpulse = 0;
        this.id = getObjectId();
        this.scene = objecta.parent;
        this.objecta = objecta._physijs.id;
        this.positiona = convertWorldPositionToObject( position, objecta ).clone();
        this.position = position.clone();
        this.axis = axis;

        if ( objectb ) {
                this.objectb = objectb._physijs.id;
                this.positionb = convertWorldPositionToObject( position, objectb ).clone();
        }
};
HingeConstraint.prototype.getDefinition = function() {
    return {
            type: this.type,
            id: this.id,
            objecta: this.objecta,
            objectb: this.objectb,
            positiona: this.positiona,
            positionb: this.positionb,
            axis: this.axis
    };
};

/*
 * low = minimum angle in radians
 * high = maximum angle in radians
 * bias_factor = applied as a factor to constraint error
 * relaxation_factor = controls bounce (0.0 == no bounce)
 */
HingeConstraint.prototype.setLimits = function( low, high, bias_factor, relaxation_factor ) {
        this.scene.execute( 'hinge_setLimits', { constraint: this.id, low: low, high: high, bias_factor: bias_factor, relaxation_factor: relaxation_factor } );
};

HingeConstraint.prototype.enableAngularMotor = function( velocity, acceleration ) {
        this.scene.execute( 'hinge_enableAngularMotor', { constraint: this.id, velocity: velocity, acceleration: acceleration } );
};

HingeConstraint.prototype.disableMotor = function( velocity, acceleration ) {
        this.scene.execute( 'hinge_disableMotor', { constraint: this.id } );
};

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

AddPhysics.addFunctions.constraint.conetwist = function( constraint ){
    let marker = new THREE.Mesh(
            new THREE.SphereGeometry( 1.5 ),
            new THREE.MeshNormalMaterial
    );
    marker.position.copy( constraint.positiona );
    this._objects[ constraint.objecta ].add( marker );
};


const ConeTwistConstraint = function( objecta, objectb, position ) {
        if ( position === undefined ) {
                throw 'Both objects must be defined in a ConeTwistConstraint.';
        }
        this.type = 'conetwist';
        this.appliedImpulse = 0;
        this.id = getObjectId();
        this.scene = objecta.parent;
        this.objecta = objecta._physijs.id;
        this.positiona = convertWorldPositionToObject( position, objecta ).clone();
        this.objectb = objectb._physijs.id;
        this.positionb = convertWorldPositionToObject( position, objectb ).clone();
        this.axisa = { x: objecta.rotation.x, y: objecta.rotation.y, z: objecta.rotation.z };
        this.axisb = { x: objectb.rotation.x, y: objectb.rotation.y, z: objectb.rotation.z };
};

Object.assign( ConeTwistConstraint.prototype, {
        getDefinition : function() {
                return {
                        type: this.type,
                        id: this.id,
                        objecta: this.objecta,
                        objectb: this.objectb,
                        positiona: this.positiona,
                        positionb: this.positionb,
                        axisa: this.axisa,
                        axisb: this.axisb
                };
        },

        setLimit : function( x, y, z ) {
                this.scene.execute( 'conetwist_setLimit', { constraint: this.id, x: x, y: y, z: z } );
        },
        enableMotor : function() {
                this.scene.execute( 'conetwist_enableMotor', { constraint: this.id } );
        },
        setMaxMotorImpulse : function( max_impulse ) {
                this.scene.execute( 'conetwist_setMaxMotorImpulse', { constraint: this.id, max_impulse: max_impulse } );
        }
});

ConeTwistConstraint.prototype.setMotorTarget = function( target ) {
        if ( target instanceof THREE.Vector3 ) {
                target = new THREE.Quaternion().setFromEuler( new THREE.Euler( target.x, target.y, target.z ) );
        } else if ( target instanceof THREE.Euler ) {
                target = new THREE.Quaternion().setFromEuler( target );
        } else if ( target instanceof THREE.Matrix4 ) {
                target = new THREE.Quaternion().setFromRotationMatrix( target );
        }
        this.scene.execute( 'conetwist_setMotorTarget', { constraint: this.id, x: target.x, y: target.y, z: target.z, w: target.w } );
};
ConeTwistConstraint.prototype.disableMotor = function() {
        this.scene.execute( 'conetwist_disableMotor', { constraint: this.id } );
};

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const VEHICLEREPORT_ITEMSIZE = 9;

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

AddPhysics.updateFunctions._updateVehicles = function( data ) {
        let vehicle, wheel, offset;

        for ( let i = 0; i < ( data.length - 1 ) / VEHICLEREPORT_ITEMSIZE; i++ ) {
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

        if ( AddPhysics.SUPPORT_TRANSFERABLE ) {
                // Give the typed array back to the worker
                this._worker.transferableMessage( data.buffer, [data.buffer] );
        }
};

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// constants
const MESSAGE_TYPES = {
        WORLDREPORT: 0,
        COLLISIONREPORT: 1,
        VEHICLEREPORT: 2,
        CONSTRAINTREPORT: 3,
        SOFTBODYREPORT :4
};

const COLLISIONREPORT_ITEMSIZE = 5,
    CONSTRAINTREPORT_ITEMSIZE = 6;
    
    AddPhysics.status._is_simulating = false;
    let _temp_vector3_1 = new THREE.Vector3(),
        _temp_matrix4_1 = new THREE.Matrix4(),
        _quaternion_1 = new THREE.Quaternion();


const addObjectChildren = function( parent, object ) 
{
    let child;
    
    for ( let i = 0; i < object.children.length; i++ ) 
    {
        child = object.children[i];
        
        if ( child._physijs ) {
            
            child.updateMatrix();
            child.updateMatrixWorld();

            _temp_vector3_1.setFromMatrixPosition( child.matrixWorld );
            _quaternion_1.setFromRotationMatrix( child.matrixWorld );

            child._physijs.position_offset = {
                    x: _temp_vector3_1.x,
                    y: _temp_vector3_1.y,
                    z: _temp_vector3_1.z
            };

            child._physijs.rotation = {
                    x: _quaternion_1.x,
                    y: _quaternion_1.y,
                    z: _quaternion_1.z,
                    w: _quaternion_1.w
            };

            parent._physijs.children.push( child._physijs );
        }

        addObjectChildren( parent, child );
    }
};

const InterfacePhysicsWorld = (Base) => class extends Base {
    constructor ( scene, params ){
            super();
                let self = this;

                scene = scene || this;
                
                scene.addEventListener("physicsBodyAdded", function( event ){
                        self.onAdd( event.object );
                });
                //remove physicsBody
                scene.addEventListener("physicsBodyRemoved", function( event ){
                        self.onRemove( event.object );
                });
        
                this._worker = new Worker( PhysicsWorld.scripts.worker || 'physijs_worker.js' );
                this._worker.transferableMessage = this._worker.webkitPostMessage || this._worker.postMessage;
                this._materials_ref_counts = {};
                this._objects = {};
                this._vehicles = {};
                this._constraints = {};
        
                let ab = new ArrayBuffer( 1 );
                this._worker.transferableMessage( ab, [ab] );
                AddPhysics.SUPPORT_TRANSFERABLE = ( ab.byteLength === 0 );

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
                                        AddPhysics.updateFunctions._updateScene.call( self, data );
                                        break;

                                case MESSAGE_TYPES.COLLISIONREPORT:
                                        self._updateCollisions( data );
                                        break;

                                case MESSAGE_TYPES.VEHICLEREPORT:
                                        AddPhysics.updateFunctions._updateVehicles.call( self, data );
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
                                                AddPhysics.updateFunctions._updateScene.call( self, data );
                                                break;

                                        case MESSAGE_TYPES.COLLISIONREPORT:
                                                self._updateCollisions( data );
                                                break;

                                        case MESSAGE_TYPES.VEHICLEREPORT:
                                                AddPhysics.updateFunctions._updateVehicles.call( self, data );
                                                break;

                                        case MESSAGE_TYPES.CONSTRAINTREPORT:
                                                self._updateConstraints( data );
                                                break;
                                                
                                        case MESSAGE_TYPES.SOFTBODYREPORT:
                                                AddPhysics.updateFunctions._updateSoftBodies.call( self, data );
                                                break;
                                }

                        }

                }
        };


                params = params || {};
                params.ammo = PhysicsWorld.scripts.ammo || 'ammo.js';
                params.fixedTimeStep = params.fixedTimeStep || 1 / 60;
                params.rateLimit = params.rateLimit || true;
                this.execute( 'init', params );
                if ( params.gravity ) {
                this.execute( 'setGravity', params.gravity );
                }
        }

    
    onAdd ( object ) {
      
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
            new THREE.Vector3( 1, 1, 1 );
            
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
    }
    
    onRemove ( object ) { 
        
        let _physijs = object.physicsBody._physijs;
       
        if ( object instanceof Vehicle ) {
            this.execute( 'removeVehicle', { id: _physijs.id } );
            while( object.wheels.length ) {
                    this.remove( object.wheels.pop() );
            }
            this.remove( object.mesh );
            delete this._vehicles[ _physijs.id ];
        } else {  
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
    }
    
    onSimulationResume () {
	this.execute( 'onSimulationResume', { } );
    }
    
    simulate ( timeStep, maxSubSteps ) {
	let object, _physijs, update;
        
        if ( AddPhysics.status._is_simulating ) {
            return false;
        }
        
        AddPhysics.status._is_simulating = true;

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
    }
        
        
        _updateConstraints ( data ) {
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

		if ( AddPhysics.SUPPORT_TRANSFERABLE ) {
			// Give the typed array back to the worker
			this._worker.transferableMessage( data.buffer, [data.buffer] );
		}
	}

        _updateCollisions ( data ) {
		/**
		 * #TODO
		 * This is probably the worst way ever to handle collisions. The inherent evilness is a residual
		 * effect from the previous version's evilness which mutated when switching to transferable objects.
		 *
		 * If you feel inclined to make this better, please do so.
		 */

		var offset, object, _physijs, object2, _physijs2, id1, id2,
			collisions = {}, normal_offsets = {};

		// Build collision manifest
		for (let i = 0; i < data[1]; i++ ) {
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
				for ( let j = 0; j < _physijs.touches.length; j++ ) {
					if ( collisions[ id1 ].indexOf( _physijs.touches[j] ) === -1 ) {
						_physijs.touches.splice( j--, 1 );
					}
				}
                                let _temp1, _temp2;
				// Handle each colliding object
				for ( let j = 0; j < collisions[ id1 ].length; j++ ) {
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

							object.dispatchEvent( {type:'collision', detail:[ object2, _temp1, _temp2, _temp_vector3_1]} );
						}
					}
				}

			} else {

				// not touching other objects
				_physijs.touches.length = 0;

			}

		}

		this.collisions = collisions;

		if ( AddPhysics.SUPPORT_TRANSFERABLE ) {
			// Give the typed array back to the worker
			this._worker.transferableMessage( data.buffer, [data.buffer] );
		}
	}

        addConstraint  ( constraint, show_marker ) {
		this._constraints[ constraint.id ] = constraint;
		this.execute( 'addConstraint', constraint.getDefinition() );
                

		if ( show_marker && typeof AddPhysics.addFunctions.constraint[constraint.type] === "function") {
                    
                    AddPhysics.addFunctions.constraint[constraint.type]( constraint );			
		}

		return constraint;
	}
};

class PhysicsWorld extends InterfacePhysicsWorld ( THREE.EventDispatcher) {
        constructor( scene, params ){
                super( scene, params );
        }
}

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

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



const REPORT_ITEMSIZE = 14;
    
    new THREE.Vector3();
        new THREE.Quaternion();


class Scene extends InterfacePhysicsWorld( THREE.Scene ) {   
        constructor( params ) {

            super( null, params );     

            //PhysicsWorld.call( this, this, params );
            this.physicsWorld = this;
        }
}

Object.assign(Scene.prototype, PhysicsWorld.prototype, {
    
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

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

let defaults = {
    type : null,
    mass : 0
};

let PhysicsBody = function( mesh, opt ){
    
    if ( !mesh.geometry.boundingBox ) {
        mesh.geometry.computeBoundingBox();
    }
    
    opt = Object.assign( {}, defaults, mesh.userData.physics, opt );

    
    mesh.addEventListener("added", function(){ 
        this.physicsBody.scene = this.parent;
        this.parent.dispatchEvent({type:"physicsBodyAdded", object:this});
    });
    mesh.addEventListener("removed", function( el ){ 
        this.physicsBody.scene.dispatchEvent({type:"physicsBodyRemoved", object:this});
        this.physicsBody.scene = null;
    });
   
    this._physijs = {
        type: opt.type,
        id: getObjectId(),
        mass: opt.mass,
        touches: [],
        linearVelocity: new THREE.Vector3(),
        angularVelocity: new THREE.Vector3()
    };
    
};

PhysicsBody.add = function ( Body, mesh, opt ){ 
    mesh.physicsBody = new Body( mesh, opt );
    if ( mesh.parent && mesh.parent.type === "Scene" ) {
        mesh.parent.dispatchEvent({type:"physicsBodyAdded", object:mesh});
    }    return mesh.physicsBody;
};

PhysicsBody.prototype = Object.assign( Object.create( PhysicsBody.prototype), {
    // Physijs.Mesh.applyCentralImpulse
    
    applyCentralImpulse : function ( force ) {
            if ( this.world ) {
                    this.world.execute( 'applyCentralImpulse', { id: this._physijs.id, x: force.x, y: force.y, z: force.z } );
            }
    },

    // Physijs.Mesh.applyImpulse
    applyImpulse : function ( force, offset ) {
            if ( this.world ) {
                    this.world.execute( 'applyImpulse', { id: this._physijs.id, impulse_x: force.x, impulse_y: force.y, impulse_z: force.z, x: offset.x, y: offset.y, z: offset.z } );
            }
    },

    // Physijs.Mesh.applyTorque
    applyTorque : function ( force ) {
            if ( this.world ) {
                    this.world.execute( 'applyTorque', { id: this._physijs.id, torque_x: force.x, torque_y: force.y, torque_z: force.z } );
            }
    },

    // Physijs.Mesh.applyCentralForce
    applyCentralForce : function ( force ) {
            if ( this.world ) {
                    this.world.execute( 'applyCentralForce', { id: this._physijs.id, x: force.x, y: force.y, z: force.z } );
            }
    },

    // Physijs.Mesh.applyForce
    applyForce : function ( force, offset ) {
            if ( this.world ) {
                    this.world.execute( 'applyForce', { id: this._physijs.id, force_x: force.x, force_y : force.y, force_z : force.z, x: offset.x, y: offset.y, z: offset.z } );
            }
    },

    // Physijs.Mesh.getAngularVelocity
    getAngularVelocity : function () {
            return this._physijs.angularVelocity;
    },

    // Physijs.Mesh.setAngularVelocity
    setAngularVelocity : function ( velocity ) {
            if ( this.world ) {
                    this.world.execute( 'setAngularVelocity', { id: this._physijs.id, x: velocity.x, y: velocity.y, z: velocity.z } );
            }
    },

    // Physijs.Mesh.getLinearVelocity
    getLinearVelocity : function () {
            return this._physijs.linearVelocity;
    },

    // Physijs.Mesh.setLinearVelocity
    setLinearVelocity : function ( velocity ) {
            if ( this.world ) {
                    this.world.execute( 'setLinearVelocity', { id: this._physijs.id, x: velocity.x, y: velocity.y, z: velocity.z } );
            }
    },

    // Physijs.Mesh.setAngularFactor
    setAngularFactor : function ( factor ) {
            if ( this.world ) {
                    this.world.execute( 'setAngularFactor', { id: this._physijs.id, x: factor.x, y: factor.y, z: factor.z } );
            }
    },

    // Physijs.Mesh.setLinearFactor
    setLinearFactor : function ( factor ) {
            if ( this.world ) {
                    this.world.execute( 'setLinearFactor', { id: this._physijs.id, x: factor.x, y: factor.y, z: factor.z } );
            }
    },

    // Physijs.Mesh.setDamping
    setDamping : function ( linear, angular ) {
            if ( this.world ) {
                    this.world.execute( 'setDamping', { id: this._physijs.id, linear: linear, angular: angular } );
            }
    },

    // Physijs.Mesh.setCcdMotionThreshold
    setCcdMotionThreshold : function ( threshold ) {
            if ( this.world ) {
                    this.world.execute( 'setCcdMotionThreshold', { id: this._physijs.id, threshold: threshold } );
            }
    },

    // Physijs.Mesh.setCcdSweptSphereRadius
    setCcdSweptSphereRadius : function ( radius ) {
            if ( this.world ) {
                    this.world.execute( 'setCcdSweptSphereRadius', { id: this._physijs.id, radius: radius } );
            }
    }
});

// Body.mass
Object.defineProperty( PhysicsBody.prototype, 'mass', {
    get: function() { 
        return this._physijs.mass; 
    },
    set: function( mass ) { 
        this._physijs.mass = mass;
        
        if ( this.world ) {
            this.world.execute( 'updateMass', { id: this._physijs.id, mass: mass } );
        } 
    }
});


// Phsijs.Mesh
class Mesh$1 extends THREE.Mesh {
        constructor ( geometry, material, mass ) {

                if ( !geometry ) {
                        return;
                }

                super( geometry, material );
                PhysicsBody.call( this, this, { mass: mass } );
                this.physicsBody = this;
        }
}Object.assign( Mesh$1.prototype, PhysicsBody.prototype, {
    constructor : Mesh$1
});

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*import { Mesh } from 'three';*/

const _make$8 = function( mesh, opt ){
    
    this._physijs.type = 'box';
    _volume$1.call( this, mesh, opt );
    this._physijs.mass = (typeof opt.mass === 'undefined') ? this._physijs.volume : opt.mass;
};

const _volume$1 = function( mesh, opt ){
    let geometry = mesh.geometry;

    let width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    let height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
    let depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;
    
    this._physijs.width = width;
    this._physijs.height = height;
    this._physijs.depth = depth;
    
    this._physijs.volume = ( typeof opt.volume === 'number' ) ? opt.volume : width * height * depth;
};

const Body$9 = function( mesh, opt ) {
    opt = Object.assign( {}, mesh.userData.physics, opt );
    PhysicsBody.call( this, mesh, opt );

    _make$8.call( this, mesh, opt );    
};

Body$9.prototype = Object.assign( Object.create( PhysicsBody.prototype ), {
    constructor : Body$9
});

Body$9.addPhysics = function( mesh, opt ){
    PhysicsBody.add( Body$9, mesh, opt );
};


class BoxMesh extends Mesh$1 {
    constructor ( geometry, material, mass ) {

        super ( geometry, material, mass );

        _make$8.call( this, this, {mass:mass} );
   
    }
}

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const _make$7 = function( mesh, opt ){
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

const Body$8 = function( mesh, opt ){    
    opt = opt || {};
    PhysicsBody.call( this, mesh, opt );
    _make$7.call( this, mesh, opt );
};

Body$8.prototype = Object.assign( {}, PhysicsBody.prototype, {
    constructor : Body$8
});

Body$8.addPhysics = function( mesh, opt ){
    PhysicsBody.add( Body$8, mesh, opt );
};

// Physijs.SphereMesh
class SphereMesh extends Mesh$1 {
    constructor ( geometry, material, mass ) {
        super( geometry, material, mass );
        _make$7.call( this, this, { mass: mass } );
    }
}

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const _make$6 = function( mesh, opt ){
    let geometry = mesh.geometry;

    if ( !geometry.boundingBox ) {
            geometry.computeBoundingBox();
    }

    let width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    let height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
    let depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;

    this._physijs.type = 'cylinder';
    this._physijs.width = width;
    this._physijs.height = height;
    this._physijs.depth = depth;
    this._physijs.mass = (typeof opt.mass === 'undefined') ? width * height * depth : opt.mass;
};

const Body$7 = function( mesh, opt ){
    opt = opt || {};
    PhysicsBody.call( this, mesh, opt );
    _make$6.call( this, mesh, opt );
};
Body$7.prototype = Object.assign({}, PhysicsBody.prototype, {
    constructor : Body$7
});

Body$7.addPhysics = function( mesh, opt ){
    mesh.physicsBody = new Body$7( mesh, opt );
    if ( mesh.parent && mesh.parent.type === "Scene" ) { 
        mesh.parent.dispatchEvent({type:"physicsBodyAdded", object:mesh});
    }
};


// Physijs.CylinderMesh
class CylinderMesh extends Mesh$1 {
    constructor ( geometry, material, mass ) {
        
        super( geometry, material, mass );
        _make$6.call( this, this, { mass: mass } );
    }
}

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const _make$5 = function( mesh, opt ){
    
    let points = [];
    const geometry =  mesh.geometry;
    const vertices = geometry.attributes.position.array;

    for ( let i = 0; i < vertices.length; i+=3 ) {
        points.push({
                x: vertices[i],
                y: vertices[i+1],
                z: vertices[i+2]
        });
    }

    const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    const height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
    const depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;

    this._physijs.type = 'convex';
    this._physijs.points = points;
    this._physijs.mass = (typeof opt.mass === 'undefined') ? width * height * depth : opt.mass;
    
};

const Body$6 = function( mesh, opt ){
    opt = opt || {};
    PhysicsBody.call( this, mesh, opt );
    _make$5.call( this, mesh, opt );
    
};
Body$6.prototype = Object.assign({}, PhysicsBody.prototype, {
    constructor : Body$6
});

Body$6.addPhysics = function( mesh, opt ){
    mesh.physicsBody = new Body$6( mesh, opt );
    if ( mesh.parent && mesh.parent.type === "Scene" ) {
        mesh.parent.dispatchEvent({type:"physicsBodyAdded", object:mesh});
    }
};


// Physijs.ConvexMesh
class ConvexMesh extends Mesh$1 { 
    constructor ( geometry, material, mass ) {

    super( geometry, material, mass );
    _make$5.call( this, this, { mass: mass } );
    }
}

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const _make$4 = function( mesh, opt ){

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

const Body$5 = function( mesh, opt ){
    opt = opt || {};
    PhysicsBody.call( this, mesh, opt );
    _make$4.call( this, mesh, opt );
};
Body$5.prototype = Object.assign({}, PhysicsBody.prototype, {
    constructor : Body$5
});

Body$5.addPhysics = function( mesh, opt ){
    mesh.physicsBody = new Body$5( mesh, opt );
    if ( mesh.parent && mesh.parent.type ==="Scene" ) {
        mesh.parent.dispatchEvent({type:"physicsBodyAdded", object:mesh});
    }
};

// Physijs.ConeMesh
class ConeMesh extends Mesh$1 {
    constructor (geometry, material, mass ) {
        
        super( geometry, material, mass );
        _make$4.call( this, this, { mass: mass } );
    }
}

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const _make$3 = function( mesh, opt ){
    let geometry = mesh.geometry;

    if ( !geometry.boundingBox ) {
            geometry.computeBoundingBox();
    }

    let width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    let height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;

    this._physijs.type = 'plane';
    this._physijs.normal = geometry.faces[0].normal.clone();
    this._physijs.mass = (typeof opt.mass === 'undefined') ? width * height : opt.mass;
};

const Body$4 = function( mesh, opt ){
    opt = opt || {};
    PhysicsBody.call( this, mesh, opt );
    _make$3.call( this, mesh, opt );
};
Body$4.prototype = Object.assign( Object.create( PhysicsBody.prototype ), {
    constructor : Body$4
});

Body$4.addPhysics = function( mesh, opt ) {
    opt = opt || {};
    PhysicsBody.call( this, mesh, opt );
    _make$3.call( this, mesh, opt );
    
};

// Physijs.PlaneMesh
class PlaneMesh extends Mesh$1 {
    constructor ( geometry, material, mass ) {
        super( geometry, material, mass );
        _make$3.call( this, this, { mass: mass } );
    }
}

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const Body$3 = function( mesh, opt ){
    
    switch ( mesh.geometry.type ) 
    {
        case "SphereGeometry":
        case "SphereBufferGeometry":
            // Sphere                 
            Body$8.call( this, mesh, opt );
            break;

        case "BoxGeometry":
        case "BoxBufferGeometry":
            // Box
            Body$9.call( this, mesh, opt );
            break;

        case "CylinderGeometry":
            // Cylinder
            Body$7.call( this, mesh, opt );
            break;
        
        case "ConeGeometry":
            // Cylinder
            Body$5.call( this, mesh, opt );
            break;
            

        case "ConvexGeometry":
        case "OctahedronGeometry":
        case "TorusKnotGeometry":
            Body$6.call( this, mesh, opt );
            break;

        case "PlaneBufferGeometry":
            Body$4.call( this, mesh, opt );
            break;

        default:
            // Cone
            console.log("PhysicWorld::unkown type of geometry: ", p );
            //shape = PhysicWorld.createConvexHullPhysicsShape( mesh.geometry.vertices );

            break;
    }
};
Body$3.addPhysics = function( mesh, opt ) {
        
    if ( mesh instanceof Array ){
        let i;
        for( i in mesh ){ 
            if ( mesh[i].userData.physics ) Body$3.addPhysics( mesh[i] );
        }
        return;
    }
    
    if ( !mesh instanceof THREE.Mesh ) {
        return;
    }

    switch ( mesh.geometry.type ) 
    {
        case "SphereGeometry":
        case "SphereBufferGeometry":
            // Sphere                 
            Body$8.addPhysics( mesh, opt );
            break;

        case "BoxGeometry":
        case "BoxBufferGeometry":
            // Box
            Body$9.addPhysics( mesh, opt );
            break;

        case "CylinderGeometry":
            // Cylinder
            Body$7.addPhysics( mesh, opt );
            break;
        
        case "ConeGeometry":
            // Cylinder
            Body$5.addPhysics( mesh, opt );
            break;
            

        case "ConvexGeometry":
        case "OctahedronGeometry":
        case "TorusKnotGeometry":
            Body$6.addPhysics( mesh, opt );
            break;

        case "PlaneBufferGeometry":
        case "PlaneGeometry":
            Body$4.addPhysics( mesh, opt );
            break;

        default:
            // Cone
            opt.size || mesh.height * 5;
            console.log("PhysicWorld::unkown type of geometry: ", mesh );
            //shape = PhysicWorld.createConvexHullPhysicsShape( mesh.geometry.vertices );

            break;
    }
};



const Mesh = function( geometry, material, mass ){
    THREE.Mesh.call( this, geometry, material );
};
Mesh.prototype = Object.create( THREE.Mesh.prototype );
Mesh.prototype.constructor = Mesh;

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const _make$2 = function( mesh, opt ){
    let geometry = mesh.geometry;
    
    this._physijs.type   = 'heightfield';
    this._physijs.xsize  = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    this._physijs.ysize  = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
    this._physijs.xpts = (typeof opt.xdiv === 'undefined') ? Math.sqrt(geometry.vertices.length) : opt.xdiv + 1;
    this._physijs.ypts = (typeof opt.ydiv === 'undefined') ? Math.sqrt(geometry.vertices.length) : opt.ydiv + 1;
    // note - this assumes our plane geometry is square, unless we pass in specific xdiv and ydiv
    this._physijs.absMaxHeight = Math.max(geometry.boundingBox.max.z,Math.abs(geometry.boundingBox.min.z));

    var points = [];

    let a, b;
    for ( let i = 0; i < geometry.vertices.length; i++ ) {

            a = i % this._physijs.xpts;
            b = Math.round( ( i / this._physijs.xpts ) - ( (i % this._physijs.xpts) / this._physijs.xpts ) );
            points[i] = geometry.vertices[ a + ( ( this._physijs.ypts - b - 1 ) * this._physijs.ypts ) ].z;

            //points[i] = geometry.vertices[i];
    }

    this._physijs.points = points;
};

const Body$2 = function( mesh, opt ){
    PhysicsBody.call( this, mesh, opt );
    _make$2.call( this, mesh, opt );
};
Body$2.prototype = Object.assign({}, PhysicsBody.prototype, {
    constructor : Body$2
});

Body$2.addPhysics = function( mesh, opt ){
    PhysicsBody.add( Body$2, mesh, opt );
};

// Physijs.HeightfieldMesh
const HeightfieldMesh = function ( geometry, material, mass, xdiv, ydiv) {

    Mesh$1.call( this, geometry, material, mass );
    _make$2.call( this, this, { mass: mass, xdiv:xdiv, ydiv:ydiv } );
        
};
HeightfieldMesh.prototype = Object.create( Mesh$1.prototype );
HeightfieldMesh.prototype.constructor = HeightfieldMesh;

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const _make$1 = function( mesh, opt ){
    
    let geometry = mesh.geometry;

    if ( !geometry.boundingBox ) {
            geometry.computeBoundingBox();
    }

    let width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    let height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
    let depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;

    this._physijs.type = 'capsule';
    this._physijs.radius = Math.max(width / 2, depth / 2);
    this._physijs.height = height;
    this._physijs.mass = (typeof opt.mass === 'undefined') ? width * height * depth : opt.mass;
};

const Body$1 = function( mesh, opt ){
    opt = opt || {};
    PhysicsBody.call( this, mesh, opt );
    _make$1.call( this, mesh, opt );
};
Body$1.prototype = Object.assign({}, PhysicsBody.prototype, {
    constructor : Body$1
});
Body$1.addPhysics = function( mesh, opt ){
    if ( mesh.parent && mesh.parent.type === "Scene" ) {
        mesh.parent.dispatchEvent({type:"physicsBodyAdded", object:mesh});
    }
};

// Physijs.CapsuleMesh
class CapsuleMesh extends Mesh$1 { 
    constructor ( geometry, material, mass ) {
        
        Mesh$1.call( this, geometry, material, mass );
        _make$1.call( this, this, {mass:mass} );
        
        if ( !geometry.boundingBox ) {
                geometry.computeBoundingBox();
        }
    }
}

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// Physijs.ConcaveMesh
let ConcaveMesh = function( geometry, material, mass ) {
        var i,
                width, height, depth,
                vertices, face, triangles = [];

        Mesh$1.call( this, geometry, material, mass );

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
ConcaveMesh.prototype = Object.assign( Object.create( Mesh$1.prototype ), {
        constructor : ConcaveMesh
});

/**
 * @author mrdoob / http://mrdoob.com/
 */

let BufferGeometryUtils = {

	computeTangents: function ( geometry ) {

		var index = geometry.index;
		var attributes = geometry.attributes;

		// based on http://www.terathon.com/code/tangent.html
		// (per vertex tangents)

		if ( index === null ||
			 attributes.position === undefined ||
			 attributes.normal === undefined ||
			 attributes.uv === undefined ) {

			console.warn( 'THREE.BufferGeometry: Missing required attributes (index, position, normal or uv) in BufferGeometry.computeTangents()' );
			return;

		}

		var indices = index.array;
		var positions = attributes.position.array;
		var normals = attributes.normal.array;
		var uvs = attributes.uv.array;

		var nVertices = positions.length / 3;

		if ( attributes.tangent === undefined ) {

			geometry.addAttribute( 'tangent', new THREE.BufferAttribute( new Float32Array( 4 * nVertices ), 4 ) );

		}

		var tangents = attributes.tangent.array;

		var tan1 = [], tan2 = [];

		for ( var i = 0; i < nVertices; i ++ ) {

			tan1[ i ] = new THREE.Vector3();
			tan2[ i ] = new THREE.Vector3();

		}

		var vA = new THREE.Vector3(),
			vB = new THREE.Vector3(),
			vC = new THREE.Vector3(),

			uvA = new THREE.Vector2(),
			uvB = new THREE.Vector2(),
			uvC = new THREE.Vector2(),

			sdir = new THREE.Vector3(),
			tdir = new THREE.Vector3();

		function handleTriangle( a, b, c ) {

			vA.fromArray( positions, a * 3 );
			vB.fromArray( positions, b * 3 );
			vC.fromArray( positions, c * 3 );

			uvA.fromArray( uvs, a * 2 );
			uvB.fromArray( uvs, b * 2 );
			uvC.fromArray( uvs, c * 2 );

			var x1 = vB.x - vA.x;
			var x2 = vC.x - vA.x;

			var y1 = vB.y - vA.y;
			var y2 = vC.y - vA.y;

			var z1 = vB.z - vA.z;
			var z2 = vC.z - vA.z;

			var s1 = uvB.x - uvA.x;
			var s2 = uvC.x - uvA.x;

			var t1 = uvB.y - uvA.y;
			var t2 = uvC.y - uvA.y;

			var r = 1.0 / ( s1 * t2 - s2 * t1 );

			sdir.set(
				( t2 * x1 - t1 * x2 ) * r,
				( t2 * y1 - t1 * y2 ) * r,
				( t2 * z1 - t1 * z2 ) * r
			);

			tdir.set(
				( s1 * x2 - s2 * x1 ) * r,
				( s1 * y2 - s2 * y1 ) * r,
				( s1 * z2 - s2 * z1 ) * r
			);

			tan1[ a ].add( sdir );
			tan1[ b ].add( sdir );
			tan1[ c ].add( sdir );

			tan2[ a ].add( tdir );
			tan2[ b ].add( tdir );
			tan2[ c ].add( tdir );

		}

		var groups = geometry.groups;

		if ( groups.length === 0 ) {

			groups = [ {
				start: 0,
				count: indices.length
			} ];

		}

		for ( var i = 0, il = groups.length; i < il; ++ i ) {

			var group = groups[ i ];

			var start = group.start;
			var count = group.count;

			for ( var j = start, jl = start + count; j < jl; j += 3 ) {

				handleTriangle(
					indices[ j + 0 ],
					indices[ j + 1 ],
					indices[ j + 2 ]
				);

			}

		}

		var tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
		var n = new THREE.Vector3(), n2 = new THREE.Vector3();
		var w, t, test;

		function handleVertex( v ) {

			n.fromArray( normals, v * 3 );
			n2.copy( n );

			t = tan1[ v ];

			// Gram-Schmidt orthogonalize

			tmp.copy( t );
			tmp.sub( n.multiplyScalar( n.dot( t ) ) ).normalize();

			// Calculate handedness

			tmp2.crossVectors( n2, t );
			test = tmp2.dot( tan2[ v ] );
			w = ( test < 0.0 ) ? - 1.0 : 1.0;

			tangents[ v * 4 ] = tmp.x;
			tangents[ v * 4 + 1 ] = tmp.y;
			tangents[ v * 4 + 2 ] = tmp.z;
			tangents[ v * 4 + 3 ] = w;

		}

		for ( var i = 0, il = groups.length; i < il; ++ i ) {

			var group = groups[ i ];

			var start = group.start;
			var count = group.count;

			for ( var j = start, jl = start + count; j < jl; j += 3 ) {

				handleVertex( indices[ j + 0 ] );
				handleVertex( indices[ j + 1 ] );
				handleVertex( indices[ j + 2 ] );

			}

		}

	},

	/**
	 * @param  {Array<THREE.BufferGeometry>} geometries
	 * @param  {Boolean} useGroups
	 * @return {THREE.BufferGeometry}
	 */
	mergeBufferGeometries: function ( geometries, useGroups ) {

		var isIndexed = geometries[ 0 ].index !== null;

		var attributesUsed = new Set( Object.keys( geometries[ 0 ].attributes ) );
		var morphAttributesUsed = new Set( Object.keys( geometries[ 0 ].morphAttributes ) );

		var attributes = {};
		var morphAttributes = {};

		var mergedGeometry = new THREE.BufferGeometry();

		var offset = 0;

		for ( var i = 0; i < geometries.length; ++ i ) {

			var geometry = geometries[ i ];

			// ensure that all geometries are indexed, or none

			if ( isIndexed !== ( geometry.index !== null ) ) return null;

			// gather attributes, exit early if they're different

			for ( var name in geometry.attributes ) {

				if ( ! attributesUsed.has( name ) ) return null;

				if ( attributes[ name ] === undefined ) attributes[ name ] = [];

				attributes[ name ].push( geometry.attributes[ name ] );

			}

			// gather morph attributes, exit early if they're different

			for ( var name in geometry.morphAttributes ) {

				if ( ! morphAttributesUsed.has( name ) ) return null;

				if ( morphAttributes[ name ] === undefined ) morphAttributes[ name ] = [];

				morphAttributes[ name ].push( geometry.morphAttributes[ name ] );

			}

			// gather .userData

			mergedGeometry.userData.mergedUserData = mergedGeometry.userData.mergedUserData || [];
			mergedGeometry.userData.mergedUserData.push( geometry.userData );

			if ( useGroups ) {

				var count;

				if ( isIndexed ) {

					count = geometry.index.count;

				} else if ( geometry.attributes.position !== undefined ) {

					count = geometry.attributes.position.count;

				} else {

					return null;

				}

				mergedGeometry.addGroup( offset, count, i );

				offset += count;

			}

		}

		// merge indices

		if ( isIndexed ) {

			var indexOffset = 0;
			var mergedIndex = [];

			for ( var i = 0; i < geometries.length; ++ i ) {

				var index = geometries[ i ].index;

				for ( var j = 0; j < index.count; ++ j ) {

					mergedIndex.push( index.getX( j ) + indexOffset );

				}

				indexOffset += geometries[ i ].attributes.position.count;

			}

			mergedGeometry.setIndex( mergedIndex );

		}

		// merge attributes

		for ( var name in attributes ) {

			var mergedAttribute = this.mergeBufferAttributes( attributes[ name ] );

			if ( ! mergedAttribute ) return null;

			mergedGeometry.addAttribute( name, mergedAttribute );

		}

		// merge morph attributes

		for ( var name in morphAttributes ) {

			var numMorphTargets = morphAttributes[ name ][ 0 ].length;

			if ( numMorphTargets === 0 ) break;

			mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
			mergedGeometry.morphAttributes[ name ] = [];

			for ( var i = 0; i < numMorphTargets; ++ i ) {

				var morphAttributesToMerge = [];

				for ( var j = 0; j < morphAttributes[ name ].length; ++ j ) {

					morphAttributesToMerge.push( morphAttributes[ name ][ j ][ i ] );

				}

				var mergedMorphAttribute = this.mergeBufferAttributes( morphAttributesToMerge );

				if ( ! mergedMorphAttribute ) return null;

				mergedGeometry.morphAttributes[ name ].push( mergedMorphAttribute );

			}

		}

		return mergedGeometry;

	},

	/**
	 * @param {Array<THREE.BufferAttribute>} attributes
	 * @return {THREE.BufferAttribute}
	 */
	mergeBufferAttributes: function ( attributes ) {

		var TypedArray;
		var itemSize;
		var normalized;
		var arrayLength = 0;

		for ( var i = 0; i < attributes.length; ++ i ) {

			var attribute = attributes[ i ];

			if ( attribute.isInterleavedBufferAttribute ) return null;

			if ( TypedArray === undefined ) TypedArray = attribute.array.constructor;
			if ( TypedArray !== attribute.array.constructor ) return null;

			if ( itemSize === undefined ) itemSize = attribute.itemSize;
			if ( itemSize !== attribute.itemSize ) return null;

			if ( normalized === undefined ) normalized = attribute.normalized;
			if ( normalized !== attribute.normalized ) return null;

			arrayLength += attribute.array.length;

		}

		var array = new TypedArray( arrayLength );
		var offset = 0;

		for ( var i = 0; i < attributes.length; ++ i ) {

			array.set( attributes[ i ].array, offset );

			offset += attributes[ i ].array.length;

		}

		return new THREE.BufferAttribute( array, itemSize, normalized );

	},

	/**
	 * @param {Array<THREE.BufferAttribute>} attributes
	 * @return {Array<THREE.InterleavedBufferAttribute>}
	 */
	interleaveAttributes: function ( attributes ) {

		// Interleaves the provided attributes into an InterleavedBuffer and returns
		// a set of InterleavedBufferAttributes for each attribute
		var TypedArray;
		var arrayLength = 0;
		var stride = 0;

		// calculate the the length and type of the interleavedBuffer
		for ( var i = 0, l = attributes.length; i < l; ++ i ) {

			var attribute = attributes[ i ];

			if ( TypedArray === undefined ) TypedArray = attribute.array.constructor;
			if ( TypedArray !== attribute.array.constructor ) {

				console.warn( 'AttributeBuffers of different types cannot be interleaved' );
				return null;

			}

			arrayLength += attribute.array.length;
			stride += attribute.itemSize;

		}

		// Create the set of buffer attributes
		var interleavedBuffer = new THREE.InterleavedBuffer( new TypedArray( arrayLength ), stride );
		var offset = 0;
		var res = [];
		var getters = [ 'getX', 'getY', 'getZ', 'getW' ];
		var setters = [ 'setX', 'setY', 'setZ', 'setW' ];

		for ( var j = 0, l = attributes.length; j < l; j ++ ) {

			var attribute = attributes[ j ];
			var itemSize = attribute.itemSize;
			var count = attribute.count;
			var iba = new THREE.InterleavedBufferAttribute( interleavedBuffer, itemSize, offset, attribute.normalized );
			res.push( iba );

			offset += itemSize;

			// Move the data for each attribute into the new interleavedBuffer
			// at the appropriate offset
			for ( var c = 0; c < count; c ++ ) {

				for ( var k = 0; k < itemSize; k ++ ) {

					iba[ setters[ k ] ]( c, attribute[ getters[ k ] ]( c ) );

				}

			}

		}

		return res;

	},

	/**
	 * @param {Array<THREE.BufferGeometry>} geometry
	 * @return {number}
	 */
	estimateBytesUsed: function ( geometry ) {

		// Return the estimated memory used by this geometry in bytes
		// Calculate using itemSize, count, and BYTES_PER_ELEMENT to account
		// for InterleavedBufferAttributes.
		var mem = 0;
		for ( var name in geometry.attributes ) {

			var attr = geometry.getAttribute( name );
			mem += attr.count * attr.itemSize * attr.array.BYTES_PER_ELEMENT;

		}

		var indices = geometry.getIndex();
		mem += indices ? indices.count * indices.itemSize * indices.array.BYTES_PER_ELEMENT : 0;
		return mem;

	},

	/**
	 * @param {THREE.BufferGeometry} geometry
	 * @param {number} tolerance
	 * @return {THREE.BufferGeometry>}
	 */
	mergeVertices: function ( geometry, tolerance = 1e-4 ) {

		tolerance = Math.max( tolerance, Number.EPSILON );

		// Generate an index buffer if the geometry doesn't have one, or optimize it
		// if it's already available.
		var hashToIndex = {};
		var indices = geometry.getIndex();
		var positions = geometry.getAttribute( 'position' );
		var vertexCount = indices ? indices.count : positions.count;

		// next value for triangle indices
		var nextIndex = 0;

		// attributes and new attribute arrays
		var attributeNames = Object.keys( geometry.attributes );
		var attrArrays = {};
		var morphAttrsArrays = {};
		var newIndices = [];
		var getters = [ 'getX', 'getY', 'getZ', 'getW' ];

		// initialize the arrays
		for ( var i = 0, l = attributeNames.length; i < l; i ++ ) {
			var name = attributeNames[ i ];

			attrArrays[ name ] = [];

			var morphAttr = geometry.morphAttributes[ name ];
			if ( morphAttr ) {

				morphAttrsArrays[ name ] = new Array( morphAttr.length ).fill().map( () => [] );

			}

		}

		// convert the error tolerance to an amount of decimal places to truncate to
		var decimalShift = Math.log10( 1 / tolerance );
		var shiftMultiplier = Math.pow( 10, decimalShift );
		for ( var i = 0; i < vertexCount; i ++ ) {

			var index = indices ? indices.getX( i ) : i;

			// Generate a hash for the vertex attributes at the current index 'i'
			var hash = '';
			for ( var j = 0, l = attributeNames.length; j < l; j ++ ) {

				var name = attributeNames[ j ];
				var attribute = geometry.getAttribute( name );
				var itemSize = attribute.itemSize;

				for ( var k = 0; k < itemSize; k ++ ) {

					// double tilde truncates the decimal value
					hash += `${ ~ ~ ( attribute[ getters[ k ] ]( index ) * shiftMultiplier ) },`;

				}

			}

			// Add another reference to the vertex if it's already
			// used by another index
			if ( hash in hashToIndex ) {

				newIndices.push( hashToIndex[ hash ] );

			} else {

				// copy data to the new index in the attribute arrays
				for ( var j = 0, l = attributeNames.length; j < l; j ++ ) {

					var name = attributeNames[ j ];
					var attribute = geometry.getAttribute( name );
					var morphAttr = geometry.morphAttributes[ name ];
					var itemSize = attribute.itemSize;
					var newarray = attrArrays[ name ];
					var newMorphArrays = morphAttrsArrays[ name ];

					for ( var k = 0; k < itemSize; k ++ ) {

						var getterFunc = getters[ k ];
						newarray.push( attribute[ getterFunc ]( index ) );

						if ( morphAttr ) {

							for ( var m = 0, ml = morphAttr.length; m < ml; m ++ ) {

								newMorphArrays[ m ].push( morphAttr[ m ][ getterFunc ]( index ) );

							}

						}

					}

				}

				hashToIndex[ hash ] = nextIndex;
				newIndices.push( nextIndex );
				nextIndex ++;

			}

		}

		// Generate typed arrays from new attribute arrays and update
		// the attributeBuffers
		const result = geometry.clone();
		for ( var i = 0, l = attributeNames.length; i < l; i ++ ) {

			var name = attributeNames[ i ];
			var oldAttribute = geometry.getAttribute( name );
			var attribute;

			var buffer = new oldAttribute.array.constructor( attrArrays[ name ] );
			if ( oldAttribute.isInterleavedBufferAttribute ) {

				attribute = new THREE.BufferAttribute( buffer, oldAttribute.itemSize, oldAttribute.itemSize );

			} else {

				attribute = geometry.getAttribute( name ).clone();
				attribute.setArray( buffer );

			}

			result.addAttribute( name, attribute );

			// Update the attribute arrays
			if ( name in morphAttrsArrays ) {

				for ( var j = 0; j < morphAttrsArrays[ name ].length; j ++ ) {

					var morphAttribute = geometry.morphAttributes[ name ][ j ].clone();
					morphAttribute.setArray( new morphAttribute.array.constructor( morphAttrsArrays[ name ][ j ] ) );
					result.morphAttributes[ name ][ j ] = morphAttribute;

				}

			}

		}

		// Generate an index buffer typed array
		var cons = Uint8Array;
		if ( newIndices.length >= Math.pow( 2, 8 ) ) cons = Uint16Array;
		if ( newIndices.length >= Math.pow( 2, 16 ) ) cons = Uint32Array;

		var newIndexBuffer = new cons( newIndices );
		var newIndices = null;
		if ( indices === null ) {

			newIndices = new THREE.BufferAttribute( newIndexBuffer, 1 );

		} else {

			newIndices = geometry.getIndex().clone();
			newIndices.setArray( newIndexBuffer );

		}

		result.setIndex( newIndices );

		return result;

	}

};

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

let _make = function( mesh, opt ){
    let obj = processGeometry( mesh.geometry );
    
    this._physijs.type = 'soft';
    this._physijs.ammoVertices = obj.ammoVertices;
    this._physijs.ammoIndices = obj.ammoIndices;
    this._physijs.ammoIndexAssociation = obj.ammoIndexAssociation; 
    this._physijs.mass = opt.mass;
    this._physijs.pressure = opt.pressure;
  
};

let Body = function( mesh, opt ){
    const mass = opt.mass || null;
    PhysicsBody.call( this, mesh, opt );
    _make.call( this, mesh, { mass: mass, pressure: opt.pressure } );
};

Body.prototype = Object.assign({}, PhysicsBody.prototype, {
    constructor : Body
});

Body.addPhysics = function( mesh, opt ){
    PhysicsBody.add( Body, mesh, opt );
};

function isEqual( x1, y1, z1, x2, y2, z2 ) {
    const delta = 0.000001;
    return Math.abs( x2 - x1 ) < delta 
            && Math.abs( y2 - y1 ) < delta 
            && Math.abs( z2 - z1 ) < delta;
}

function processGeometry( bufGeometry ) {
    // Ony consider the position values when merging the vertices
    let posOnlyBufGeometry = new THREE.BufferGeometry();
    posOnlyBufGeometry.addAttribute( 'position', bufGeometry.getAttribute( 'position' ) );
    posOnlyBufGeometry.setIndex( bufGeometry.getIndex() );
    
    // Merge the vertices so the triangle soup is converted to indexed triangles
    let indexedBufferGeom = BufferGeometryUtils.mergeVertices( posOnlyBufGeometry );
    
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

    let association, i3, j3;

    for ( let i = 0; i < numIdxVertices; i ++ ) {
        association = [];
        ret.ammoIndexAssociation.push( association );
        i3 = i * 3;

        for ( let j = 0; j < numVertices; j ++ ) {
            j3 = j * 3;
            if ( isEqual( idxVertices[ i3 ], idxVertices[ i3 + 1 ], idxVertices[ i3 + 2 ],
                    vertices[ j3 ], vertices[ j3 + 1 ], vertices[ j3 + 2 ] ) ) {
                    association.push( j3 );
            }
        }
    }
    return ret;
}

let SoftMesh = function( geometry, material, mass, pressure ){
    
    Mesh$1.call( this, geometry, material, mass );
    _make.call( this, this, { mass: mass, pressure: pressure } );
    
    
    //var volume = new THREE.Mesh( bufferGeom, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
    //volume.frustumCulled = false;
};

SoftMesh.prototype = Object.assign( Object.create( Mesh$1.prototype ), { 
    constructor : SoftMesh 
}); 

AddPhysics.updateFunctions._updateSoftBodies = function( data ){
            
    const length = data[1];

    let object;
    let numVerts;

    let offset =2;

    for ( let i = 0, il = length; i < il; i ++ ) {

        object = this._objects[ data[offset] ];
        offset += 1;


        let volumePositions = object.geometry.attributes.position.array;
        let volumeNormals = object.geometry.attributes.normal.array;
        let association = object._physijs.ammoIndexAssociation;
        let assocVertex, indexVertex;

        numVerts = data[offset];

        for ( let j = 0; j < numVerts; j ++ ) {
            assocVertex = association[ j ];

            for ( let k = 0, kl = assocVertex.length; k < kl; k ++ ) {

                indexVertex = assocVertex[ k ];
                volumePositions[ indexVertex ] = data[offset+1];
                volumeNormals[ indexVertex ] = data[offset+4];
                
                indexVertex++;
                volumePositions[ indexVertex ] = data[offset+2];
                volumeNormals[ indexVertex ] = data[offset+5];
                
                indexVertex++;
                volumePositions[ indexVertex ] = data[offset+3];
                volumeNormals[ indexVertex ] = data[offset+6];

            }
            offset += 6;
        }
        offset += 1;

        object.geometry.attributes.position.needsUpdate = true;
        object.geometry.attributes.normal.needsUpdate = true;
    }
            
 };

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// Physijs.createMaterial
const createMaterial = function( material, friction, restitution ) {
        let physijs_material = function(){};
        
        physijs_material.prototype = material;
        physijs_material = new physijs_material();

        physijs_material._physijs = {
                id: material.id,
                friction: friction === undefined ? .8 : friction,
                restitution: restitution === undefined ? .2 : restitution
        };

        return physijs_material;
};

let _Physijs = window.Physijs; // used for noConflict method

// object assigned to window.Physijs
let Physijs$1 = { 
        scripts : {},
        Scene : Scene,
        PhysicsWorld : PhysicsWorld,
        
        // Constraints
        DOFConstraint : DOFConstraint,
        PointConstraint : PointConstraint,
        SliderConstraint : SliderConstraint,
        HingeConstraint : HingeConstraint,
        ConeTwistConstraint : ConeTwistConstraint,
        
        Mesh : Mesh$1,
        ObjectMesh : Mesh,
        ObjectBody : Body$3,
        
        //bodies
        BoxMesh : BoxMesh,
        BoxBody : Body$9,
        CapsuleMesh : CapsuleMesh,
        CapsuleBody : Body$1,
        ConeMesh : ConeMesh,
        ConeBody : Body$5,
        ConvexMesh : ConvexMesh,
        ConvexBody : Body$6,
        CylinderMesh : CylinderMesh,
        CylinderBody : Body$7,
        HeightfieldMesh : HeightfieldMesh,
        HeightfieldBody : Body$2,
        PlaneMesh : PlaneMesh,
        PlaneBody : Body$4,
        SphereMesh : SphereMesh,
        SphereBody : Body$8,
        SoftMesh : SoftMesh,
        SoftBody : Body,
        
        Vehicle : Vehicle,
        VehicleTuning : VehicleTuning
    }; 

    Physijs$1.ConcaveMesh = ConcaveMesh;

    Physijs$1.PhysicsWorld.scripts = Physijs$1.scripts;
    Physijs$1.createMaterial = createMaterial;

    // Physijs.noConflict
    Physijs$1.noConflict = function() {
            window.Physijs = _Physijs;
            return Physijs$1;
    };

export { Physijs$1 as Physijs, createMaterial, Physijs$1 as default };
