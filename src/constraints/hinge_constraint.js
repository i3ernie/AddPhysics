/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import { getObjectId, convertWorldPositionToObject } from "../physi_utils.js"

let HingeConstraint = function( objecta, objectb, position, axis ) {
        if ( axis === undefined ) {
                axis = position;
                position = objectb;
                objectb = undefined;
        }

        this.type = 'hinge';
        this.appliedImpulse = 0;
        this.id = getObjectId();
        this.scene = objecta.parent;
        this.objecta = objecta._physijs.id;
        this.positiona = convertWorldPositionToObject( position, objecta ).clone();
        this.position = position.clone();
        this.axis = axis;

        if ( objectb ) {
                this.objectb = objectb._physijs.id;
                this.positionb = convertWorldPositionToObject( position, objectb ).clone();
        }
};
HingeConstraint.prototype.getDefinition = function() {
        return {
                type: this.type,
                id: this.id,
                objecta: this.objecta,
                objectb: this.objectb,
                positiona: this.positiona,
                positionb: this.positionb,
                axis: this.axis
        };
};

/*
 * low = minimum angle in radians
 * high = maximum angle in radians
 * bias_factor = applied as a factor to constraint error
 * relaxation_factor = controls bounce (0.0 == no bounce)
 */
HingeConstraint.prototype.setLimits = function( low, high, bias_factor, relaxation_factor ) {
        this.scene.execute( 'hinge_setLimits', { constraint: this.id, low: low, high: high, bias_factor: bias_factor, relaxation_factor: relaxation_factor } );
};

HingeConstraint.prototype.enableAngularMotor = function( velocity, acceleration ) {
        this.scene.execute( 'hinge_enableAngularMotor', { constraint: this.id, velocity: velocity, acceleration: acceleration } );
};

HingeConstraint.prototype.disableMotor = function( velocity, acceleration ) {
        this.scene.execute( 'hinge_disableMotor', { constraint: this.id } );
};

export default HingeConstraint;

