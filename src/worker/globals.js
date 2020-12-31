'use strict';

var
	transferableMessage = self.webkitPostMessage || self.postMessage,

	// enum
	MESSAGE_TYPES = {
		WORLDREPORT: 0,
		COLLISIONREPORT: 1,
		VEHICLEREPORT: 2,
		CONSTRAINTREPORT: 3
	},

	// temp variables
	_object,
	_vector,
	_transform,
        knownConstraints = {},

	// functions
	public_functions = {},
	
	createShape,
	reportWorld,
	
	reportCollisions,

	// world variables
	fixedTimeStep, // used when calling stepSimulation
	rateLimit, // sets whether or not to sync the simulation rate with fixedTimeStep
	last_simulation_time,
	last_simulation_duration = 0,
	world,
	transform,
	_vec3_1,
	_vec3_2,
	_vec3_3,
	_quat,
	// private cache
	_objects = {},
	
	
	_materials = {},
	_objects_ammo = {},
	_num_objects = 0,
	
	
	_object_shapes = {},

	// The following objects are to track objects that ammo.js doesn't clean
	// up. All are cleaned up when they're corresponding body is destroyed.
	// Unfortunately, it's very difficult to get at these objects from the
	// body, so we have to track them ourselves.
	_motion_states = {},
	// Don't need to worry about it for cached shapes.
    _noncached_shapes = {},
	// A body with a compound shape always has a regular shape as well, so we
	// have track them separately.
    _compound_shapes = {},

	// object reporting
	REPORT_CHUNKSIZE, // report array is increased in increments of this chunk size

	WORLDREPORT_ITEMSIZE = 14, // how many float values each reported item needs
	worldreport,

	COLLISIONREPORT_ITEMSIZE = 5, // one float for each object id, and a Vec3 contact normal
	collisionreport,

	VEHICLEREPORT_ITEMSIZE = 9, // vehicle id, wheel index, 3 for position, 4 for rotation
	vehiclereport,

	CONSTRAINTREPORT_ITEMSIZE = 6, // constraint id, offset object, offset, applied impulse
	constraintreport;

var ab = new ArrayBuffer( 1 );

transferableMessage( ab, [ab] );
var SUPPORT_TRANSFERABLE = ( ab.byteLength === 0 );



public_functions.registerMaterial = function( description ) {
	_materials[ description.id ] = description;
};

public_functions.unRegisterMaterial = function( description ) {
	delete _materials[ description.id ];
};

public_functions.setFixedTimeStep = function( description ) {
	fixedTimeStep = description;
};


public_functions.updateTransform = function( details ) {
	_object = _objects[details.id];
	_object.getMotionState().getWorldTransform( _transform );

	if ( details.pos ) {
		_vec3_1.setX(details.pos.x);
		_vec3_1.setY(details.pos.y);
		_vec3_1.setZ(details.pos.z);
		_transform.setOrigin(_vec3_1);
	}

	if ( details.quat ) {
		_quat.setX(details.quat.x);
		_quat.setY(details.quat.y);
		_quat.setZ(details.quat.z);
		_quat.setW(details.quat.w);
		_transform.setRotation(_quat);
	}

	_object.setWorldTransform( _transform );
	_object.activate();
};


public_functions.applyTorque = function ( details ) {

	_vec3_1.setX(details.torque_x);
	_vec3_1.setY(details.torque_y);
	_vec3_1.setZ(details.torque_z);

	_objects[details.id].applyTorque(
		_vec3_1
	);
	_objects[details.id].activate();
};

public_functions.applyCentralForce = function ( details ) {

	_vec3_1.setX(details.x);
	_vec3_1.setY(details.y);
	_vec3_1.setZ(details.z);

	_objects[details.id].applyCentralForce(_vec3_1);
	_objects[details.id].activate();
};

