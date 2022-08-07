import * as THREE from "../../../node_modules/three/build/three.module.js";

const geos =[
    new THREE.BoxGeometry( 3, 3, 3 ),
    new THREE.SphereGeometry( 1.5, 32, 32 ),
    new THREE.CylinderGeometry( 2, 2, 1, 32 ),
    new THREE.ConeGeometry( 2, 4, 32 ),
    new THREE.OctahedronGeometry( 1.7, 1 ),
    new THREE.TorusKnotGeometry ( 1.7, .2, 32, 4 ),
    new THREE.TorusKnotGeometry ( 1.7, .2, 32, 4 )
];

const randomShape = function(){
    let shape, material = new THREE.MeshLambertMaterial({ opacity: 0, transparent: true });

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

    return shape;
};

export default randomShape;