import {Physijs, THREE} from "../../../src/AddPhysics.js";

// Loader
const loader = new THREE.TextureLoader();

// Materials
let ground_material = Physijs.createMaterial(
    new THREE.MeshLambertMaterial({ map: loader.load( './images/rocks.jpg' ) }),
    .8, // high friction
    .4 // low restitution
);

ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
ground_material.map.repeat.set( 2.5, 2.5 );

const GroundTable = function( opts ){

    THREE.Object3D.call( this );
    
    let ground = new THREE.Mesh(
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
                  
    
    this.add( ground, bumper1, bumper2, bumper3, bumper4 );
};
GroundTable.prototype = Object.assign( Object.create( THREE.Object3D.prototype ), {
    constructor : GroundTable
});


export default GroundTable;