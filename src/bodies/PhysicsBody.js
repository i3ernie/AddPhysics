/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
import * as THREE from '../three.module.js';
import { getObjectId } from '../physi_utils.js';


let PhysicsBody = function( mesh, mass ){

    if ( !mesh.geometry ) {
            return;
    }

    if ( !mesh.geometry.boundingBox ) {
        mesh.geometry.computeBoundingBox();
    }
    
    mesh.addEventListener("added", function(){
        this.parent.dispatchEvent({type:"physicsBodyAdded", object:this});
    });
    mesh.addEventListener("removed", function(){
        this.parent.dispatchEvent({type:"physicsBodyRemoved", object:this});
    });

    this._physijs = {
        type: null,
        id: getObjectId(),
        mass: mass || 0,
        touches: [],
        linearVelocity: new THREE.Vector3,
        angularVelocity: new THREE.Vector3
    };
};

PhysicsBody.make = function( mesh, mass ){
    mesh.PhysicsBody = new PhysicsBody( mesh, mass );
};

PhysicsBody.prototype = Object.assign( PhysicsBody.prototype, {
   
    // Physijs.Mesh.applyCentralImpulse
    applyCentralImpulse : function ( force ) {
        if ( this.world ) {
                this.world.execute( 'applyCentralImpulse', { id: this._physijs.id, x: force.x, y: force.y, z: force.z } );
        }
    },

    // Physijs.Mesh.applyImpulse
    applyImpulse : function ( force, offset ) {
        if ( this.world ) {
                this.world.execute( 'applyImpulse', { id: this._physijs.id, impulse_x: force.x, impulse_y: force.y, impulse_z: force.z, x: offset.x, y: offset.y, z: offset.z } );
        }
    },

    // Physijs.Mesh.applyTorque
    applyTorque : function ( force ) {
        if ( this.world ) {
                this.world.execute( 'applyTorque', { id: this._physijs.id, torque_x: force.x, torque_y: force.y, torque_z: force.z } );
        }
    },

    // Physijs.Mesh.applyCentralForce
    applyCentralForce : function ( force ) {
        if ( this.world ) {
                this.world.execute( 'applyCentralForce', { id: this._physijs.id, x: force.x, y: force.y, z: force.z } );
        }
    },

    // Physijs.Mesh.applyForce
    applyForce : function ( force, offset ) {
        if ( this.world ) {
                this.world.execute( 'applyForce', { id: this._physijs.id, force_x: force.x, force_y : force.y, force_z : force.z, x: offset.x, y: offset.y, z: offset.z } );
        }
    },

    // Physijs.Mesh.getAngularVelocity
    getAngularVelocity : function () {
            return this._physijs.angularVelocity;
    },

    // Physijs.Mesh.setAngularVelocity
    setAngularVelocity : function ( velocity ) {
        if ( this.world ) {
                this.world.execute( 'setAngularVelocity', { id: this._physijs.id, x: velocity.x, y: velocity.y, z: velocity.z } );
        }
    },

    // Physijs.Mesh.getLinearVelocity
    getLinearVelocity : function () {
        return this._physijs.linearVelocity;
    },

    // Physijs.Mesh.setLinearVelocity
    setLinearVelocity : function ( velocity ) {
        if ( this.world ) {
                this.world.execute( 'setLinearVelocity', { id: this._physijs.id, x: velocity.x, y: velocity.y, z: velocity.z } );
        }
    },

    // Physijs.Mesh.setAngularFactor
    setAngularFactor : function ( factor ) {
        if ( this.world ) {
                this.world.execute( 'setAngularFactor', { id: this._physijs.id, x: factor.x, y: factor.y, z: factor.z } );
        }
    },

    // Physijs.Mesh.setLinearFactor
    setLinearFactor : function ( factor ) {
        if ( this.world ) {
                this.world.execute( 'setLinearFactor', { id: this._physijs.id, x: factor.x, y: factor.y, z: factor.z } );
        }
    },

    // Physijs.Mesh.setDamping
    setDamping : function ( linear, angular ) {
        if ( this.world ) {
                this.world.execute( 'setDamping', { id: this._physijs.id, linear: linear, angular: angular } );
        }
    },

    // Physijs.Mesh.setCcdMotionThreshold
    setCcdMotionThreshold : function ( threshold ) {
        if ( this.world ) {
                this.world.execute( 'setCcdMotionThreshold', { id: this._physijs.id, threshold: threshold } );
        }
    },

    // Physijs.Mesh.setCcdSweptSphereRadius
    setCcdSweptSphereRadius : function ( radius ) {
        if ( this.world ) {
                this.world.execute( 'setCcdSweptSphereRadius', { id: this._physijs.id, radius: radius } );
        }
    }
});
// PhysicsBody.mass
Object.defineProperty( PhysicsBody.prototype, 'mass', {
    get: function() { 
        return this._physijs.mass; 
    },
    set: function( mass ) { 
        this._physijs.mass = mass;
        
        if ( this.world ) {
            this.world.execute( 'updateMass', { id: this._physijs.id, mass: mass } );
        } 
    }
});

export { PhysicsBody };