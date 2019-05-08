/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import { getObjectId, convertWorldPositionToObject } from "../physi_utils.js"

let DOFConstraint = function( objecta, objectb, position ) {
        if ( position === undefined ) {
                position = objectb;
                objectb = undefined;
        }
        this.type = 'dof';
        this.appliedImpulse = 0;
        this.id = getObjectId();
        this.scene = objecta.parent;
        this.objecta = objecta._physijs.id;
        this.positiona = convertWorldPositionToObject( position, objecta ).clone();
        this.axisa = { x: objecta.rotation.x, y: objecta.rotation.y, z: objecta.rotation.z };

        if ( objectb ) {
                this.objectb = objectb._physijs.id;
                this.positionb = convertWorldPositionToObject( position, objectb ).clone();
                this.axisb = { x: objectb.rotation.x, y: objectb.rotation.y, z: objectb.rotation.z };
        }
};

DOFConstraint.prototype.getDefinition = function() {
    return {
        type: this.type,
        id: this.id,
        objecta: this.objecta,
        objectb: this.objectb,
        positiona: this.positiona,
        positionb: this.positionb,
        axisa: this.axisa,
        axisb: this.axisb
    };
};

DOFConstraint.prototype.setLinearLowerLimit = function( limit ) {
        this.scene.execute( 'dof_setLinearLowerLimit', { constraint: this.id, x: limit.x, y: limit.y, z: limit.z } );
};
DOFConstraint.prototype.setLinearUpperLimit = function( limit ) {
        this.scene.execute( 'dof_setLinearUpperLimit', { constraint: this.id, x: limit.x, y: limit.y, z: limit.z } );
};
DOFConstraint.prototype.setAngularLowerLimit = function( limit ) {
        this.scene.execute( 'dof_setAngularLowerLimit', { constraint: this.id, x: limit.x, y: limit.y, z: limit.z } );
};
DOFConstraint.prototype.setAngularUpperLimit = function( limit ) {
        this.scene.execute( 'dof_setAngularUpperLimit', { constraint: this.id, x: limit.x, y: limit.y, z: limit.z } );
};
DOFConstraint.prototype.enableAngularMotor = function( which ) {
        this.scene.execute( 'dof_enableAngularMotor', { constraint: this.id, which: which } );
};
DOFConstraint.prototype.configureAngularMotor = function( which, low_angle, high_angle, velocity, max_force ) {
        this.scene.execute( 'dof_configureAngularMotor', { constraint: this.id, which: which, low_angle: low_angle, high_angle: high_angle, velocity: velocity, max_force: max_force } );
};
DOFConstraint.prototype.disableAngularMotor = function( which ) {
        this.scene.execute( 'dof_disableAngularMotor', { constraint: this.id, which: which } );
};

export default DOFConstraint;