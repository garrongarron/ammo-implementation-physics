import * as THREE from 'three';

const ambientLight = new THREE.AmbientLight(0x404040);
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(- 7, 10, 15);
light.castShadow = true;
const d = 10;
light.shadow.camera.left = - d;
light.shadow.camera.right = d;
light.shadow.camera.top = d;
light.shadow.camera.bottom = - d;

light.shadow.camera.near = 2;
light.shadow.camera.far = 50;

light.shadow.mapSize.x = 1024;
light.shadow.mapSize.y = 1024;

light.shadow.bias = - 0.003;

light.add(ambientLight)


export default light