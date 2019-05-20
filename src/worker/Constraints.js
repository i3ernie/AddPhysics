/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function( self ){
    
    self._constraints = {};
    self._num_constraints = 0;   
    
    public_functions.addConstraint = function ( details ) {
	var constraint;
        
        if ( typeof knownConstraints[details.type] === "function" ) {
            constraint = knownConstraints[details.type]( details );
        } else {
            return;
        }

	world.addConstraint( constraint );

	constraint.enableFeedback();
	_constraints[ details.id ] = constraint;
	_num_constraints++;

	if ( SUPPORT_TRANSFERABLE ) {
		constraintreport = new Float32Array(1 + _num_constraints * CONSTRAINTREPORT_ITEMSIZE); // message id & ( # of objects to report * # of values per object )
		constraintreport[0] = MESSAGE_TYPES.CONSTRAINTREPORT;
	} else {
		constraintreport = [ MESSAGE_TYPES.CONSTRAINTREPORT ];
	}
    };

    public_functions.removeConstraint = function( details ) {
            var constraint = _constraints[ details.id ];
            if ( constraint !== undefined ) {
                    world.removeConstraint( constraint );
                    delete _constraints[ details.id ];
                    _num_constraints--;
            }
    };

    public_functions.constraint_setBreakingImpulseThreshold = function( details ) {
            var constraint = _constraints[ details.id ];
            if ( constraint !== undefind ) {
                    constraint.setBreakingImpulseThreshold( details.threshold );
            }
    };

    self.addEventListener("report", function( event ){ 
            var index, constraint,
                    offset_body,
                    transform, origin,
                    offset = 0,
                    i = 0;

            if ( SUPPORT_TRANSFERABLE ) {
                    if ( constraintreport.length < 2 + _num_constraints * CONSTRAINTREPORT_ITEMSIZE ) {
                            constraintreport = new Float32Array(
                                    2 + // message id & # objects in report
                                    ( Math.ceil( _num_constraints / REPORT_CHUNKSIZE ) * REPORT_CHUNKSIZE ) * CONSTRAINTREPORT_ITEMSIZE // # of values needed * item size
                            );
                            constraintreport[0] = MESSAGE_TYPES.CONSTRAINTREPORT;
                    }
            }

            for ( index in _constraints ) {
                    if ( _constraints.hasOwnProperty( index ) ) {
                            constraint = _constraints[index];
                            offset_body = constraint.getRigidBodyA();
                            transform = constraint.getFrameOffsetA();
                            origin = transform.getOrigin();

                            // add values to report
                            offset = 1 + (i++) * CONSTRAINTREPORT_ITEMSIZE;

                            constraintreport[ offset ] = index;
                            constraintreport[ offset + 1 ] = offset_body.id;
                            constraintreport[ offset + 2 ] = origin.getX();
                            constraintreport[ offset + 3 ] = origin.getY();
                            constraintreport[ offset + 4 ] = origin.getZ();
                            constraintreport[ offset + 5 ] = constraint.getAppliedImpulse();
                    }
            }


            if ( i !== 0 ) {
                    if ( SUPPORT_TRANSFERABLE ) {
                            transferableMessage( constraintreport.buffer, [constraintreport.buffer] );
                    } else {
                            transferableMessage( constraintreport );
                    }
            }

    });

})(self);