public_functions.applyForce = function ( details ) {

	_vec3_1.setX(details.force_x);
	_vec3_1.setY(details.force_y);
	_vec3_1.setZ(details.force_z);

	_vec3_2.setX(details.x);
	_vec3_2.setY(details.y);
	_vec3_2.setZ(details.z);

	_objects[details.id].applyForce(
		_vec3_1,
		_vec3_2
	);
	_objects[details.id].activate();
};

public_functions.onSimulationResume = function( params ) {
	last_simulation_time = Date.now();
};

public_functions.setAngularVelocity = function ( details ) {

	_vec3_1.setX(details.x);
	_vec3_1.setY(details.y);
	_vec3_1.setZ(details.z);

	_objects[details.id].setAngularVelocity(
		_vec3_1
	);
	_objects[details.id].activate();
};

public_functions.setLinearVelocity = function ( details ) {

	_vec3_1.setX(details.x);
	_vec3_1.setY(details.y);
	_vec3_1.setZ(details.z);

	_objects[details.id].setLinearVelocity(
		_vec3_1
	);
	_objects[details.id].activate();
};

public_functions.setAngularFactor = function ( details ) {

	_vec3_1.setX(details.x);
	_vec3_1.setY(details.y);
	_vec3_1.setZ(details.z);

	_objects[details.id].setAngularFactor(
			_vec3_1
	);
};

public_functions.setLinearFactor = function ( details ) {

	_vec3_1.setX(details.x);
	_vec3_1.setY(details.y);
	_vec3_1.setZ(details.z);

	_objects[details.id].setLinearFactor(
		_vec3_1
	);
};

public_functions.setDamping = function ( details ) {
	_objects[details.id].setDamping( details.linear, details.angular );
};

public_functions.setCcdMotionThreshold = function ( details ) {
	_objects[details.id].setCcdMotionThreshold( details.threshold );
};

public_functions.setCcdSweptSphereRadius = function ( details ) {
	_objects[details.id].setCcdSweptSphereRadius( details.radius );
};



public_functions.simulate = function simulate( params ) { 
    if ( world ) {
        params = params || {};

        if ( !params.timeStep ) {
                if ( last_simulation_time ) {
                        params.timeStep = 0;
                        while ( params.timeStep + last_simulation_duration <= fixedTimeStep ) {
                                params.timeStep = ( Date.now() - last_simulation_time ) / 1000; // time since last simulation
                        }
                } else {
                        params.timeStep = fixedTimeStep; // handle first frame
                }
        } else {
                if ( params.timeStep < fixedTimeStep ) {
                        params.timeStep = fixedTimeStep;
                }
        }

        params.maxSubSteps = params.maxSubSteps || Math.ceil( params.timeStep / fixedTimeStep ); // If maxSubSteps is not defined, keep the simulation fully up to date

        last_simulation_duration = Date.now();
        world.stepSimulation( params.timeStep, params.maxSubSteps, fixedTimeStep );

        self.dispatchEvent( new CustomEvent("report", {
            detail: {
                worker: self
            }
        }) );

        last_simulation_duration = ( Date.now() - last_simulation_duration ) / 1000;
        last_simulation_time = Date.now();
    }
};

self.onmessage = function( event ) {

	if ( event.data instanceof Float32Array ) {
		// transferable object

		switch ( event.data[0] ) {
			case MESSAGE_TYPES.WORLDREPORT:
				worldreport = new Float32Array( event.data );
				break;

			case MESSAGE_TYPES.COLLISIONREPORT:
				collisionreport = new Float32Array( event.data );
				break;

			case MESSAGE_TYPES.VEHICLEREPORT:
				vehiclereport = new Float32Array( event.data );
				break;

			case MESSAGE_TYPES.CONSTRAINTREPORT:
				constraintreport = new Float32Array( event.data );
				break;
		}

		return;
	}

	if ( event.data.cmd && public_functions[event.data.cmd] ) {
		//if ( event.data.params.id !== undefined && _objects[event.data.params.id] === undefined && event.data.cmd !== 'addObject' && event.data.cmd !== 'registerMaterial' ) return;
		public_functions[event.data.cmd]( event.data.params );
	}

};
