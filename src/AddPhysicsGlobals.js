/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

let _Physijs = window.Physijs; // used for noConflict method

let AddPhysics = {
    updateFunctions : {  
    },
    addFunctions : {
        constraint:{}
    },
    SUPPORT_TRANSFERABLE : false,
    status : {
        _is_simulating : false
    },
    options : {

    },
    config : function( obj ){
        Object.assign(AddPhysics.options, obj );
    },
    noConflict : function() {
        window.Physijs = _Physijs;
        return Physijs;
    }
};

export default AddPhysics;