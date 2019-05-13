/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function( self ){
    
    let public_functions = self.public_functions;
    let reportVehicles;
    let _vehicles = {};
    let _num_wheels = 0;
    let _objects = self._objects;
    
    let _vec3_1, _vec3_2, _vec3_3;

    self.addEventListener("init", function( event ){ 
        _vec3_1 = self._vec3_1 || new Ammo.btVector3(0,0,0); 
        _vec3_2 = self._vec3_2 || new Ammo.btVector3(0,0,0);
        _vec3_3 = self._vec3_3 || new Ammo.btVector3(0,0,0);
    });
    
    self.addEventListener("report", function( event ){ 
        reportVehicles();
    });

    public_functions.addVehicle = function( description ) {
            var vehicle_tuning = new Ammo.btVehicleTuning(),
                    vehicle;

            vehicle_tuning.set_m_suspensionStiffness( description.suspension_stiffness );
            vehicle_tuning.set_m_suspensionCompression( description.suspension_compression );
            vehicle_tuning.set_m_suspensionDamping( description.suspension_damping );
            vehicle_tuning.set_m_maxSuspensionTravelCm( description.max_suspension_travel );
            vehicle_tuning.set_m_maxSuspensionForce( description.max_suspension_force );

            vehicle = new Ammo.btRaycastVehicle( vehicle_tuning, _objects[ description.rigidBody ], new Ammo.btDefaultVehicleRaycaster( world ) );
            vehicle.tuning = vehicle_tuning;

            _objects[ description.rigidBody ].setActivationState( 4 );
            vehicle.setCoordinateSystem( 0, 1, 2 );

            world.addVehicle( vehicle );
            _vehicles[ description.id ] = vehicle;
    };
    public_functions.removeVehicle = function( description ) {
            delete _vehicles[ description.id ];
    };

    public_functions.addWheel = function( description ) { 
            if ( _vehicles[description.id] !== undefined ) {
                    var tuning = _vehicles[description.id].tuning;
                    if ( description.tuning !== undefined ) {
                            tuning = new Ammo.btVehicleTuning();
                            tuning.set_m_suspensionStiffness( description.tuning.suspension_stiffness );
                            tuning.set_m_suspensionCompression( description.tuning.suspension_compression );
                            tuning.set_m_suspensionDamping( description.tuning.suspension_damping );
                            tuning.set_m_maxSuspensionTravelCm( description.tuning.max_suspension_travel );
                            tuning.set_m_maxSuspensionForce( description.tuning.max_suspension_force );
                    }

                    _vec3_1.setX(description.connection_point.x);
                    _vec3_1.setY(description.connection_point.y);
                    _vec3_1.setZ(description.connection_point.z);

                    _vec3_2.setX(description.wheel_direction.x);
                    _vec3_2.setY(description.wheel_direction.y);
                    _vec3_2.setZ(description.wheel_direction.z);

                    _vec3_3.setX(description.wheel_axle.x);
                    _vec3_3.setY(description.wheel_axle.y);
                    _vec3_3.setZ(description.wheel_axle.z);

                    _vehicles[description.id].addWheel(
                            _vec3_1,
                            _vec3_2,
                            _vec3_3,
                            description.suspension_rest_length,
                            description.wheel_radius,
                            tuning,
                            description.is_front_wheel
                    );
            }

            _num_wheels++;

            if ( SUPPORT_TRANSFERABLE ) {
                    vehiclereport = new Float32Array(1 + _num_wheels * VEHICLEREPORT_ITEMSIZE); // message id & ( # of objects to report * # of values per object )
                    vehiclereport[0] = MESSAGE_TYPES.VEHICLEREPORT;
            } else {
                    vehiclereport = [ MESSAGE_TYPES.VEHICLEREPORT ];
            }
    };

    public_functions.setSteering = function( details ) {
            if ( _vehicles[details.id] !== undefined ) {
                    _vehicles[details.id].setSteeringValue( details.steering, details.wheel );
            }
    };
    public_functions.setBrake = function( details ) {
            if ( _vehicles[details.id] !== undefined ) {
                    _vehicles[details.id].setBrake( details.brake, details.wheel );
            }
    };
    public_functions.applyEngineForce = function( details ) {
            if ( _vehicles[details.id] !== undefined ) {
                    _vehicles[details.id].applyEngineForce( details.force, details.wheel );
            }
    };

    reportVehicles = function() {
            var index, vehicle,
                    transform, origin, rotation,
                    offset = 0,
                    i = 0, j = 0;

            if ( SUPPORT_TRANSFERABLE ) {
                    if ( vehiclereport.length < 2 + _num_wheels * VEHICLEREPORT_ITEMSIZE ) {
                            vehiclereport = new Float32Array(
                                    2 + // message id & # objects in report
                                    ( Math.ceil( _num_wheels / REPORT_CHUNKSIZE ) * REPORT_CHUNKSIZE ) * VEHICLEREPORT_ITEMSIZE // # of values needed * item size
                            );
                            vehiclereport[0] = MESSAGE_TYPES.VEHICLEREPORT;
                    }
            }

            for ( index in _vehicles ) {
                    if ( _vehicles.hasOwnProperty( index ) ) {
                            vehicle = _vehicles[index];

                            for ( j = 0; j < vehicle.getNumWheels(); j++ ) {

                                    //vehicle.updateWheelTransform( j, true );

                                    //transform = vehicle.getWheelTransformWS( j );
                                    transform = vehicle.getWheelInfo( j ).get_m_worldTransform();

                                    origin = transform.getOrigin();
                                    rotation = transform.getRotation();

                                    // add values to report
                                    offset = 1 + (i++) * VEHICLEREPORT_ITEMSIZE;

                                    vehiclereport[ offset ] = index;
                                    vehiclereport[ offset + 1 ] = j;

                                    vehiclereport[ offset + 2 ] = origin.x();
                                    vehiclereport[ offset + 3 ] = origin.y();
                                    vehiclereport[ offset + 4 ] = origin.z();

                                    vehiclereport[ offset + 5 ] = rotation.x();
                                    vehiclereport[ offset + 6 ] = rotation.y();
                                    vehiclereport[ offset + 7 ] = rotation.z();
                                    vehiclereport[ offset + 8 ] = rotation.w();

                            }

                    }
            }

            if ( j !== 0 ) {
                    if ( SUPPORT_TRANSFERABLE ) {
                            transferableMessage( vehiclereport.buffer, [vehiclereport.buffer] );
                    } else {
                            transferableMessage( vehiclereport );
                    }
            }
    };

})(self);