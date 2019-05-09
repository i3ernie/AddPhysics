/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function( self ){
    let public_functions = self.public_functions;
    let _constraints = self._constraints || {};
    
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

