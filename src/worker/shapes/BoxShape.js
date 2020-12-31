/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function( self ){
    
    let Ammo, _vec3_1;

    self.addEventListener("init", function( event ){
        Ammo = self.Ammo;
        _vec3_1 = self._vec3_1 || new Ammo.btVector3(0,0,0);
    });

    self.knownShapes.box = function( description ){
        let cache_key = 'box_' + description.width + '_' + description.height + '_' + description.depth;
        let shape;

        if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
            _vec3_1.setX(description.width / 2);
            _vec3_1.setY(description.height / 2);
            _vec3_1.setZ(description.depth / 2);
            shape = new Ammo.btBoxShape(_vec3_1);
            setShapeCache( cache_key, shape );
        }
        return shape;
    };

})(self); 