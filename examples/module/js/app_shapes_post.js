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
                gravity : new THREE.Vector3( 0, -9.81, 0 ) 
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
                    new THREE.MeshLambertMaterial({ map: loader.load( '../textures/rocks.jpg' ) }),
                    .8, // high friction
                    .4 // low restitution
            );
            ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
            ground_material.map.repeat.set( 2.5, 2.5 );

            // Ground
            ground = new THREE.Mesh(
                    new THREE.BoxGeometry( 50, 1, 50 ),
                    //new THREE.PlaneGeometry(50, 50),
                    ground_material
            );
            ground.receiveShadow = true;
		
            // Bumpers
            let bumper_geom = new THREE.BoxGeometry( 2, 1, 50 );

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


            ground.userData.physics = { mass: 0 };
            bumper1.userData.physics = { mass: 0, restitution: .2 };
            bumper2.userData.physics = { mass: 0, restitution: .2 };
            bumper3.userData.physics = { mass: 0, restitution: .2 };
            bumper4.userData.physics = { mass: 0, restitution: .2 };                

            scene.add( ground, bumper1, bumper2, bumper3, bumper4 );
            Physijs.ObjectBody.addPhysics( scene.children );

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
                    geos =[
                        new THREE.BoxGeometry( 3, 3, 3 ),
                        new THREE.SphereGeometry( 1.5, 32, 32 ),
                        new THREE.CylinderGeometry( 2, 2, 1, 32 ),
                        new THREE.ConeGeometry( 2, 4, 32 ),
                        new THREE.OctahedronGeometry( 1.7, 1 ),
                        new THREE.TorusKnotGeometry ( 1.7, .2, 32, 4 ),
                        new THREE.TorusKnotGeometry ( 1.7, .2, 32, 4 )
                    ],

                    doCreateShape;
		
		setTimeout(
                    function addListener() {
                        var button = document.getElementById( 'stop' );
                        if ( button ) {
                                button.addEventListener( 'click', function() { addshapes = !addshapes; } );
                        } else {
                                setTimeout( addListener );
                        }
                    }
		);
			
		doCreateShape = function() {
                    let shape, material = new THREE.MeshLambertMaterial({ opacity: 0, transparent: true });
                    let opt = {};
			
                    shape = new THREE.Mesh( geos[Math.floor(Math.random() * 6)], material );
                  
				
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
