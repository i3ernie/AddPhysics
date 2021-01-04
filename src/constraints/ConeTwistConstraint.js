/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import { getObjectId, convertWorldPositionToObject } from "../physi_utils.js"
import AddPhysics from '../AddPhysicsGlobals.js';
import {THREE} from "../libs.es6.js";

AddPhysics.addFunctions.constraint.conetwist = function( constraint ){
    let marker = new THREE.Mesh(
            new THREE.SphereGeometry( 1.5 ),
            new THREE.MeshNormalMaterial
    );
    marker.position.copy( constraint.positiona );
    this._objects[ constraint.objecta ].add( marker );
};


const ConeTwistConstraint = function( objecta, objectb, position ) {
        if ( position === undefined ) {
                throw 'Both objects must be defined in a ConeTwistConstraint.';
        }
        this.type = 'conetwist';
        this.appliedImpulse = 0;
        this.id = getObjectId();
        this.scene = objecta.parent;
        this.objecta = objecta._physijs.id;
        this.positiona = convertWorldPositionToObject( position, objecta ).clone();
        this.objectb = objectb._physijs.id;
        this.positionb = convertWorldPositionToObject( position, objectb ).clone();
        this.axisa = { x: objecta.rotation.x, y: objecta.rotation.y, z: objecta.rotation.z };
        this.axisb = { x: objectb.rotation.x, y: objectb.rotation.y, z: objectb.rotation.z };
};

Object.assign( ConeTwistConstraint.prototype, {
        getDefinition : function() {
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
        },

        setLimit : function( x, y, z ) {
                this.scene.execute( 'conetwist_setLimit', { constraint: this.id, x: x, y: y, z: z } );
        },
        enableMotor : function() {
                this.scene.execute( 'conetwist_enableMotor', { constraint: this.id } );
        },
        setMaxMotorImpulse : function( max_impulse ) {
                this.scene.execute( 'conetwist_setMaxMotorImpulse', { constraint: this.id, max_impulse: max_impulse } );
        }
});

ConeTwistConstraint.prototype.setMotorTarget = function( target ) {
        if ( target instanceof THREE.Vector3 ) {
                target = new THREE.Quaternion().setFromEuler( new THREE.Euler( target.x, target.y, target.z ) );
        } else if ( target instanceof THREE.Euler ) {
                target = new THREE.Quaternion().setFromEuler( target );
        } else if ( target instanceof THREE.Matrix4 ) {
                target = new THREE.Quaternion().setFromRotationMatrix( target );
        }
        this.scene.execute( 'conetwist_setMotorTarget', { constraint: this.id, x: target.x, y: target.y, z: target.z, w: target.w } );
};
ConeTwistConstraint.prototype.disableMotor = function() {
        this.scene.execute( 'conetwist_disableMotor', { constraint: this.id } );
};

export default ConeTwistConstraint;