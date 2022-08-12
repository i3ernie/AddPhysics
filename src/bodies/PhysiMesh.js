/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

'use strict';

import { getObjectId } from '../physi_utils.js';
import AddPhysics from '../AddPhysicsGlobals.js';
import * as THREE from "three";

const options = AddPhysics.options;

let defaults = {
    type : null,
    mass : 0
};

let PhysicsBody = function( mesh, opt ){
    
    if ( !mesh.geometry.boundingBox ) {
        mesh.geometry.computeBoundingBox();
    }
    
    opt = Object.assign( {}, defaults, mesh.userData.physics, opt );

    
    mesh.addEventListener("added", function(){ 
        this.physicsBody.scene = this.parent;
        this.parent.dispatchEvent({type:"physicsBodyAdded", object:this});
    });
    mesh.addEventListener("removed", function( el ){ 
        this.physicsBody.scene.dispatchEvent({type:"physicsBodyRemoved", object:this});
        this.physicsBody.scene = null;
    });
   
    this._physijs = {
        type: opt.type,
        id: getObjectId(),
        mass: opt.mass,
        touches: [],
        linearVelocity: new THREE.Vector3(),
        angularVelocity: new THREE.Vector3()
    };
    
};

PhysicsBody.add = function ( Body, mesh, opt ){ 
    mesh.physicsBody = new Body( mesh, opt );
    if ( mesh.parent && mesh.parent.type === "Scene" ) {
        mesh.parent.dispatchEvent({type:"physicsBodyAdded", object:mesh});
    };
    return mesh.physicsBody;
};

PhysicsBody.prototype = Object.assign( Object.create( PhysicsBody.prototype), {
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

// Body.mass
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


// Phsijs.Mesh
class Mesh extends THREE.Mesh {
        constructor ( geometry, material, mass ) {

                if ( !geometry ) {
                        return;
                }

                super( geometry, material );
                PhysicsBody.call( this, this, { mass: mass } );
                this.physicsBody = this;
        }
};
Object.assign( Mesh.prototype, PhysicsBody.prototype, {
    constructor : Mesh
});
        
export default Mesh;
export { Mesh, PhysicsBody }