/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default [{
  input: 'src/THREEAddPhysics.js',
//  external: ['three.module.js'],
  output: [
    {
        file: 'dist/THREEAddPhysics.js',
        exports : 'named',
        format: 'cjs'
    },
    {
        file: 'dist/THREEAddPhysics.module.js',
        exports : 'named',
        format: 'es'
    },
    {
        file: 'dist/THREEAddPhysics.amd.js',
        exports : 'named',
        format: 'amd'
    }
  ]
}, {
    input: 'src/AddPhysics.js',
//  external: ['three.module.js'],
  output: [
    {
        file: 'dist/AddPhysics.js',
        exports : 'named',
        format: 'cjs'
    },
    {
        file: 'dist/AddPhysics.module.js',
        exports : 'named',
        format: 'es'
    },
    {
        file: 'dist/AddPhysics.amd.js',
        exports : 'named',
        format: 'amd'
    }
  ]
}
];

