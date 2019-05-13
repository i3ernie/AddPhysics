/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function( self ){
    
    let public_functions = self.public_functions;
    let _constraints = self._constraints || {};
    
    let Ammo, _vec3_1, _vec3_2;
    
    self.addEventListener("init", function( event ){ 
        Ammo = self.Ammo;
        _vec3_1 = self._vec3_1 || new Ammo.btVector3(0,0,0);
        _vec3_2 = self._vec3_2 || new Ammo.btVector3(0,0,0);
    });
    
    
    self.knownConstraints.slider = function( details ){
        
        let constraint;
        let transformb;

        let transforma = new Ammo.btTransform();

        _vec3_1.setX( details.positiona.x );
        _vec3_1.setY( details.positiona.y );
        _vec3_1.setZ( details.positiona.z );

        transforma.setOrigin(_vec3_1);

        let rotation = transforma.getRotation();
        rotation.setEuler( details.axis.x, details.axis.y, details.axis.z );
        transforma.setRotation( rotation );

        if ( details.objectb ) {
                transformb = new Ammo.btTransform();

                _vec3_2.setX(details.positionb.x);
                _vec3_2.setY(details.positionb.y);
                _vec3_2.setZ(details.positionb.z);

                transformb.setOrigin(_vec3_2);

                rotation = transformb.getRotation();
                rotation.setEuler( details.axis.x, details.axis.y, details.axis.z );
                transformb.setRotation( rotation );

                constraint = new Ammo.btSliderConstraint(
                        _objects[ details.objecta ],
                        _objects[ details.objectb ],
                        transforma,
                        transformb,
                        true
                );
        } else {
                constraint = new Ammo.btSliderConstraint(
                        _objects[ details.objecta ],
                        transforma,
                        true
                );
        }

        Ammo.destroy(transforma);
        
        if (transformb != undefined) {
                Ammo.destroy(transformb);
        }
        
        return constraint;
    };
    
    public_functions.slider_setLimits = function( params ) {
            var constraint = _constraints[ params.constraint ];
            constraint.setLowerLinLimit( params.lin_lower || 0 );
            constraint.setUpperLinLimit( params.lin_upper || 0 );

            constraint.setLowerAngLimit( params.ang_lower || 0 );
            constraint.setUpperAngLimit( params.ang_upper || 0 );
    };
    public_functions.slider_setRestitution = function( params ) {
            var constraint = _constraints[ params.constraint ];
            constraint.setSoftnessLimLin( params.linear || 0 );
            constraint.setSoftnessLimAng( params.angular || 0 );
    };
    public_functions.slider_enableLinearMotor = function( params ) {
            var constraint = _constraints[ params.constraint ];
            constraint.setTargetLinMotorVelocity( params.velocity );
            constraint.setMaxLinMotorForce( params.acceleration );
            constraint.setPoweredLinMotor( true );
            constraint.getRigidBodyA().activate();
            if ( constraint.getRigidBodyB() ) {
                    constraint.getRigidBodyB().activate();
            }
    };
    public_functions.slider_disableLinearMotor = function( params ) {
            var constraint = _constraints[ params.constraint ];
            constraint.setPoweredLinMotor( false );
            if ( constraint.getRigidBodyB() ) {
                    constraint.getRigidBodyB().activate();
            }
    };
    public_functions.slider_enableAngularMotor = function( params ) {
            var constraint = _constraints[ params.constraint ];
            constraint.setTargetAngMotorVelocity( params.velocity );
            constraint.setMaxAngMotorForce( params.acceleration );
            constraint.setPoweredAngMotor( true );
            constraint.getRigidBodyA().activate();
            if ( constraint.getRigidBodyB() ) {
                    constraint.getRigidBodyB().activate();
            }
    };
    public_functions.slider_disableAngularMotor = function( params ) {
            var constraint = _constraints[ params.constraint ];
            constraint.setPoweredAngMotor( false );
            constraint.getRigidBodyA().activate();
            if ( constraint.getRigidBodyB() ) {
                    constraint.getRigidBodyB().activate();
            }
    };

})(self);