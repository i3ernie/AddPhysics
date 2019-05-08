/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
import { getObjectId, convertWorldPositionToObject } from "../physi_utils.js"


let PointConstraint = function( objecta, objectb, position ) {
        if ( position === undefined ) {
                position = objectb;
                objectb = undefined;
        }

        this.type = 'point';
        this.appliedImpulse = 0;
        this.id = getObjectId();
        this.objecta = objecta._physijs.id;
        this.positiona = convertWorldPositionToObject( position, objecta ).clone();

        if ( objectb ) {
                this.objectb = objectb._physijs.id;
                this.positionb = convertWorldPositionToObject( position, objectb ).clone();
        }
};

PointConstraint.prototype.getDefinition = function() {
        return {
                type: this.type,
                id: this.id,
                objecta: this.objecta,
                objectb: this.objectb,
                positiona: this.positiona,
                positionb: this.positionb
        };
};

export default PointConstraint;
