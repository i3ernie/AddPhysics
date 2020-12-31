/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

'use strict';

(function( self ){
    
    let Ammo;
    let _vec3_1, _vec3_2;
    
    self.addEventListener("init", function( event ){ 
        Ammo = self.Ammo;
        _vec3_1 = self._vec3_1 || new Ammo.btVector3(0,0,0);
        _vec3_2 = self._vec3_2 || new Ammo.btVector3(0,0,0);
    });
    
    self.knownConstraints.point = function( details ){
        
        let constraint;
        if ( details.objectb === undefined ) {

                    _vec3_1.setX(details.positiona.x);
                    _vec3_1.setY(details.positiona.y);
                    _vec3_1.setZ(details.positiona.z);

                    constraint = new Ammo.btPoint2PointConstraint(
                            _objects[ details.objecta ],
                            _vec3_1
                    );
            } else {

                    _vec3_1.setX(details.positiona.x);
                    _vec3_1.setY(details.positiona.y);
                    _vec3_1.setZ(details.positiona.z);

                    _vec3_2.setX(details.positionb.x);
                    _vec3_2.setY(details.positionb.y);
                    _vec3_2.setZ(details.positionb.z);

                    constraint = new Ammo.btPoint2PointConstraint(
                            _objects[ details.objecta ],
                            _objects[ details.objectb ],
                            _vec3_1,
                            _vec3_2
                    );
            }
            
            return constraint;
    };
    
    
})( self );

