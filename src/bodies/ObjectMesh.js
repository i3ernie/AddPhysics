/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import { PhysicsBody } from './PhysiMesh.js';
import * as THREE from "../three.module.js";

import { BoxBody } from "./BoxMesh.js";
import { SphereBody } from "./SphereMesh.js";
import { CylinderBody } from "./CylinderMesh.js";
import { ConvexBody } from "./ConvexMesh.js";
import { ConeBody } from "./ConeMesh.js"
import { PlaneBody } from "./PlaneMesh.js"

const Body = function( mesh, opt ){
    let shape;
    
    switch ( mesh.geometry.type ) 
    {
        case "SphereGeometry":
        case "SphereBufferGeometry":
            // Sphere                 
            shape = SphereBody.call( this, mesh, opt );
            break;

        case "BoxGeometry":
        case "BoxBufferGeometry":
            // Box
            shape = BoxBody.call( this, mesh, opt );
            break;

        case "CylinderGeometry":
            // Cylinder
            shape = CylinderBody.call( this, mesh, opt );
            break;
        
        case "ConeGeometry":
            // Cylinder
            shape = ConeBody.call( this, mesh, opt );
            break;
            

        case "ConvexGeometry":
        case "OctahedronGeometry":
        case "TorusKnotGeometry":
            shape = ConvexBody.call( this, mesh, opt );
            break;

        case "PlaneBufferGeometry":
            shape = PlaneBody.call( this, mesh, opt );
            break;

        default:
            // Cone
            console.log("PhysicWorld::unkown type of geometry: ", p );
            //shape = PhysicWorld.createConvexHullPhysicsShape( mesh.geometry.vertices );

            break;
    }
};
Body.addPhysics = function( mesh, opt ) {
    
    switch ( mesh.geometry.type ) 
    {
        case "SphereGeometry":
        case "SphereBufferGeometry":
            // Sphere                 
            SphereBody.addPhysics( mesh, opt );
            break;

        case "BoxGeometry":
        case "BoxBufferGeometry":
            // Box
            BoxBody.addPhysics( mesh, opt );
            break;

        case "CylinderGeometry":
            // Cylinder
            CylinderBody.addPhysics( mesh, opt );
            break;
        
        case "ConeGeometry":
            // Cylinder
            ConeBody.addPhysics( mesh, opt );
            break;
            

        case "ConvexGeometry":
        case "OctahedronGeometry":
        case "TorusKnotGeometry":
            ConvexBody.addPhysics( mesh, opt );
            break;

        case "PlaneBufferGeometry":
        case "PlaneGeometry":
            PlaneBody.addPhysics( mesh, opt );
            break;

        default:
            // Cone
            v = options.size || p.height * 5;
            console.log("PhysicWorld::unkown type of geometry: ", p );
            //shape = PhysicWorld.createConvexHullPhysicsShape( mesh.geometry.vertices );

            break;
    }
};



const Mesh = function( geometry, material, mass ){
    THREE.Mesh.call( this, geometry, material );
};
Mesh.prototype = Object.create( THREE.Mesh.prototype );
Mesh.prototype.constructor = Mesh;

export { Mesh as ObjectMesh, Body as ObjectBody }