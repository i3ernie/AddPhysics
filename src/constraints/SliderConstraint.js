/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
import { getObjectId, convertWorldPositionToObject } from "../physi_utils.js"
import AddPhysics from '../AddPhysicsGlobals.js';
import * as THREE from '../three.module.js';

AddPhysics.addFunctions.constraint.slider = function( constraint ){
    let marker = new THREE.Mesh(
            new THREE.BoxGeometry( 10, 1, 1 ),
            new THREE.MeshNormalMaterial
    );
    marker.position.copy( constraint.positiona );
    // This rotation isn't right if all three axis are non-0 values
    // TODO: change marker's rotation order to ZYX
    marker.rotation.set(
            constraint.axis.y, // yes, y and
            constraint.axis.x, // x axis are swapped
            constraint.axis.z
    );
    this._objects[ constraint.objecta ].add( marker );
};

let SliderConstraint = function( objecta, objectb, position, axis ) {
        if ( axis === undefined ) {
                axis = position;
                position = objectb;
                objectb = undefined;
        }

        this.type = 'slider';
        this.appliedImpulse = 0;
        this.id = getObjectId();
        this.scene = objecta.parent;
        this.objecta = objecta._physijs.id;
        this.positiona = convertWorldPositionToObject( position, objecta ).clone();
        this.axis = axis;

        if ( objectb ) {
                this.objectb = objectb._physijs.id;
                this.positionb = convertWorldPositionToObject( position, objectb ).clone();
        }
};
SliderConstraint.prototype.getDefinition = function() {
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
SliderConstraint.prototype.setLimits = function( lin_lower, lin_upper, ang_lower, ang_upper ) {
        this.scene.execute( 'slider_setLimits', { constraint: this.id, lin_lower: lin_lower, lin_upper: lin_upper, ang_lower: ang_lower, ang_upper: ang_upper } );
};
SliderConstraint.prototype.setRestitution = function( linear, angular ) {
        this.scene.execute(
                'slider_setRestitution',
                {
                        constraint: this.id,
                        linear: linear,
                        angular: angular
                }
        );
};
SliderConstraint.prototype.enableLinearMotor = function( velocity, acceleration) {
        this.scene.execute( 'slider_enableLinearMotor', { constraint: this.id, velocity: velocity, acceleration: acceleration } );
};
SliderConstraint.prototype.disableLinearMotor = function() {
        this.scene.execute( 'slider_disableLinearMotor', { constraint: this.id } );
};
SliderConstraint.prototype.enableAngularMotor = function( velocity, acceleration ) {
        this.scene.execute( 'slider_enableAngularMotor', { constraint: this.id, velocity: velocity, acceleration: acceleration } );
};
SliderConstraint.prototype.disableAngularMotor = function() {
        this.scene.execute( 'slider_disableAngularMotor', { constraint: this.id } );
};
        
export default SliderConstraint;

