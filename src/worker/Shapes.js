/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function( self ){
    
    let Ammo;
    let _vec3_1, _vec3_2;
    let _object_shapes = self._object_shapes;
    let public_functions = self.public_functions;
    
    self.addEventListener("init", function( event ){ 
        Ammo = self.Ammo;
        _vec3_1 = self._vec3_1 || new Ammo.btVector3(0,0,0);
        _vec3_2 = self._vec3_2 || new Ammo.btVector3(0,0,0);
    });
    
    
    let setShapeCache = function ( cache_key, shape ) {
	_object_shapes[ cache_key ] = shape;
    };
    
    let getShapeFromCache = function ( cache_key ) {
	if ( _object_shapes[ cache_key ] !== undefined ) {
		return _object_shapes[ cache_key ];
	}
	return null;
    };
    
    self.createShape = function( description ) {
	var cache_key, shape;

	_transform.setIdentity();
        
	switch ( description.type ) {
                case 'soft':
			console.log("******* add soft");
                        shape = createSoftShape( description );
			break;
		case 'plane':
			cache_key = 'plane_' + description.normal.x + '_' + description.normal.y + '_' + description.normal.z;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				_vec3_1.setX(description.normal.x);
				_vec3_1.setY(description.normal.y);
				_vec3_1.setZ(description.normal.z);
				shape = new Ammo.btStaticPlaneShape(_vec3_1, 0 );
				setShapeCache( cache_key, shape );
			}
			break;

		case 'box':
			cache_key = 'box_' + description.width + '_' + description.height + '_' + description.depth;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				_vec3_1.setX(description.width / 2);
				_vec3_1.setY(description.height / 2);
				_vec3_1.setZ(description.depth / 2);
				shape = new Ammo.btBoxShape( _vec3_1 );
				setShapeCache( cache_key, shape );
			}
			break;

		case 'sphere':
			cache_key = 'sphere_' + description.radius;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				shape = new Ammo.btSphereShape( description.radius );
				setShapeCache( cache_key, shape );
			}
			break;

		case 'cylinder':
			cache_key = 'cylinder_' + description.width + '_' + description.height + '_' + description.depth;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				_vec3_1.setX(description.width / 2);
				_vec3_1.setY(description.height / 2);
				_vec3_1.setZ(description.depth / 2);
				shape = new Ammo.btCylinderShape(_vec3_1);
				setShapeCache( cache_key, shape );
			}
			break;

		case 'capsule':
			cache_key = 'capsule_' + description.radius + '_' + description.height;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				// In Bullet, capsule height excludes the end spheres
				shape = new Ammo.btCapsuleShape( description.radius, description.height - 2 * description.radius );
				setShapeCache( cache_key, shape );
			}
			break;

		case 'cone':
			cache_key = 'cone_' + description.radius + '_' + description.height;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				shape = new Ammo.btConeShape( description.radius, description.height );
				setShapeCache( cache_key, shape );
			}
			break;

		case 'concave':
			var i, triangle, triangle_mesh = new Ammo.btTriangleMesh;
			if (!description.triangles.length) return false

			for ( i = 0; i < description.triangles.length; i++ ) {
				triangle = description.triangles[i];

				_vec3_1.setX(triangle[0].x);
				_vec3_1.setY(triangle[0].y);
				_vec3_1.setZ(triangle[0].z);

				_vec3_2.setX(triangle[1].x);
				_vec3_2.setY(triangle[1].y);
				_vec3_2.setZ(triangle[1].z);

				_vec3_3.setX(triangle[2].x);
				_vec3_3.setY(triangle[2].y);
				_vec3_3.setZ(triangle[2].z);

				triangle_mesh.addTriangle(
					_vec3_1,
					_vec3_2,
					_vec3_3,
					true
				);
			}

			shape = new Ammo.btBvhTriangleMeshShape(
				triangle_mesh,
				true,
				true
			);
			_noncached_shapes[description.id] = shape;
			break;

		case 'convex':
			var i, point, shape = new Ammo.btConvexHullShape;
			for ( i = 0; i < description.points.length; i++ ) {
				point = description.points[i];

				_vec3_1.setX(point.x);
				_vec3_1.setY(point.y);
				_vec3_1.setZ(point.z);

				shape.addPoint(_vec3_1);

			}
			_noncached_shapes[description.id] = shape;
			break;

		case 'heightfield':

			var ptr = Ammo.allocate(4 * description.xpts * description.ypts, "float", Ammo.ALLOC_NORMAL);

			for (var f = 0; f < description.points.length; f++) {
				Ammo.setValue(ptr + f,  description.points[f]  , 'float');
			}

			shape = new Ammo.btHeightfieldTerrainShape(
					description.xpts,
					description.ypts,
					ptr,
					1,
					-description.absMaxHeight,
					description.absMaxHeight,
					2,
					0,
					false
				);

			_vec3_1.setX(description.xsize/(description.xpts - 1));
			_vec3_1.setY(description.ysize/(description.ypts - 1));
			_vec3_1.setZ(1);

			shape.setLocalScaling(_vec3_1);
			_noncached_shapes[description.id] = shape;
			break;

		default:
			// Not recognized
			return;
			break;
	}

	return shape;
    };
    
    
    public_functions.updateMass = function( details ) {
	// #TODO: changing a static object into dynamic is buggy
	_object = _objects[details.id];

	// Per http://www.bulletphysics.org/Bullet/phpBB3/viewtopic.php?p=&f=9&t=3663#p13816
	world.removeRigidBody( _object );

	_vec3_1.setX(0);
	_vec3_1.setY(0);
	_vec3_1.setZ(0);

	_object.setMassProps( details.mass, _vec3_1 );
	world.addRigidBody( _object );
	_object.activate();
    };

    public_functions.applyCentralImpulse = function ( details ) {

	_vec3_1.setX(details.x);
	_vec3_1.setY(details.y);
	_vec3_1.setZ(details.z);

	_objects[details.id].applyCentralImpulse(_vec3_1);
	_objects[details.id].activate();
    };

    public_functions.applyImpulse = function ( details ) {

	_vec3_1.setX(details.impulse_x);
	_vec3_1.setY(details.impulse_y);
	_vec3_1.setZ(details.impulse_z);

	_vec3_2.setX(details.x);
	_vec3_2.setY(details.y);
	_vec3_2.setZ(details.z);

	_objects[details.id].applyImpulse(
		_vec3_1,
		_vec3_2
	);
	_objects[details.id].activate();
    };
    
    //reportCollisions
    self.addEventListener("report", function() {
	var i, offset,
		dp = world.getDispatcher(),
		num = dp.getNumManifolds(),
		manifold, num_contacts, j, pt,
		_collided = false;

	if ( SUPPORT_TRANSFERABLE ) {
		if ( collisionreport.length < 2 + num * COLLISIONREPORT_ITEMSIZE ) {
			collisionreport = new Float32Array(
				2 + // message id & # objects in report
				( Math.ceil( _num_objects / REPORT_CHUNKSIZE ) * REPORT_CHUNKSIZE ) * COLLISIONREPORT_ITEMSIZE // # of values needed * item size
			);
			collisionreport[0] = MESSAGE_TYPES.COLLISIONREPORT;
		}
	}

	collisionreport[1] = 0; // how many collisions we're reporting on

	for ( i = 0; i < num; i++ ) {
		manifold = dp.getManifoldByIndexInternal( i );

		num_contacts = manifold.getNumContacts();
		if ( num_contacts === 0 ) {
			continue;
		}

		for ( j = 0; j < num_contacts; j++ ) {
			pt = manifold.getContactPoint( j );
			//if ( pt.getDistance() < 0 ) {
				offset = 2 + (collisionreport[1]++) * COLLISIONREPORT_ITEMSIZE;
				collisionreport[ offset ] = _objects_ammo[ manifold.getBody0() ];
				collisionreport[ offset + 1 ] = _objects_ammo[ manifold.getBody1() ];

				_vector = pt.get_m_normalWorldOnB();
				collisionreport[ offset + 2 ] = _vector.x();
				collisionreport[ offset + 3 ] = _vector.y();
				collisionreport[ offset + 4 ] = _vector.z();
				break;
			//}

				transferableMessage( _objects_ammo );

		}
	}


	if ( SUPPORT_TRANSFERABLE ) {
		transferableMessage( collisionreport.buffer, [collisionreport.buffer] );
	} else {
		transferableMessage( collisionreport );
	}
    });
    

})(self);

