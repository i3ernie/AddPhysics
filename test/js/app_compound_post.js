/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

'use strict';
import {Physijs, THREE} from "../../src/AddPhysics.js";
import {render_stats, physics_stats} from "./extras/renderStats.module.js"
import Viewport from "../../node_modules/three-viewport/dist/viewport.es.js"
import StandartDirLight from "./lights/DirLightStd.es6.js";
	
	Physijs.scripts.worker = '../src/AddPhysics_worker.js';
	Physijs.scripts.ammo = '../examples/js/ammo.js';
	
	var ground, light,  
		ground_material, chair_material, loader, VP = new Viewport({$vp : document.getElementById( 'viewport' )});
	
	const initScene = function() {
		VP.init();
		
		
		document.getElementById( 'viewport' ).appendChild( render_stats.domElement );
		document.getElementById( 'viewport' ).appendChild( physics_stats.domElement );
		
		let physicsWorld = Physijs.PhysicsWorld.addPhysics( VP.scene, { 
			fixedTimeStep: 1 / 120, 
			gravity : new THREE.Vector3( 0, -50, 0 ) 
		});
		
		physicsWorld.addEventListener(	'update', function() {
			physicsWorld.simulate( undefined, 2 );
				physics_stats.update();
		});
		
		
		VP.camera.position.set( 60, 50, 60 );
		VP.camera.lookAt( VP.scene.position );
		
		
		// Light
		light = new StandartDirLight( );
		light.position.set( 20, 40, -15 );
		light.target.position.copy( VP.scene.position );
		VP.scene.add( light );

		// Loader
		loader = new THREE.TextureLoader();
		
		// Materials
		ground_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: loader.load( 'images/rocks.jpg' ) }),
			.8, // high friction
			.4 // low restitution
		);
		ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
		ground_material.map.repeat.set( 3, 3 );
		
		chair_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: loader.load( 'images/wood.jpg' ) }),
			.6, // medium friction
			.2 // low restitution
		);
		chair_material.map.wrapS = chair_material.map.wrapT = THREE.RepeatWrapping;
		chair_material.map.repeat.set( .25, .25 );
		
		// Ground
		ground = new Physijs.BoxMesh(
			new THREE.BoxGeometry(100, 1, 100),
			ground_material,
			0 // mass
		);;
		ground.receiveShadow = true;
		VP.scene.add( ground );
		
		spawnChair();
		
		VP.start();
		physicsWorld.simulate();
	};
	
	const spawnChair = (function() {
		var doSpawn;
		
		const buildBack = function() {
			var back, _object;
			
			back = new Physijs.BoxMesh(
				new THREE.BoxGeometry( 5, 1, .5 ),
				chair_material
			);
			back.position.y = 5;
			back.position.z = -2.5;
			back.castShadow = true;
			back.receiveShadow = true;
			
			// rungs - relative to back
			_object = new Physijs.BoxMesh(
				new THREE.BoxGeometry( 1, 5, .5 ),
				chair_material
			);
			_object.position.y = -3;
			_object.position.x = -2;
			_object.castShadow = true;
			_object.receiveShadow = true;
			back.add( _object );
			
			_object = new Physijs.BoxMesh(
				new THREE.BoxGeometry( 1, 5, .5 ),
				chair_material
			);
			_object.position.y = -3;
			_object.castShadow = true;
			_object.receiveShadow = true;
			back.add( _object );
			
			_object = new Physijs.BoxMesh(
				new THREE.BoxGeometry( 1, 5, .5 ),
				chair_material
			);
			_object.position.y = -3;
			_object.position.x = 2;
			_object.castShadow = true;
			_object.receiveShadow = true;
			back.add( _object );
			
			return back;
		};
		
		const buildLegs = function() {
			var leg, _leg;
			
			// back left
			leg = new Physijs.BoxMesh(
				new THREE.BoxGeometry( .5, 4, .5 ),
				chair_material
			);
			leg.position.x = 2.25;
			leg.position.z = -2.25;
			leg.position.y = -2.5;
			leg.castShadow = true;
			leg.receiveShadow = true;
			
			// back right - relative to back left leg
			_leg = new Physijs.BoxMesh(
				new THREE.BoxGeometry( .5, 4, .5 ),
				chair_material
			);
			_leg.position.x = -4.5;
			_leg.castShadow = true;
			_leg.receiveShadow = true;
			leg.add( _leg );
			
			// front left - relative to back left leg
			_leg = new Physijs.BoxMesh(
				new THREE.BoxGeometry( .5, 4, .5 ),
				chair_material
			);
			_leg.position.z = 4.5;
			_leg.castShadow = true;
			_leg.receiveShadow = true;
			leg.add( _leg );
			
			// front right - relative to back left leg
			_leg = new Physijs.BoxMesh(
				new THREE.BoxGeometry( .5, 4, .5 ),
				chair_material
			);
			_leg.position.x = -4.5;
			_leg.position.z = 4.5;
			_leg.castShadow = true;
			_leg.receiveShadow = true;
			leg.add( _leg );
			
			return leg;
		};
		
		doSpawn = function() {
			var chair, back, legs;
			
			// seat of the chair
			chair = new Physijs.BoxMesh(
				new THREE.BoxGeometry( 5, 1, 5 ),
				chair_material
			);
			chair.castShadow = true;
			chair.receiveShadow = true;
			
			// back - relative to chair ( seat )
			back = buildBack();
			chair.add( back );
			
			// legs - relative to chair ( seat )
			legs = buildLegs();
			chair.add( legs );
			
			chair.position.y = 20;
			chair.position.x = Math.random() * 50 - 25;
			chair.position.z = Math.random() * 50 - 25;
			
			chair.rotation.set(
				Math.random() * Math.PI * 2,
				Math.random() * Math.PI * 2,
				Math.random() * Math.PI * 2
			);
			
			chair.addEventListener( 'ready', spawnChair );
			VP.scene.add( chair );
		};
		
		return function() {
			setTimeout( doSpawn, 500 );
		};
	})();
	
	
	window.onload = initScene;
