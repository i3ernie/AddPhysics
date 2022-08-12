'use strict';
        
import Physijs from "AddPhysics";
import * as THREE from "three";
import Stats from "Stats";
	
	Physijs.scripts.worker = '../src/AddPhysics_worker.js';
	Physijs.scripts.ammo = '../../node_modules/ammo.js/ammo.js';
	
	var _boxes = [], renderer, render_stats, physics_stats, scene, ground_material, ground, light, loader, camera;

	var cubes = [];
	var total_cubes = 0;
	var total_ready = 0;
	var max_on_screen = 100;
	var spawn_per_tick = 25;
	
	const initScene = function() {
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

		scene = new Physijs.Scene;
		scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
		scene.addEventListener(	'update', function() {
				scene.simulate( undefined, 1 );
				physics_stats.update();
				while(cubes.length > max_on_screen) {
					scene.remove( cubes[0] );
					cubes[0].geometry.dispose();
					cubes[0].material.dispose();
					cubes.splice( 0, 1 );
				}
				document.getElementById( 'totalcubecount' ).textContent = ( total_cubes );
        		document.getElementById( 'currentcubecount' ).textContent = ( cubes.length );
        		document.getElementById( 'totalobjects' ).textContent = ( Object.keys(scene._objects).length );
        		if(total_cubes > total_ready){
        			return;
        		}
        		for (let i=0; i<spawn_per_tick; i++) { 
                            spawnBox();
			}
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

		// Loader
		loader = new THREE.TextureLoader();
		
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
	
	const spawnBox = (function() {
		var box_geometry = new THREE.BoxGeometry( 4, 4, 4 ),
			createBox = function() {
				var box, material, childBox;
				total_cubes++;

				material = Physijs.createMaterial(
					new THREE.MeshLambertMaterial({ opacity: .9, transparent: true }),
					.6, // medium friction
					.3 // low restitution
				);

				material.color.setRGB(Math.random() * 100 / 100, Math.random() * 100 / 100, Math.random() * 100 / 100);
				
				box = new Physijs.BoxMesh(
					box_geometry,
					material
				);
                childBox = new Physijs.BoxMesh(
                  box_geometry,
                  material
                );

                childBox.collisions = 0;
				box.collisions = 0;
                box.add(childBox);
				
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
				box.addEventListener( 'ready', inc_ready );

				cubes.push( box );
				scene.add( box );
			};
		
		return function() {
			createBox();
		};
	})();
	
	const inc_ready = function() {
		total_ready++;
	}

	const render = function() {
		requestAnimationFrame( render );
		renderer.render( scene, camera );
		render_stats.update();
	};
	
	initScene();