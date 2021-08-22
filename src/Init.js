import * as THREE from 'three';

import './Controls'
import renderer from './Renderer';
import light from './Light';
import camera from './Camera';
import stats from './Stats';
import scene from './Scene';
import onWindowResize from './Resize';
import initPhysics from './InitPhysics';
import createGround from './objects/Ground';
import createWall from './objects/Wall';
import updatePhysics from './UpdatePhysics';

// Graphics variables
const clock = new THREE.Clock();

function init() {
    initGraphics();
    initPhysics();
    createObjects();
}

function initGraphics() {
    scene.add(light);
    window.addEventListener('resize', onWindowResize);
}

function createObjects() {
    createGround()
    createWall()
}

function animate() {
    requestAnimationFrame(animate);
    render();
    stats.update();
}

function render() {
    const deltaTime = clock.getDelta();
    updatePhysics(deltaTime);
    renderer.render(scene, camera);
}

export default init

export { animate }