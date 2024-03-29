
'use strict';
import  * as THREE from "three";
import DOFConstraint from "./constraints/dof_constraint.js";
import PointConstraint from "./constraints/PointConstraint.js";
import SliderConstraint from "./constraints/SliderConstraint.js";
import HingeConstraint from "./constraints/HingeConstraint.js";
import ConeTwistConstraint from "./constraints/ConeTwistConstraint.js";

import { convertWorldPositionToObject, getObjectId } from './physi_utils.js';
import Scene from './AddPhysicsScene.js';
import PhysicsWorld from './AddPhysicsWorld.js';
import { Vehicle, VehicleTuning } from './extras/PhysicsVehicle.js';

import Mesh from './bodies/PhysiMesh.js';
import { ObjectMesh, ObjectBody } from './bodies/ObjectMesh.js';
import { BoxMesh, BoxBody } from './bodies/BoxMesh.js';
import { HeightfieldMesh, HeightfieldBody } from './bodies/HeightfieldMesh.js';
import { CylinderMesh, CylinderBody } from './bodies/CylinderMesh.js';
import { SphereMesh, SphereBody } from './bodies/SphereMesh.js';
import { ConeMesh, ConeBody } from './bodies/ConeMesh.js';
import { ConvexMesh, ConvexBody } from './bodies/ConvexMesh.js';
import { CapsuleMesh, CapsuleBody } from './bodies/CapsuleMesh.js';
import { PlaneMesh, PlaneBody } from './bodies/PlaneMesh.js';
import { ConcaveMesh } from './bodies/ConcaveMesh.js';
import { SoftMesh, SoftBody } from './bodies/SoftMesh.js';

import { createMaterial } from './PhysiMaterial.js';

let _Physijs = window.Physijs; // used for noConflict method

// object assigned to window.Physijs
let Physijs = { 
        scripts : {},
        Scene : Scene,
        PhysicsWorld : PhysicsWorld,
        
        // Constraints
        DOFConstraint : DOFConstraint,
        PointConstraint : PointConstraint,
        SliderConstraint : SliderConstraint,
        HingeConstraint : HingeConstraint,
        ConeTwistConstraint : ConeTwistConstraint,
        
        Mesh : Mesh,
        ObjectMesh : ObjectMesh,
        ObjectBody : ObjectBody,
        
        //bodies
        BoxMesh : BoxMesh,
        BoxBody : BoxBody,
        CapsuleMesh : CapsuleMesh,
        CapsuleBody : CapsuleBody,
        ConeMesh : ConeMesh,
        ConeBody : ConeBody,
        ConvexMesh : ConvexMesh,
        ConvexBody : ConvexBody,
        CylinderMesh : CylinderMesh,
        CylinderBody : CylinderBody,
        HeightfieldMesh : HeightfieldMesh,
        HeightfieldBody : HeightfieldBody,
        PlaneMesh : PlaneMesh,
        PlaneBody : PlaneBody,
        SphereMesh : SphereMesh,
        SphereBody : SphereBody,
        SoftMesh : SoftMesh,
        SoftBody : SoftBody,
        
        Vehicle : Vehicle,
        VehicleTuning : VehicleTuning
    }; 

    Physijs.ConcaveMesh = ConcaveMesh;

    Physijs.PhysicsWorld.scripts = Physijs.scripts;
    Physijs.createMaterial = createMaterial;

    // Physijs.noConflict
    Physijs.noConflict = function() {
            window.Physijs = _Physijs;
            return Physijs;
    };

export default Physijs;
export { Physijs, THREE, createMaterial }