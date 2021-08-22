import * as THREE from 'three';

function createRandomColor() {
    return Math.floor(Math.random() * (1 << 24));
}

function createMaterial() {
    return new THREE.MeshPhongMaterial({ color: createRandomColor() });
}

export default createMaterial