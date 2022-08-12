/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

'use strict';

import {Physijs} from "../../src/AddPhysics.js";
import {render_stats, physics_stats} from "./extras/renderStats.module.js"
import * as THREE from 'three'
	
	Physijs.scripts.worker = '../src/AddPhysics_worker.js';
	Physijs.scripts.ammo = '../../node_modules/ammo.js/ammo.js';
	
	var initScene, render, _boxes = [], spawnBox, loader = new THREE.TextureLoader(),
		renderer, scene, ground_material, ground, light, camera;
	
	initScene = function() {
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMap.enabled = true;
		renderer.shadowMapSoft = true;
		document.getElementById( 'viewport' ).appendChild( renderer.domElement );
		
		
		document.getElementById( 'viewport' ).appendChild( render_stats.domElement );
		document.getElementById( 'viewport' ).appendChild( physics_stats.domElement );

		scene = new Physijs.Scene();
		scene.setGravity( new THREE.Vector3( 0, -30, 0 ) );
		scene.addEventListener( 'update', function() {
				scene.simulate( undefined, 1 );
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
		light.shadowCameraLeft = -60;
		light.shadowCameraTop = -60;
		light.shadowCameraRight = 60;
		light.shadowCameraBottom = 60;
		light.shadowCameraNear = 20;
		light.shadowCameraFar = 200;
		light.shadowBias = -.0001
		light.shadowMapWidth = light.shadowMapHeight = 2048;
		light.shadowDarkness = .7;
		scene.add( light );
		
		// Ground
		ground_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: loader.load( 'images/rocks.jpg' ) }),
			.8, // high friction
			.3 // low restitution
		);
		ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
		ground_material.map.repeat.set( 3, 3 );
		
		ground = new Physijs.BoxMesh(
			new THREE.BoxGeometry(100, 1, 100),
			ground_material,
			0 // mass
		);
		ground.receiveShadow = true;
		scene.add( ground );
		
		spawnBox();
		
		requestAnimationFrame( render );
		scene.simulate();
	};
	
	spawnBox = (function() {
		var box_geometry = new THREE.BoxGeometry( 4, 4, 4 );
		const handleCollision = function( collided_with, linearVelocity, angularVelocity ) { console.log(collided_with);
				switch ( ++this.collisions ) {
					
					case 1:
						this.material.color.setHex(0xcc8855);
						break;
					
					case 2:
						this.material.color.setHex(0xbb9955);
						break;
					
					case 3:
						this.material.color.setHex(0xaaaa55);
						break;
					
					case 4:
						this.material.color.setHex(0x99bb55);
						break;
					
					case 5:
						this.material.color.setHex(0x88cc55);
						break;
					
					case 6:
						this.material.color.setHex(0x77dd55);
						break;
				}
			},
			createBox = function() {
				var box, material;
				
				material = Physijs.createMaterial(
					new THREE.MeshLambertMaterial({ map: loader.load( 'images/plywood.jpg' ) }),
					.6, // medium friction
					.3 // low restitution
				);
				material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
				material.map.repeat.set( .5, .5 );
				
				//material = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( 'images/rocks.jpg' ) });
				
				box = new Physijs.BoxMesh(
					box_geometry,
					material
				);
				box.collisions = 0;
				
				box.position.set(
					Math.random() * 15 - 7.5,
					25,
					Math.random() * 15 - 7.5
				);
				
				box.rotation.set(
					Math.random() * Math.PI,
					Math.random() * Math.PI,
					Math.random() * Math.PI
				);
				
				box.castShadow = true;
				box.addEventListener( 'collision', handleCollision );
				box.addEventListener( 'ready', spawnBox );
				scene.add( box );
			};
		
		return function() {
			setTimeout( createBox, 1000 );
		};
	})();
	
	render = function() {
		requestAnimationFrame( render );
		renderer.render( scene, camera );
		render_stats.update();
	};
	
	initScene();
