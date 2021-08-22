import * as THREE from 'three';

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000);
camera.position.set(- 12, 7, 4);   

export default camera