import * as THREE from 'three';

import './Controls'
import renderer from './Renderer';
import light from './Light';
import camera from './Camera';
import stats from './Stats';
import textureLoader from './TextureLoader';
import scene from './Scene';
import onWindowResize from './Resize';
import initPhysics, { physicsWorld, transformAux1 } from './InitPhysics';
import createParalellepiped from './CreateParalellepiped';
import rigidBodies from './RigidBodies';

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

    // Wall
    const brickMass = 0.5;
    const brickLength = 1.2;
    const brickDepth = 0.6;
    const brickHeight = brickLength * 0.5;
    const numBricksLength = 1;
    const numBricksHeight = 1;
    const z0 = - numBricksLength * brickLength * 0.5;
    pos.set(0, brickHeight * 0.5, z0);
    quat.set(0, 0, 0, 1);
    for (let j = 0; j < numBricksHeight; j++) {
        const oddRow = (j % 2) == 1;
        pos.z = z0;
        if (oddRow) {
            pos.z -= 0.25 * brickLength;
        }

        const nRow = oddRow ? numBricksLength + 1 : numBricksLength;

        for (let i = 0; i < nRow; i++) {
            let brickLengthCurrent = brickLength;
            let brickMassCurrent = brickMass;
            if (oddRow && (i == 0 || i == nRow - 1)) {
                brickLengthCurrent *= 0.5;
                brickMassCurrent *= 0.5;
            }
            const brick = createParalellepiped(brickDepth, brickHeight, brickLengthCurrent, brickMassCurrent, pos, quat, createMaterial());
            brick.castShadow = true;
            brick.receiveShadow = true;
            if (oddRow && (i == 0 || i == nRow - 2)) {
                pos.z += 0.75 * brickLength;
            } else {
                pos.z += brickLength;
            }
        }
        pos.y += brickHeight;
    }
}

function createRandomColor() {
    return Math.floor(Math.random() * (1 << 24));
}

function createMaterial() {
    return new THREE.MeshPhongMaterial({ color: createRandomColor() });
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