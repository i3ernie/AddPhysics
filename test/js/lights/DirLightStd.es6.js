import {THREE} from "../../../src/AddPhysics.js";

const defaults = {
    shadow : true
};

const StandartDirLight = function( opts ) {
    this.options = Object.assign({},defaults,opts);

    THREE.DirectionalLight.call( this, 0xFFFFFF );
    if ( this.options.shadow ){
        this.castShadow = true;
        this.shadow.camera.left = -60;
        this.shadow.camera.top = -60;
        this.shadow.camera.right = 60;
        this.shadow.camera.bottom = 60;
        this.shadow.camera.near = 20;
        this.shadow.camera.far = 200;
        this.shadow.bias = -.001
        this.shadow.mapSize.width = this.shadow.mapSize.height = 2048;
    }
};

StandartDirLight.prototype = Object.assign( Object.create( THREE.DirectionalLight.prototype ), {
    constructor : StandartDirLight
});

export default StandartDirLight;