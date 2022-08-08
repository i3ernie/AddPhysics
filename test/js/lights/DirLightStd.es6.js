import * as THREE from "three";

const defaults = {
    shadow : true
};

class StandartDirLight extends THREE.DirectionalLight {
    constructor ( opts ) {

        super( 0xFFFFFF );
        
        this.options = Object.assign({},defaults,opts);

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
    }
}

export default StandartDirLight;