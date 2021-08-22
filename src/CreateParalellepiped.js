import * as THREE from 'three';
import createRigidBody from './CreateRigidBody';
const margin = 0.05;
function createParalellepiped(sx, sy, sz, mass, pos, quat, material) {
    const threeObject = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), material);
    const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
    shape.setMargin(margin);
    createRigidBody(threeObject, shape, mass, pos, quat);
    return threeObject;
}

export default createParalellepiped