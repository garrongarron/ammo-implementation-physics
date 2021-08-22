import * as THREE from 'three';
import createParalellepiped from '../CreateParalellepiped';
import textureLoader from '../TextureLoader';

const createGround = () => {
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    // Ground
    pos.set(0, - 0.5, 0);
    quat.set(0, 0, 0, 1);
    const ground = createParalellepiped(40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }));
    ground.castShadow = true;
    ground.receiveShadow = true;
    textureLoader.load("grid.png", function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(40, 40);
        ground.material.map = texture;
        ground.material.needsUpdate = true;
    });
}

export default createGround