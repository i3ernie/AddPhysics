/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import Physijs from "../../src/physi.js";
import * as THREE from "../../src/three.module.js";
import OrbitControls from "../../examples/js/extras/controls/OrbitControls.js"
import Stats from "../../examples/js/stats.module.js";
import BufferGeometryUtils from "../../src/utils/BufferGeometryUtils.js";
   
                    

			// Graphics variables
			var container, stats;
			var camera, controls, scene, renderer;
			var textureLoader;
			var clock = new THREE.Clock();
			var clickRequest = false;
			var mouseCoords = new THREE.Vector2();
			var raycaster = new THREE.Raycaster();
			var ballMaterial = new THREE.MeshPhongMaterial( { color: 0x202020 } );
			var pos = new THREE.Vector3();
			var quat = new THREE.Quaternion();
                        let report = null;

			// Physics variables
			var gravityConstant = - 9.8;
			var physicsWorld;
			var rigidBodies = [];
			var softBodies = [];
			var margin = 0.05;
			var transformAux1;
			var softBodyHelpers;

			Ammo().then( function( AmmoLib ) {

				Ammo = AmmoLib;

				init();
				animate();

			} );

			function init() {

				initGraphics();

				initPhysics();

				createObjects();

				initInput();

			}

			function initGraphics() {

				container = document.getElementById( 'container' );

				camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 2000 );

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0xbfd1e5 );

				camera.position.set( - 7, 5, 8 );

				controls = new OrbitControls( camera );
				controls.target.set( 0, 2, 0 );
				controls.update();

				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.shadowMap.enabled = true;

				textureLoader = new THREE.TextureLoader();

				var ambientLight = new THREE.AmbientLight( 0x404040 );
				scene.add( ambientLight );

				var light = new THREE.DirectionalLight( 0xffffff, 1 );
				light.position.set( - 10, 10, 5 );
				light.castShadow = true;
				var d = 20;
				light.shadow.camera.left = - d;
				light.shadow.camera.right = d;
				light.shadow.camera.top = d;
				light.shadow.camera.bottom = - d;

				light.shadow.camera.near = 2;
				light.shadow.camera.far = 50;

				light.shadow.mapSize.x = 1024;
				light.shadow.mapSize.y = 1024;

				scene.add( light );

				container.innerHTML = '';

				container.appendChild( renderer.domElement );

				stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';
				container.appendChild( stats.domElement );


				window.addEventListener( 'resize', onWindowResize, false );

			}

			function initPhysics() {

				// Physics configuration

				var collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
				var dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
				var broadphase = new Ammo.btDbvtBroadphase();
				var solver = new Ammo.btSequentialImpulseConstraintSolver();
				var softBodySolver = new Ammo.btDefaultSoftBodySolver();
                                
				physicsWorld = new Ammo.btSoftRigidDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration, softBodySolver );
				physicsWorld.setGravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );
				physicsWorld.getWorldInfo().set_m_gravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );

				transformAux1 = new Ammo.btTransform();
				softBodyHelpers = new Ammo.btSoftBodyHelpers();

			}

			function createObjects() {

				// Ground
				pos.set( 0, - 0.5, 0 );
				quat.set( 0, 0, 0, 1 );
                                
                                var threeObject = new Physijs.BoxMesh( new THREE.BoxBufferGeometry( 40, 1, 40, 1, 1, 1 ), new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ), 0 );
				
                            var ground = createParalellepiped( threeObject, pos, quat );
				ground.castShadow = true;
				ground.receiveShadow = true;
				textureLoader.load( "textures/grid.png", function ( texture ) {

					texture.wrapS = THREE.RepeatWrapping;
					texture.wrapT = THREE.RepeatWrapping;
					texture.repeat.set( 40, 40 );
					ground.material.map = texture;
					ground.material.needsUpdate = true;

				} );

				// Create soft volumes
				var volumeMass = 15;

				var sphereGeometry = new THREE.SphereBufferGeometry( 1.5, 40, 25 );
				sphereGeometry.translate( 5, 5, 0 );
				
                            
                                createSoftVolume( sphereGeometry, volumeMass, 250 );

				var boxGeometry = new THREE.BoxBufferGeometry( 1, 1, 5, 4, 4, 20 );
				boxGeometry.translate( - 2, 5, 0 );
				createSoftVolume( boxGeometry, volumeMass, 120 );

				// Ramp
				pos.set( 3, 1, 0 );
				quat.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), 30 * Math.PI / 180 );
                                threeObject = new Physijs.BoxMesh( new THREE.BoxBufferGeometry( 10, 1, 4, 1, 1, 1 ), new THREE.MeshPhongMaterial( { color: 0x606060 } ), 0 );
				var obstacle = createParalellepiped( threeObject, pos, quat );
				obstacle.castShadow = true;
				obstacle.receiveShadow = true;

			}


			

			function createSoftVolume( bufferGeom, mass, pressure ) {

                                
                            let mat = new THREE.MeshPhongMaterial( { color: 0xFFFFFF } );
                            textureLoader.load( "textures/colors.png", function ( texture ) {

					mat.map = texture;
					mat.needsUpdate = true;

				} );

				
                                let volume = new Physijs.SoftMesh( bufferGeom, mat, mass, pressure );	
                                console.log(volume.physicsBody);
                            
                                volume.castShadow = true;
				volume.receiveShadow = true;
				volume.frustumCulled = false;
				scene.add( volume );

				let _physijs = volume.physicsBody._physijs;

				// Volume physic object

				var volumeSoftBody = softBodyHelpers.CreateFromTriMesh(
					physicsWorld.getWorldInfo(),
					_physijs.ammoVertices,
					_physijs.ammoIndices,
					_physijs.ammoIndices.length / 3,
					true );

				var sbConfig = volumeSoftBody.get_m_cfg();
				sbConfig.set_viterations( 40 );
				sbConfig.set_piterations( 40 );

				// Soft-soft and soft-rigid collisions
				sbConfig.set_collisions( 0x11 );

				// Friction
				sbConfig.set_kDF( 0.1 );
				// Damping
				sbConfig.set_kDP( 0.01 );
				// Pressure
				sbConfig.set_kPR( pressure );
				// Stiffness
				volumeSoftBody.get_m_materials().at( 0 ).set_m_kLST( 0.9 );
				volumeSoftBody.get_m_materials().at( 0 ).set_m_kAST( 0.9 );

				volumeSoftBody.setTotalMass( mass, false );
				Ammo.castObject( volumeSoftBody, Ammo.btCollisionObject ).getCollisionShape().setMargin( margin );
				
                                physicsWorld.addSoftBody( volumeSoftBody, 1, - 1 );
				volume.userData.physicsBody = volumeSoftBody;
				// Disable deactivation
				volumeSoftBody.setActivationState( 4 );

				softBodies.push( volume );

			}

			function createParalellepiped( threeObject, pos, quat ) {

				console.log(threeObject);
                                let _physijs = threeObject.physicsBody._physijs;
                            var shape = new Ammo.btBoxShape( new Ammo.btVector3( _physijs.width * 0.5, _physijs.height * 0.5, _physijs.depth * 0.5 ) );
				shape.setMargin( margin );

				createRigidBody( threeObject, shape, _physijs.mass, pos, quat );

				return threeObject;

			}

			function createRigidBody( threeObject, physicsShape, mass, pos, quat ) {

				threeObject.position.copy( pos );
				threeObject.quaternion.copy( quat );

				var transform = new Ammo.btTransform();
				transform.setIdentity();
				transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
				transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
				var motionState = new Ammo.btDefaultMotionState( transform );

				var localInertia = new Ammo.btVector3( 0, 0, 0 );
				physicsShape.calculateLocalInertia( mass, localInertia );

				var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
				var body = new Ammo.btRigidBody( rbInfo );

				threeObject.userData.physicsBody = body;

				scene.add( threeObject );

				if ( mass > 0 ) {

					rigidBodies.push( threeObject );

					// Disable deactivation
					body.setActivationState( 4 );

				}

				physicsWorld.addRigidBody( body );

				return body;

			}

			function initInput() {

				window.addEventListener( 'mousedown', function ( event ) {

					if ( ! clickRequest ) {

						mouseCoords.set(
							( event.clientX / window.innerWidth ) * 2 - 1,
							- ( event.clientY / window.innerHeight ) * 2 + 1
						);

						clickRequest = true;

					}

				}, false );

			}

			function processClick() {

				if ( clickRequest ) {

					raycaster.setFromCamera( mouseCoords, camera );

					// Creates a ball
					var ballMass = 3;
					var ballRadius = 0.4;

					var ball = new THREE.Mesh( new THREE.SphereBufferGeometry( ballRadius, 18, 16 ), ballMaterial );
					ball.castShadow = true;
					ball.receiveShadow = true;
					var ballShape = new Ammo.btSphereShape( ballRadius );
					ballShape.setMargin( margin );
					pos.copy( raycaster.ray.direction );
					pos.add( raycaster.ray.origin );
					quat.set( 0, 0, 0, 1 );
					var ballBody = createRigidBody( ball, ballShape, ballMass, pos, quat );
					ballBody.setFriction( 0.5 );

					pos.copy( raycaster.ray.direction );
					pos.multiplyScalar( 14 );
					ballBody.setLinearVelocity( new Ammo.btVector3( pos.x, pos.y, pos.z ) );

					clickRequest = false;

				}

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				requestAnimationFrame( animate );

				render();
				stats.update();

			}

			function render() {

				var deltaTime = clock.getDelta();

				updatePhysics( deltaTime );

				processClick();

				renderer.render( scene, camera );

			}
                        
                        function updateSoftBody( report ){
                            
                            let length = report[1];
                            let offset = 2;
                            
                            for ( var i = 0, il = length; i < il; i ++ ) {
                                
                                var volume = softBodies[ i ];
                                var geometry = volume.geometry;
                                var volumePositions = geometry.attributes.position.array;
				var volumeNormals = geometry.attributes.normal.array;
                                
                                let _physijs = volume.physicsBody._physijs;
                                var association = _physijs.ammoIndexAssociation;
                                
                                let numVerts = report[ offset ];
                                
                                for ( var j = 0; j < numVerts; j ++ ) {
                                    var assocVertex = association[ j ];

                                    for ( var k = 0, kl = assocVertex.length; k < kl; k ++ ) {

                                            var indexVertex = assocVertex[ k ];
                                            volumePositions[ indexVertex ] = report[offset+1];
                                            volumeNormals[ indexVertex ] = report[offset+4];
                                            indexVertex ++;
                                            volumePositions[ indexVertex ] = report[offset+2];
                                            volumeNormals[ indexVertex ] = report[offset+5];
                                            indexVertex ++;
                                            volumePositions[ indexVertex ] = report[offset+3];
                                            volumeNormals[ indexVertex ] = report[offset+6];

                                    }
                                    offset += 6;
                                }
                                offset += 1;
                                
                                geometry.attributes.position.needsUpdate = true;
				geometry.attributes.normal.needsUpdate = true;
                            }
                        } 

			function updatePhysics( deltaTime ) {

				// Step world
				physicsWorld.stepSimulation( deltaTime, 10 );
                                
                                let length = softBodies.length;
                                report = [];
                                report[0] = 4;
                                report[1] = length;
                                let offset = 2;
                                let volume, _physijs, softBody;
                                

				// Update soft volumes
				for ( let i = 0, il = length; i < il; i ++ ) {

                                    volume = softBodies[ i ];
                                    _physijs = volume.physicsBody._physijs;

                                    softBody = volume.userData.physicsBody;

                                    var association = _physijs.ammoIndexAssociation;
                                    var numVerts = association.length;
                                    var nodes = softBody.get_m_nodes();
					
                                    report[ offset ] = numVerts;
                                    for ( var j = 0; j < numVerts; j ++ ) {

                                            var node = nodes.at( j );

                                            var nodePos = node.get_m_x();			
                                            report[offset+1] = nodePos.x();
                                            report[offset+2] = nodePos.y();
                                            report[offset+3] = nodePos.z();

                                            var nodeNormal = node.get_m_n();
                                            report[offset+4] = nodeNormal.x();
                                            report[offset+5] = nodeNormal.y();
                                            report[offset+6] = nodeNormal.z();

                                            offset += 6;
                                    }
                                    offset += 1;					
				}
                                updateSoftBody( report );

				// Update rigid bodies
				for ( var i = 0, il = rigidBodies.length; i < il; i ++ ) {

					var objThree = rigidBodies[ i ];
					var objPhys = objThree.userData.physicsBody;
					var ms = objPhys.getMotionState();
					if ( ms ) {

						ms.getWorldTransform( transformAux1 );
						var p = transformAux1.getOrigin();
						var q = transformAux1.getRotation();
						objThree.position.set( p.x(), p.y(), p.z() );
						objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

					}

				}

			}
