import * as THREE from 'three';

import './Controls'
import renderer from './Renderer';
import light from './Light';
import camera from './Camera';
import stats from './Stats';
import scene from './Scene';
import onWindowResize from './Resize';
import initPhysics, { physicsWorld, transformAux1 } from './InitPhysics';
import rigidBodies from './RigidBodies';
import createGround from './objects/Ground';
import createWall from './objects/Wall';

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

function updatePhysics(deltaTime) {
    // Step world
    physicsWorld.stepSimulation(deltaTime, 10);
    // Update rigid bodies
    for (let i = 0, il = rigidBodies.length; i < il; i++) {
        const objThree = rigidBodies[i];
        const objPhys = objThree.userData.physicsBody;
        const ms = objPhys.getMotionState();
        if (ms) {
            ms.getWorldTransform(transformAux1);
            const p = transformAux1.getOrigin();
            const q = transformAux1.getRotation();
            objThree.position.set(p.x(), p.y(), p.z());
            objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
        }
    }
}

export default init

export { animate }