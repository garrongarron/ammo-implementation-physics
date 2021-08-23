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
import rigidBodies from './RigidBodies';
import keyListener from './KeyListener';
import createMaterial from './objects/CreateMaetrial';
import createParalellepiped from './CreateParalellepiped';

const clock = new THREE.Clock();
function init() {
    initGraphics();
    initPhysics();
    createObjects();
    createBrick()
    keyListener.start()
}
let createBrick = () => {
    const pos = new THREE.Vector3(0, 3, 0);
    const quat = new THREE.Quaternion();
    let width = 1
    let height = 1
    let deep = 1
    let mass = 5
    let material = createMaterial()
    createParalellepiped(width, height, deep, mass, pos, quat, material);
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
let flag = false
function render() {
    const deltaTime = clock.getDelta();
    let x, y, z
    x = y = z = 0
    let speed = .5
    if (keyListener.isPressed(87)) x = speed
    if (keyListener.isPressed(83)) x = -speed
    if (keyListener.isPressed(68)) z = speed
    if (keyListener.isPressed(65)) z = -speed
    if (x != 0 || z != 0) {
        let body = rigidBodies[0].userData.physicsBody
        if (!flag) {
            for (let x in body) {
                console.log(x);
            };
            console.log(body);
            flag = true

            let worldTrans = body.getWorldTransform();
            worldTrans.setOrigin(new Ammo.btVector3(0, 0, 5));
            body.setWorldTransform(worldTrans);
        }

        
        body.applyForce(new Ammo.btVector3(x, y, z),new Ammo.btVector3(0, 1, 1) );
        // body.applyImpulse(new Ammo.btVector3(x, y, z));
        // body.applyCentralImpulse(new Ammo.btVector3(x, y, z));
        // body.setLinearVelocity(new Ammo.btVector3(x, y, z));
        // body.setAngularVelocity(new Ammo.btVector3(1, 0, 0));
    }

    updatePhysics(deltaTime);
    renderer.render(scene, camera);
}

export default init
export { animate }