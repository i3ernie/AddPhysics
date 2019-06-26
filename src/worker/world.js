/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function( self ){
    
    let public_functions = self.public_functions;
    
    let Ammo;
    let _vec3_1, _vec3_2;
    let reportWorld;
    
    self.addEventListener("init", function( event ){ 
        Ammo = self.Ammo;
        _vec3_1 = self._vec3_1 || new Ammo.btVector3(0,0,0);
        _vec3_2 = self._vec3_2 || new Ammo.btVector3(0,0,0);
    });
    
    self.addEventListener("report", function( event ){ 
        reportWorld();
    });
    
    public_functions.setGravity = function( description ) { 
        console.log( description );
        let vecGravity = new Ammo.btVector3( description.x || 0, description.y, description.z || 0 );
	world.setGravity( vecGravity );
        try {
            world.getWorldInfo().set_m_gravity( vecGravity );
        } 
        catch( e ){
            
        }
    };
    
    public_functions.addObject = function( description ) {

	var localInertia, shape, motionState, rbInfo, body;

        shape = createShape( description );
        if (!shape) return;
        // If there are children then this is a compound shape
        if ( description.children ) {
            var compound_shape = new Ammo.btCompoundShape, _child;
            compound_shape.addChildShape( _transform, shape );

            for ( let i = 0; i < description.children.length; i++ ) {
                    _child = description.children[i];

                    var trans = new Ammo.btTransform;
                    trans.setIdentity();

                    _vec3_1.setX(_child.position_offset.x);
                    _vec3_1.setY(_child.position_offset.y);
                    _vec3_1.setZ(_child.position_offset.z);
                    trans.setOrigin(_vec3_1);

                    _quat.setX(_child.rotation.x);
                    _quat.setY(_child.rotation.y);
                    _quat.setZ(_child.rotation.z);
                    _quat.setW(_child.rotation.w);
                    trans.setRotation(_quat);

                    shape = createShape( description.children[i] );
                    compound_shape.addChildShape( trans, shape );
                    Ammo.destroy(trans);
            }

            shape = compound_shape;
            _compound_shapes[ description.id ] = shape;
	}
        
        if ( description.type === "soft" ){ 
            addSoftShape( description, shape );
        } else {
	
            _vec3_1.setX(0);
            _vec3_1.setY(0);
            _vec3_1.setZ(0);

            shape.calculateLocalInertia( description.mass, _vec3_1 );

            _transform.setIdentity();

            _vec3_2.setX( description.position.x );
            _vec3_2.setY( description.position.y );
            _vec3_2.setZ( description.position.z );
            _transform.setOrigin(_vec3_2);

            _quat.setX(description.rotation.x);
            _quat.setY(description.rotation.y);
            _quat.setZ(description.rotation.z);
            _quat.setW(description.rotation.w);
            _transform.setRotation(_quat);
            

            motionState = new Ammo.btDefaultMotionState( _transform ); // #TODO: btDefaultMotionState supports center of mass offset as second argument - implement
            rbInfo = new Ammo.btRigidBodyConstructionInfo( description.mass, motionState, shape, _vec3_1 );

            if ( description.materialId !== undefined ) {
                    rbInfo.set_m_friction( _materials[ description.materialId ].friction );
                    rbInfo.set_m_restitution( _materials[ description.materialId ].restitution );
            }

            body = new Ammo.btRigidBody( rbInfo );
            Ammo.destroy( rbInfo );
            
            if ( description.activationState ){ 
                body.setActivationState( description.activationState );
            }
        

            if ( typeof description.collision_flags !== 'undefined' ) {
                    body.setCollisionFlags( description.collision_flags );
            }

            world.addRigidBody( body );
       
            body.id = description.id;
            _objects[ body.id ] = body;
            _motion_states[ body.id ] = motionState;

            var ptr = body.a != undefined ? body.a : body.ptr;
            _objects_ammo[ptr] = body.id;
            _num_objects++;

            transferableMessage({ cmd: 'objectReady', params: body.id });
        }
    };
    
    public_functions.removeObject = function( details ) {
        if ( details.type === "soft" ){ 
            removeSoftShape( details );
        } else {
                world.removeRigidBody( _objects[details.id] );
                Ammo.destroy( _objects[details.id] );
                Ammo.destroy( _motion_states[details.id] );
            if (_compound_shapes[details.id]) Ammo.destroy(_compound_shapes[details.id]);
                if (_noncached_shapes[details.id]) Ammo.destroy(_noncached_shapes[details.id]);
                var ptr = _objects[details.id].a != undefined ? _objects[details.id].a : _objects[details.id].ptr;
                delete _objects_ammo[ptr];
                delete _objects[details.id];
                delete _motion_states[details.id];
            if (_compound_shapes[details.id]) delete _compound_shapes[details.id];
                if (_noncached_shapes[details.id]) delete _noncached_shapes[details.id];
                _num_objects--;
        }
    };
    
    reportWorld = function() {
	var index, object,
		transform, origin, rotation,
		offset = 0,
		i = 0;

	if ( SUPPORT_TRANSFERABLE ) {
		if ( worldreport.length < 2 + _num_objects * WORLDREPORT_ITEMSIZE ) {
			worldreport = new Float32Array(
				2 + // message id & # objects in report
				( Math.ceil( _num_objects / REPORT_CHUNKSIZE ) * REPORT_CHUNKSIZE ) * WORLDREPORT_ITEMSIZE // # of values needed * item size
			);
			worldreport[0] = MESSAGE_TYPES.WORLDREPORT;
		}
	}

	worldreport[1] = _num_objects; // record how many objects we're reporting on

	//for ( i = 0; i < worldreport[1]; i++ ) {
	for ( index in _objects ) {
		if ( _objects.hasOwnProperty( index ) ) {
			object = _objects[index];

			// #TODO: we can't use center of mass transform when center of mass can change,
			//        but getMotionState().getWorldTransform() screws up on objects that have been moved
			//object.getMotionState().getWorldTransform( transform );
			transform = object.getCenterOfMassTransform();

			origin = transform.getOrigin();
			rotation = transform.getRotation();

			// add values to report
			offset = 2 + (i++) * WORLDREPORT_ITEMSIZE;

			worldreport[ offset ] = object.id;

			worldreport[ offset + 1 ] = origin.x();
			worldreport[ offset + 2 ] = origin.y();
			worldreport[ offset + 3 ] = origin.z();

			worldreport[ offset + 4 ] = rotation.x();
			worldreport[ offset + 5 ] = rotation.y();
			worldreport[ offset + 6 ] = rotation.z();
			worldreport[ offset + 7 ] = rotation.w();

			_vector = object.getLinearVelocity();
			worldreport[ offset + 8 ] = _vector.x();
			worldreport[ offset + 9 ] = _vector.y();
			worldreport[ offset + 10 ] = _vector.z();

			_vector = object.getAngularVelocity();
			worldreport[ offset + 11 ] = _vector.x();
			worldreport[ offset + 12 ] = _vector.y();
			worldreport[ offset + 13 ] = _vector.z();
		}
	}


	if ( SUPPORT_TRANSFERABLE ) {
		transferableMessage( worldreport.buffer, [worldreport.buffer] );
	} else {
		transferableMessage( worldreport );
	}

    };

})(self);

