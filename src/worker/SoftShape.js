/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function( self ){
    
    let Ammo;
    let softBodyHelpers;
    let margin = 0.05;
    let _bodies = {};
    let _descriptions = {};
    let report = [];
    
    MESSAGE_TYPES.SOFTREPORT = 4;
    
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
        volumeSoftBody.id = description.id;
        
        _descriptions[description.id] = { ammoIndexAssociation : description.ammoIndexAssociation };
        
        return volumeSoftBody;
    };
    
    self.addSoftShape = function( description, shape ){ 
        _bodies[description.id] =  shape;
        world.addSoftBody( shape, 1, - 1 );
        shape.setActivationState( 4 );
    };
    
    self.removeSoftShape = function( details ){
        //ToDo
        delete _descriptions[details.id];
    };
    
    self.addEventListener("report", function() {
        
        let offset, offsetv, softBody;
        
        let length = Object.keys(_bodies).length;
        let i = 0;
        
        if ( length < 1) return;
       
        report = [];
        report[0] = MESSAGE_TYPES.SOFTREPORT;
        
        report[1] = length;
        
        for ( index in _bodies ) {
            if ( _bodies.hasOwnProperty( index ) ) {
          
                softBody = _bodies[ index ];

                let association = _descriptions[ softBody.id ].ammoIndexAssociation;
                let numVerts = association.length;
                let nodes = softBody.get_m_nodes();

                offset = 2 + (i++) * 2;

                report[ offset ] = softBody.id;

                let verts = new Float32Array( numVerts * 6 );
                               
                for ( let j = 0; j < numVerts; j ++ ) {
                    let node = nodes.at( j );
                    
                    offsetv = j * 6;
                    let nodePos = node.get_m_x();
                  
                    verts[ offsetv + 0 ] = nodePos.x();
                    verts[ offsetv + 1 ] = nodePos.y();
                    verts[ offsetv + 2 ] = nodePos.z();

                    let nodeNormal = node.get_m_n();
                    verts[ offsetv + 3 ] = nodeNormal.x();
                    verts[ offsetv + 4 ] = nodeNormal.y();
                    verts[ offsetv + 5 ] = nodeNormal.z();
                   
                }
                report[ offset + 1 ] = verts;
            }
        }
        
	transferableMessage( report );
    });
    
})( self );
