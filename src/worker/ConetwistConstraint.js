/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function( self ){
    
    let public_functions = self.public_functions;
    let _constraints = self._constraints || {};
    
    let Ammo;
    let _vec3_1, _vec3_2;
    
    
    self.addEventListener("init", function( event ){ 
        Ammo = self.Ammo;
        _vec3_1 = self._vec3_1 || new Ammo.btVector3(0,0,0);
        _vec3_2 = self._vec3_2 || new Ammo.btVector3(0,0,0);
    });
    
    self.knownConstraints.conetwist = function( details ){
        var transforma, transformb;
        let constraint; 

            transforma = new Ammo.btTransform();
            transforma.setIdentity();

            transformb = new Ammo.btTransform();
            transformb.setIdentity();

            _vec3_1.setX(details.positiona.x);
            _vec3_1.setY(details.positiona.y);
            _vec3_1.setZ(details.positiona.z);

            _vec3_2.setX(details.positionb.x);
            _vec3_2.setY(details.positionb.y);
            _vec3_2.setZ(details.positionb.z);

            transforma.setOrigin(_vec3_1);
            transformb.setOrigin(_vec3_2);

            var rotation = transforma.getRotation();
            rotation.setEulerZYX( -details.axisa.z, -details.axisa.y, -details.axisa.x );
            transforma.setRotation( rotation );

            rotation = transformb.getRotation();
            rotation.setEulerZYX( -details.axisb.z, -details.axisb.y, -details.axisb.x );
            transformb.setRotation( rotation );

            constraint = new Ammo.btConeTwistConstraint(
                    _objects[ details.objecta ],
                    _objects[ details.objectb ],
                    transforma,
                    transformb
            );

            constraint.setLimit( Math.PI, 0, Math.PI );

            Ammo.destroy(transforma);
            Ammo.destroy(transformb);

        return constraint;
    };

    public_functions.conetwist_setLimit = function( params ) {
            _constraints[ params.constraint ].setLimit( params.z, params.y, params.x ); // ZYX order
    };
    public_functions.conetwist_enableMotor = function( params ) {
            var constraint = _constraints[ params.constraint ];
            constraint.enableMotor( true );
            constraint.getRigidBodyA().activate();
            constraint.getRigidBodyB().activate();
    };
    public_functions.conetwist_setMaxMotorImpulse = function( params ) {
            var constraint = _constraints[ params.constraint ];
            constraint.setMaxMotorImpulse( params.max_impulse );
            constraint.getRigidBodyA().activate();
            constraint.getRigidBodyB().activate();
    };
    public_functions.conetwist_setMotorTarget = function( params ) {
            var constraint = _constraints[ params.constraint ];

            _quat.setX(params.x);
            _quat.setY(params.y);
            _quat.setZ(params.z);
            _quat.setW(params.w);

            constraint.setMotorTarget(_quat);

            constraint.getRigidBodyA().activate();
            constraint.getRigidBodyB().activate();
    };
    public_functions.conetwist_disableMotor = function( params ) {
            var constraint = _constraints[ params.constraint ];
            constraint.enableMotor( false );
            constraint.getRigidBodyA().activate();
            constraint.getRigidBodyB().activate();
    };
        
})(self);