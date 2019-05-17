/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function( self ){
    
    let Ammo;
    let softBodyHelpers;
    let margin = 0.05;
    
    self.addEventListener("init", function( event ){ 
        Ammo = self.Ammo;
        if ( typeof Ammo.btSoftBodyHelpers === "function" ) softBodyHelpers = new Ammo.btSoftBodyHelpers();
    });
    
    
    self.createSoftShape = function( description ){
        let volumeSoftBody = softBodyHelpers.CreateFromTriMesh(
            world.getWorldInfo(),
            description.ammoVertices,
            description.ammoIndices,
            description.ammoIndices.length / 3,
            true );
    
    
        let sbConfig = volumeSoftBody.get_m_cfg();
        sbConfig.set_viterations( 40 );
        sbConfig.set_piterations( 40 );
        // Soft-soft and soft-rigid collisions
        sbConfig.set_collisions( 0x11 );
        // Friction
        sbConfig.set_kDF( 0.1 );
        // Damping
        sbConfig.set_kDP( 0.01 );
        // Pressure
        sbConfig.set_kPR( description.pressure );
        // Stiffness
        volumeSoftBody.get_m_materials().at( 0 ).set_m_kLST( 0.9 );
        volumeSoftBody.get_m_materials().at( 0 ).set_m_kAST( 0.9 );
        
        volumeSoftBody.setTotalMass( description.mass, false );
        Ammo.castObject( volumeSoftBody, Ammo.btCollisionObject ).getCollisionShape().setMargin( margin );
        return volumeSoftBody;
    };
    
})( self );
