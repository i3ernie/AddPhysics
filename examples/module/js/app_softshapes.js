/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

'use strict';

import {Physijs, THREE} from "../../../dist/THREEAddPhysics.module.js";

import Stats from "./libs/stats.module.js";
import TWEEN from "./libs/tween.module.js";

Physijs.scripts.worker = '../../dist/AddPhysicsWorkerAmmo.js';
	
	
	var render, createShape, loader,
		renderer, render_stats, physics_stats, scene, physicsWorld, light, ground, ground_material, camera;
        let textureLoader = new THREE.TextureLoader();
	
	const initScene = function() {
            TWEEN.start();

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize( window.innerWidth, window.innerHeight );
            renderer.shadowMap.enabled = true;
            renderer.shadowMapSoft = true;
            document.getElementById( 'viewport' ).appendChild( renderer.domElement );

            render_stats = new Stats();
            render_stats.domElement.style.position = 'absolute';
            render_stats.domElement.style.top = '0px';
            render_stats.domElement.style.zIndex = 100;
            document.getElementById( 'viewport' ).appendChild( render_stats.domElement );

            physics_stats = new Stats();
            physics_stats.domElement.style.position = 'absolute';
            physics_stats.domElement.style.top = '50px';
            physics_stats.domElement.style.zIndex = 100;
            document.getElementById( 'viewport' ).appendChild( physics_stats.domElement );

            scene = new THREE.Scene();

            physicsWorld = Physijs.PhysicsWorld.addPhysics( scene, { 
                type : "soft",
                fixedTimeStep: 1 / 120, 
                gravity : {x: 0, y: -9.81, z:0} 
            });
            

            physicsWorld.addEventListener( 'update', function() {
                    physicsWorld.simulate( undefined, 2 );
                    physics_stats.update();
            });

            camera = new THREE.PerspectiveCamera(
                    35,
                    window.innerWidth / window.innerHeight,
                    1,
                    1000
            );
            camera.position.set( 20, 20, 20 );
            camera.lookAt( scene.position );
            scene.add( camera );

            // Light
            light = new THREE.DirectionalLight( 0xFFFFFF );
            light.position.set( 20, 40, -15 );
            light.target.position.copy( scene.position );
            light.castShadow = true;
            light.shadow.camera.left = -60;
            light.shadow.camera.top = -60;
            light.shadow.camera.right = 60;
            light.shadow.camera.bottom = 60;
            light.shadow.camera.near = 20;
            light.shadow.camera.far = 200;
            light.shadow.bias = -.001
            light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;
            scene.add( light );
          

            // Materials
            ground_material = Physijs.createMaterial(
                    new THREE.MeshPhongMaterial({ color: 0xFFFFFF }),
                    .8, // high friction
                    .4 // low restitution
            );
            textureLoader.load( "../textures/grid.png", function ( texture ) {

                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set( 40, 40 );
                    ground_material.map = texture;
                    ground_material.needsUpdate = true;

            });
    

            // Ground
            ground = new Physijs.BoxMesh( new THREE.BoxBufferGeometry( 40, 1, 40, 1, 1, 1 ), ground_material, 0 );
            /*
            ground = new THREE.Mesh(
                    new THREE.BoxGeometry( 40, 1, 40, 1, 1, 1 ),
                    //new THREE.PlaneGeometry(50, 50),
                    ground_material
            );*/
            ground.receiveShadow = true;
		
            
            // Ramp
               var quat = new THREE.Quaternion();
		quat.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), 30 * Math.PI / 180 );
            
            let ramp = new THREE.Mesh( new THREE.BoxBufferGeometry( 10, 1, 4, 1, 1, 1 ), new THREE.MeshPhongMaterial( { color: 0x606060 } ) );
            ramp.position.set( 3, 1, 0 );
            ramp.rotation.set( 0, 0, 30 * Math.PI / 180 );
            Physijs.BoxBody.addPhysics( ramp, {mass:0} );    
           

            scene.add( ground, ramp );
            //Physijs.ObjectBody.addPhysics( scene.children );

            requestAnimationFrame( render );
            physicsWorld.simulate();

            createShape();
	};
	
	render = function() {
            requestAnimationFrame( render );
            renderer.render( scene, camera );
            render_stats.update();
	};
	
	createShape = function() {
            let volumeMass = 15;
            let sphereGeometry = new THREE.SphereBufferGeometry( 1.5, 40, 25 );
            sphereGeometry.translate( 5, 5, 0 );
            
            let boxGeometry = new THREE.BoxBufferGeometry( 1, 1, 5, 4, 4, 20 );
            boxGeometry.translate( - 2, 5, 0 );
            
            let mat = new THREE.MeshPhongMaterial( { color: 0xFFFFFF } );
            textureLoader.load( "../textures/colors.png", function ( texture ) {
                    mat.map = texture;
                    mat.needsUpdate = true;

            });
            
            let shape1 = new Physijs.SoftMesh( sphereGeometry, mat, volumeMass, 250 );
            let shape2 = new Physijs.SoftMesh( boxGeometry, mat, volumeMass, 120 );
            
            
            scene.add( shape1);
            scene.add( shape2 );
	
	};
	
	window.onload = initScene;
