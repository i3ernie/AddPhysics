'use strict';
import Physijs from '../../src/AddPhysics.js';
import * as THREE from "../../node_modules/three/build/three.module.js";
import Stats from "../../node_modules/stats.js/src/Stats.js";
	
	Physijs.scripts.worker = '../src/AddPhysics_worker.js';
	Physijs.scripts.ammo = '../examples/js/ammo.js';
	
	var initScene, render, applyForce, setMousePosition, mouse_position,
		ground_material, box_material, loader,
		renderer, render_stats, physics_stats, scene, ground, light, camera, box, boxes = [];

		let armMovement =0;
		let hinge;
	
	initScene = function() {
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMap.enabled = true;
		renderer.shadowMapSoft = true;
		document.getElementById( 'viewport' ).appendChild( renderer.domElement );
		
		render_stats = new Stats();
		render_stats.domElement.style.position = 'absolute';
		render_stats.domElement.style.top = '1px';
		render_stats.domElement.style.zIndex = 100;
		document.getElementById( 'viewport' ).appendChild( render_stats.domElement );

		physics_stats = new Stats();
		physics_stats.domElement.style.position = 'absolute';
		physics_stats.domElement.style.top = '50px';
		physics_stats.domElement.style.zIndex = 100;
		document.getElementById( 'viewport' ).appendChild( physics_stats.domElement );
		
		scene = new Physijs.Scene;
		scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
		
		scene.addEventListener(	'update', function() {
				applyForce();
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
		light.shadow.camera.left = -60;
		light.shadow.camera.top = -60;
		light.shadow.camera.right = 60;
		light.shadow.camera.bottom = 60;
		light.shadow.camera.near = 20;
		light.shadow.camera.far = 200;
		light.shadow.bias = -.001;
		light.shadowMapWidth = light.shadowMapHeight = 2048;
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
		ground_material.map.repeat.set( 3, 3 );
		
		box_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: loader.load( 'images/plywood.jpg' ) }),
			.4, // low friction
			.6 // high restitution
		);
		box_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
		box_material.map.repeat.set( .25, .25 );
		
		// Ground
		ground = new Physijs.BoxMesh( new THREE.BoxGeometry( 100, 1, 100 ), ground_material, 0 );
		//Physijs.BoxBody.make( ground, {mass:0});
		ground.receiveShadow = true;
		scene.add( ground );

		let pylonHeight = 10;
		let armLength = 4;
		let base = new Physijs.BoxMesh( new THREE.BoxGeometry(3, 0.2, 3), box_material, 0 );
		base.position.set( 0, 0.6, 0 );
		//base = Physijs.BoxBody.make( base, {mass: 0} );
		scene.add( base );

		let pylon = new Physijs.BoxMesh( new THREE.BoxGeometry(0.4, pylonHeight, 0.4), box_material, 0 );
		pylon.position.set( 0, pylonHeight*.5 + .7, 0 );
		//pylon = Physijs.BoxBody.make( pylon, {mass: 0} );
		scene.add( pylon );

		let arm = new Physijs.BoxMesh( new THREE.BoxGeometry(0.4, 0.4, armLength), box_material, 2 );
		arm.position.set( 0, pylonHeight + .9, 1.8 );
		//arm = Physijs.BoxBody.make( arm, {mass: 2} );
		scene.add( arm );

		var pivotA = new THREE.Vector3( 0, pylonHeight * .5, 0 );
		var pivotB = new THREE.Vector3( 0, -0.2, - armLength * .5 );
		var axis = new THREE.Vector3( 0, 1, 0 );

		hinge = new Physijs.HingeConstraint( pylon, arm, pivotA, axis );



		scene.addConstraint( hinge );
		
		requestAnimationFrame( render );
		scene.simulate();
	};

	function initInput() {

		window.addEventListener( 'keydown', function( event ) {

			switch ( event.keyCode ) {
				// Q
				case 81:
					armMovement = 1;
				break;

				// A
				case 65:
					armMovement = - 1;
				break;
			}

		}, false );

		window.addEventListener( 'keyup', function( event ) {

			armMovement = 0;

		}, false );

	}
	
	render = function() {
		requestAnimationFrame( render );
		renderer.render( scene, camera );
		// Hinge control
		hinge.enableAngularMotor( 1.5 * armMovement, 50 );
		render_stats.update();
	};
	
	
	applyForce = function() {
		
	};
	
	window.onload = function(){
		initScene();
		initInput();
	};