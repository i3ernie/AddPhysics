/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// Physijs.createMaterial
const createMaterial = function( material, friction, restitution ) {
        let physijs_material = function(){};
        
        physijs_material.prototype = material;
        physijs_material = new physijs_material();

        physijs_material._physijs = {
                id: material.id,
                friction: friction === undefined ? .8 : friction,
                restitution: restitution === undefined ? .2 : restitution
        };

        return physijs_material;
};

const defaults = {
        friction : .8,
        restitution : .2
};

const Material = function( material, opt ){
    
};
Material.addPhysics = function( material, opt ){
    material._physijs = {
                id: material.id,
                friction: opt.friction === undefined ? defaults.friction : opt.friction,
                restitution: opt.restitution === undefined ? defaults.restitution : opt.restitution
    };
    return material;
};

export { createMaterial, Material }

