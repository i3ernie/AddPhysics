/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function( self ){
    let public_functions = self.public_functions;
    let _constraints = self._constraints || {};
    let Ammo, _vec3_1, _vec3_2, _vec3_3;
    
    self.addEventListener("init", function( event ){ 
        Ammo = self.Ammo;
        _vec3_1 = self._vec3_1 || new Ammo.btVector3(0,0,0);
        _vec3_2 = self._vec3_2 || new Ammo.btVector3(0,0,0);
        _vec3_3 = self._vec3_3 || new Ammo.btVector3(0,0,0);
    });
    
    self.knownConstraints.hinge = function( details ) {
        let constraint; 
        
        if ( details.objectb === undefined ) {

                _vec3_1.setX(details.positiona.x);
                _vec3_1.setY(details.positiona.y);
                _vec3_1.setZ(details.positiona.z);

                _vec3_2.setX(details.axis.x);
                _vec3_2.setY(details.axis.y);
                _vec3_2.setZ(details.axis.z);

                constraint = new Ammo.btHingeConstraint(
                        _objects[ details.objecta ],
                        _vec3_1,
                        _vec3_2
                );
        } else {

                _vec3_1.setX(details.positiona.x);
                _vec3_1.setY(details.positiona.y);
                _vec3_1.setZ(details.positiona.z);

                _vec3_2.setX(details.positionb.x);
                _vec3_2.setY(details.positionb.y);
                _vec3_2.setZ(details.positionb.z);

                _vec3_3.setX(details.axis.x);
                _vec3_3.setY(details.axis.y);
                _vec3_3.setZ(details.axis.z);

                constraint = new Ammo.btHingeConstraint(
                        _objects[ details.objecta ],
                        _objects[ details.objectb ],
                        _vec3_1,
                        _vec3_2,
                        _vec3_3,
                        _vec3_3
                );
        }
        return constraint;
    };
    
public_functions.hinge_setLimits = function( params ) {
	_constraints[ params.constraint ].setLimit( params.low, params.high, 0, params.bias_factor, params.relaxation_factor );
};
public_functions.hinge_enableAngularMotor = function( params ) {
	var constraint = _constraints[ params.constraint ];
	constraint.enableAngularMotor( true, params.velocity, params.acceleration );
	constraint.getRigidBodyA().activate();
	if ( constraint.getRigidBodyB() ) {
		constraint.getRigidBodyB().activate();
	}
};
public_functions.hinge_disableMotor = function( params ) {
    var constraint = _constraints[ params.constraint ];
    _constraints[ params.constraint ].enableMotor( false );
    if ( constraint.getRigidBodyB() ) {
            constraint.getRigidBodyB().activate();
    }
};

})( self );

