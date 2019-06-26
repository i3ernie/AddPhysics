/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

'use strict';

(function( self ){
    
    let public_functions = self.public_functions;
    let _constraints = self._constraints || {};
    
    let _objects = self._objects;
    
    let Ammo;
    let _vec3_1;
    let _vec3_2;
    
    self.addEventListener("init", function( event ){ 
        Ammo = self.Ammo;
        _vec3_1 = self._vec3_1 || new Ammo.btVector3(0,0,0);
        _vec3_2 = self._vec3_2 || new Ammo.btVector3(0,0,0);
        
        //polyfill
        if ( !Ammo.btGeneric6DofConstraint.prototype.getRigidBodyA ) {
            Ammo.btGeneric6DofConstraint.prototype.getRigidBodyA = function(){
                return _objects[ this._rigidBodyA ];
            };
        }
        if ( !Ammo.btGeneric6DofConstraint.prototype.getRigidBodyB ) {
            Ammo.btGeneric6DofConstraint.prototype.getRigidBodyB = function(){
                return _objects[ this._rigidBodyB ];
            };
        }
         console.log("***", Ammo.btGeneric6DofConstraint.prototype);
    });
   
    
    self.knownConstraints.dof = function( details ){
        
        let transforma = new Ammo.btTransform();
        transforma.setIdentity();

        _vec3_1.setX(details.positiona.x);
        _vec3_1.setY(details.positiona.y);
        _vec3_1.setZ(details.positiona.z);

        transforma.setOrigin(_vec3_1 );

        let rotation = transforma.getRotation();
        rotation.setEulerZYX( -details.axisa.z, -details.axisa.y, -details.axisa.x );
        transforma.setRotation( rotation );

        let constraint;    
        if ( details.objectb ) {
            let transformb = new Ammo.btTransform();
            transformb.setIdentity();

            _vec3_2.setX(details.positionb.x);
            _vec3_2.setY(details.positionb.y);
            _vec3_2.setZ(details.positionb.z);

            transformb.setOrigin(_vec3_2);

            rotation = transformb.getRotation();
            rotation.setEulerZYX( -details.axisb.z, -details.axisb.y, -details.axisb.x );
            transformb.setRotation( rotation );

            constraint = new Ammo.btGeneric6DofConstraint(
                    _objects[ details.objecta ],
                    _objects[ details.objectb ],
                    transforma,
                    transformb,
                    null
            );
  
            constraint._rigidBodyA = details.objecta;
            constraint._rigidBodyB = details.objectb;

            Ammo.destroy( transformb );
            
        } else {
            constraint = new Ammo.btGeneric6DofConstraint(
                    _objects[ details.objecta ],
                    transforma
            );
            constraint._rigidBodyA = details.objecta;
        }
        Ammo.destroy( transforma );

        return constraint;
    };
   
    public_functions.dof_setLinearLowerLimit = function( params ) {
            let constraint = _constraints[ params.constraint ];

            _vec3_1.setX(params.x);
            _vec3_1.setY(params.y);
            _vec3_1.setZ(params.z);

            constraint.setLinearLowerLimit(_vec3_1);

            activate(constraint);
    };
    public_functions.dof_setLinearUpperLimit = function( params ) {
            let constraint = _constraints[ params.constraint ];

            _vec3_1.setX(params.x);
            _vec3_1.setY(params.y);
            _vec3_1.setZ(params.z);

            constraint.setLinearUpperLimit(_vec3_1);

            activate(constraint);
    };
    public_functions.dof_setAngularLowerLimit = function( params ) {
            let constraint = _constraints[ params.constraint ];
    
            _vec3_1.setX(params.x);
            _vec3_1.setY(params.y);
            _vec3_1.setZ(params.z);

            constraint.setAngularLowerLimit(_vec3_1);

            activate(constraint);
    };
    public_functions.dof_setAngularUpperLimit = function( params ) {
            let constraint = _constraints[ params.constraint ];
    
            _vec3_1.setX(params.x);
            _vec3_1.setY(params.y);
            _vec3_1.setZ(params.z);

            constraint.setAngularUpperLimit(_vec3_1);

            activate(constraint);
    };
    public_functions.dof_enableAngularMotor = function( params ) {
            let constraint = _constraints[ params.constraint ];

            let motor = constraint.getRotationalLimitMotor( params.which );
            motor.set_m_enableMotor( true );

            activate(constraint);
    };
    public_functions.dof_configureAngularMotor = function( params ) {
            let constraint = _constraints[ params.constraint ];

            let motor = constraint.getRotationalLimitMotor( params.which );

            motor.set_m_loLimit( params.low_angle );
            motor.set_m_hiLimit( params.high_angle );
            motor.set_m_targetVelocity( params.velocity );
            motor.set_m_maxMotorForce( params.max_force );

            activate(constraint);
    };
    public_functions.dof_disableAngularMotor = function( params ) {
            var constraint = _constraints[ params.constraint ];

            var motor = constraint.getRotationalLimitMotor( params.which );
            motor.set_m_enableMotor( false );

            activate(constraint);
    };
    
    let activate = function( constraint ){
        constraint.getRigidBodyA().activate();
            if ( constraint.getRigidBodyB() ) {
                    constraint.getRigidBodyB().activate();
            }
    };

})( self );
