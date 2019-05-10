/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

'use strict';

import Physijs from "../../src/physi.js";
import * as THREE from "../../src/three.module.js";
import Stats from "./stats.module.js";
import TWEEN from "./tween.js";

Physijs.scripts.worker = '../src/physijs_worker.js';
Physijs.scripts.ammo = '../examples/js/ammo.js';
	
	
	var initScene, render, createShape, loader,
		renderer, render_stats, physics_stats, scene, physicsWorld, light, ground, ground_material, camera;
	
	initScene = function() {
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
                    fixedTimeStep: 1 / 120, 
                    gravity : new THREE.Vector3( 0, -30, 0 ) 
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
		camera.position.set( 60, 50, 60 );
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

		// Loader
		loader = new THREE.TextureLoader();
		
		// Materials
		ground_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: loader.load( 'images/rocks.jpg' ) }),
			.8, // high friction
			.4 // low restitution
		);
		ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
		ground_material.map.repeat.set( 2.5, 2.5 );
		
		// Ground
		ground = new THREE.Mesh(
			new THREE.BoxGeometry(50, 1, 50),
			//new THREE.PlaneGeometry(50, 50),
			ground_material
		);
		ground.receiveShadow = true;
		
		// Bumpers
		let bumper_geom = new THREE.BoxGeometry(2, 1, 50);
		
		let bumper1 = new THREE.Mesh( bumper_geom, ground_material );
		bumper1.position.y = 1;
		bumper1.position.x = -24;
		bumper1.receiveShadow = true;
		bumper1.castShadow = true;
		
		let bumper2 = new THREE.Mesh( bumper_geom, ground_material );
		bumper2.position.y = 1;
		bumper2.position.x = 24;
		bumper2.receiveShadow = true;
		bumper2.castShadow = true;
		
		let bumper3 = new THREE.Mesh( bumper_geom, ground_material );
		bumper3.position.y = 1;
		bumper3.position.z = -24;
		bumper3.rotation.y = Math.PI / 2;
		bumper3.receiveShadow = true;
		bumper3.castShadow = true;
	
		let bumper4 = new THREE.Mesh( bumper_geom, ground_material );
		bumper4.position.y = 1;
		bumper4.position.z = 24;
		bumper4.rotation.y = Math.PI / 2;
		bumper4.receiveShadow = true;
		bumper4.castShadow = true;
                
                Physijs.BoxBody.addPhysics( ground, { mass: 0 } );
                Physijs.BoxBody.addPhysics( bumper1, { mass: 0, restitution: .2 } );
                Physijs.BoxBody.addPhysics( bumper2, { mass: 0, restitution: .2 } );
                Physijs.BoxBody.addPhysics( bumper3, { mass: 0, restitution: .2 } );
                Physijs.BoxBody.addPhysics( bumper4, { mass: 0, restitution: .2 } );
                
                scene.add( ground );
                scene.add( bumper1 );
                scene.add( bumper2 );
                scene.add( bumper3 );
                scene.add( bumper4 );
            
		requestAnimationFrame( render );
		physicsWorld.simulate();

		createShape();
	};
	
	render = function() {
		requestAnimationFrame( render );
		renderer.render( scene, camera );
		render_stats.update();
	};
	
	createShape = (function() {
		var addshapes = true,
			shapes = 0,
			box_geometry = new THREE.BoxGeometry( 3, 3, 3 ),
			sphere_geometry = new THREE.SphereGeometry( 1.5, 32, 32 ),
			cylinder_geometry = new THREE.CylinderGeometry( 2, 2, 1, 32 ),
			cone_geometry = new THREE.ConeGeometry( 2, 4, 32 ),
			octahedron_geometry = new THREE.OctahedronGeometry( 1.7, 1 ),
			torus_geometry = new THREE.TorusKnotGeometry ( 1.7, .2, 32, 4 ),
			doCreateShape;
		
		setTimeout(
			function addListener() {
				var button = document.getElementById( 'stop' );
				if ( button ) {
					button.addEventListener( 'click', function() { addshapes = false; } );
				} else {
					setTimeout( addListener );
				}
			}
		);
			
		doCreateShape = function() {
			let shape, material = new THREE.MeshLambertMaterial({ opacity: 0, transparent: true });
                        let opt = {};
			
			switch ( Math.floor(Math.random() * 6) ) {
				case 0:
					shape = new THREE.Mesh(
						box_geometry,
						material
					);
					break;
				
				case 1:
					shape = new THREE.Mesh(
						sphere_geometry,
						material
					);
                                        opt = { restitution: Math.random() * 1.5 };
					break;
				
				case 2:
					shape = new THREE.Mesh(
						cylinder_geometry,
						material
					);
					break;
				
				case 3:
					shape = new THREE.Mesh(
						cone_geometry,
						material
					);
					break;
				
				case 4:
					shape = new THREE.Mesh(
						octahedron_geometry,
						material
					);
					break;
				
				case 5:
					shape = new THREE.Mesh(
						torus_geometry,
						material
					);
					break;
			}
                  
				
			shape.material.color.setRGB( Math.random() * 100 / 100, Math.random() * 100 / 100, Math.random() * 100 / 100 );
			shape.castShadow = true;
			shape.receiveShadow = true;
			
			shape.position.set(
				Math.random() * 30 - 15,
				20,
				Math.random() * 30 - 15
			);
			
			shape.rotation.set(
				Math.random() * Math.PI,
				Math.random() * Math.PI,
				Math.random() * Math.PI
			);
			
			if ( addshapes ) { 
				shape.addEventListener( 'ready', function(){ setTimeout(createShape, 500); } );
			}
                        
                        scene.add( shape );
                        
                        Physijs.ObjectBody.addPhysics( shape, opt );
                        
			
			
			new TWEEN.Tween( shape.material ).to({opacity: 1}, 500).start();
			
			document.getElementById( 'shapecount' ).textContent = ( ++shapes ) + ' shapes created';
		};
		
		return function() {
			setTimeout( doCreateShape, 250 );
		};
	})();
	
	window.onload = initScene;
