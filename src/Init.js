import * as THREE from 'three';

import './Controls'
import renderer from './Renderer';
import light from './Light';
import camera from './Camera';
import stats from './Stats';
import textureLoader from './TextureLoader';

// Graphics variables
let scene;
const clock = new THREE.Clock();

// Physics variables
const gravityConstant = - 9.8;
let physicsWorld;
const rigidBodies = [];
const margin = 0.05;
let transformAux1;

function init() {

    initGraphics();

    initPhysics();

    createObjects();

    initInput();

}

function initGraphics() {
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);   
    scene.add(light);

    window.addEventListener('resize', onWindowResize);

}

function initPhysics() {

    // Physics configuration

    const collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const broadphase = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    const softBodySolver = new Ammo.btDefaultSoftBodySolver();
    physicsWorld = new Ammo.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softBodySolver);
    physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
    physicsWorld.getWorldInfo().set_m_gravity(new Ammo.btVector3(0, gravityConstant, 0));

    transformAux1 = new Ammo.btTransform();

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

function createParalellepiped(sx, sy, sz, mass, pos, quat, material) {

    const threeObject = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), material);
    const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
    shape.setMargin(margin);

    createRigidBody(threeObject, shape, mass, pos, quat);

    return threeObject;

}

function createRigidBody(threeObject, physicsShape, mass, pos, quat) {

    threeObject.position.copy(pos);
    threeObject.quaternion.copy(quat);

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    const motionState = new Ammo.btDefaultMotionState(transform);

    const localInertia = new Ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);

    threeObject.userData.physicsBody = body;

    scene.add(threeObject);

    if (mass > 0) {

        rigidBodies.push(threeObject);

        // Disable deactivation
        body.setActivationState(4);

    }

    physicsWorld.addRigidBody(body);

}

function createRandomColor() {

    return Math.floor(Math.random() * (1 << 24));

}

function createMaterial() {

    return new THREE.MeshPhongMaterial({ color: createRandomColor() });

}

function initInput() {

    window.addEventListener('keydown', function (event) {

        switch (event.keyCode) {

            // Q
            case 81:
                armMovement = 1;
                break;

            // A
            case 65:
                armMovement = - 1;
                break;

        }

    });

    window.addEventListener('keyup', function () {

        armMovement = 0;

    });

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

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