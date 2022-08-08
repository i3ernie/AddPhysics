/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

'use strict';

import {Physijs} from "AddPhysics";
import * as THREE from "three";

import * as stats from "./extras/renderStats.module.js";
import TWEEN from "./tween.js";
import Viewport from "../../node_modules/three-viewport/dist/viewport.es.js";
import randomShape from "./shapes/randomShape.es6.js";
import GroundTable from "./shapes/GroundTable.es6.js";
import StandartDirLight from "./lights/DirLightStd.es6.js";



Physijs.scripts.worker = '../src/AddPhysics_worker.js';
Physijs.scripts.ammo = '../examples/js/ammo.js';
	
	
	var shapes = 0, addshapes = true,
		physicsWorld, light, VP = new Viewport({$vp:document.getElementById( 'viewport' )});
	
	const initScene = function() {
            TWEEN.start();
            VP.init();

            document.getElementById( 'viewport' ).appendChild( stats.render_stats.domElement );
            document.getElementById( 'viewport' ).appendChild( stats.physics_stats.domElement );

            physicsWorld = Physijs.PhysicsWorld.addPhysics( VP.scene, { 
                fixedTimeStep: 1 / 120, 
                gravity : new THREE.Vector3( 0, -9.81, 0 ) 
            });

            physicsWorld.addEventListener( 'update', function() { 
                    physicsWorld.simulate( undefined, 2 );
                    stats.physics_stats.update();
            });

            VP.camera.position.set( 60, 50, 60 );
            VP.camera.lookAt( VP.scene.position );

            // Light
            light = new StandartDirLight( );
            light.position.set( 20, 40, -15 );
            light.target.position.copy( VP.scene.position );
            VP.scene.add( light );

            const ground = new GroundTable();
            while ( ground.children.length > 0 ){
                VP.scene.add( ground.children[0] );
            }

            
            Physijs.ObjectBody.addPhysics( VP.scene.children );

            //requestAnimationFrame( render );
            physicsWorld.simulate();

            //VP.loop.add(stats.render_stats.update);

            registerEvents();
            VP.start();

            setTimeout( createShape, 250 );
	};
	
    
    const registerEvents = function(){
           
        let button = document.getElementById( 'stop' );
        if ( button ) {
                button.addEventListener( 'click', function() { addshapes = !addshapes; } );
        }     
        
    };
	
	const createShape = function() {
            let opt = {};
            let shape = randomShape();
        
            if ( addshapes ) { 
                shape.addEventListener( 'ready', function(){ setTimeout(createShape, 500); } );
            }

            VP.scene.add( shape );

            Physijs.ObjectBody.addPhysics( shape, opt );

            new TWEEN.Tween( shape.material ).to({opacity: 1}, 500).start();

            document.getElementById( 'shapecount' ).textContent = ( ++shapes ) + ' shapes created';
	};
		
	
 initScene();