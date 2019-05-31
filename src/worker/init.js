/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function( self ){
    
    let public_functions = self.public_functions;
    let AMMO;
    
    public_functions.init = function( params ) {
            
        importScripts( params.ammo );
        
        if (typeof Ammo !== "function"){
            AMMO = function(){ return {
                    then : function( fnc ){ fnc( Ammo ); }
            }; };
	}
        else {
            AMMO = Ammo;
        }
        
        AMMO().then( function( Ammolib ) {
            Ammo = Ammolib;
            
            _transform = new Ammo.btTransform;
            _vec3_1 = new Ammo.btVector3( 0, 0, 0 );
            _vec3_2 = new Ammo.btVector3( 0, 0, 0 );
            _vec3_3 = new Ammo.btVector3( 0, 0, 0 );
            _quat = new Ammo.btQuaternion( 0, 0, 0, 0 );

            self.dispatchEvent( new CustomEvent("init", {
                detail: {
                    worker: self
                }
            }) );


            REPORT_CHUNKSIZE = params.reportsize || 50;
            if ( SUPPORT_TRANSFERABLE ) {
                    // Transferable messages are supported, take advantage of them with TypedArrays
                    worldreport = new Float32Array(2 + REPORT_CHUNKSIZE * WORLDREPORT_ITEMSIZE); // message id + # of objects to report + chunk size * # of values per object
                    collisionreport = new Float32Array(2 + REPORT_CHUNKSIZE * COLLISIONREPORT_ITEMSIZE); // message id + # of collisions to report + chunk size * # of values per object
                    vehiclereport = new Float32Array(2 + REPORT_CHUNKSIZE * VEHICLEREPORT_ITEMSIZE); // message id + # of vehicles to report + chunk size * # of values per object
                    constraintreport = new Float32Array(2 + REPORT_CHUNKSIZE * CONSTRAINTREPORT_ITEMSIZE); // message id + # of constraints to report + chunk size * # of values per object
            } else {
                    // Transferable messages are not supported, send data as normal arrays
                    worldreport = [];
                    collisionreport = [];
                    vehiclereport = [];
                    constraintreport = [];
            }
            worldreport[0] = MESSAGE_TYPES.WORLDREPORT;
            collisionreport[0] = MESSAGE_TYPES.COLLISIONREPORT;
            vehiclereport[0] = MESSAGE_TYPES.VEHICLEREPORT;
            constraintreport[0] = MESSAGE_TYPES.CONSTRAINTREPORT;
            
           
            
            if ( params.type === "soft" ) {
                let collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
                
                world = new Ammo.btSoftRigidDynamicsWorld( 
                    new Ammo.btCollisionDispatcher( collisionConfiguration ), 
                    new Ammo.btDbvtBroadphase(), 
                    new Ammo.btSequentialImpulseConstraintSolver(), 
                    collisionConfiguration, 
                    new Ammo.btDefaultSoftBodySolver() 
                );
                
            } else {
                 
                let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration;                
                let broadphase;
              
                params.broadphase = params.broadphase || { type: 'dynamic' };
                
                switch ( params.broadphase.type ) {
                    case 'sweepprune':

                        _vec3_1.setX(params.broadphase.aabbmin.x);
                        _vec3_1.setY(params.broadphase.aabbmin.y);
                        _vec3_1.setZ(params.broadphase.aabbmin.z);

                        _vec3_2.setX(params.broadphase.aabbmax.x);
                        _vec3_2.setY(params.broadphase.aabbmax.y);
                        _vec3_2.setZ(params.broadphase.aabbmax.z);

                        broadphase = new Ammo.btAxisSweep3(
                                _vec3_1,
                                _vec3_2
                        );

                        break;

                    case 'dynamic':
                    default:
                        broadphase = new Ammo.btDbvtBroadphase();
                        break;
                }
                world = new Ammo.btDiscreteDynamicsWorld( 
                    new Ammo.btCollisionDispatcher( collisionConfiguration ), 
                    broadphase, 
                    new Ammo.btSequentialImpulseConstraintSolver(), 
                    collisionConfiguration 
                );
            }
            

            fixedTimeStep = params.fixedTimeStep;
            rateLimit = params.rateLimit;

            transferableMessage({ cmd: 'worldReady' });
        });
    };

})(self);