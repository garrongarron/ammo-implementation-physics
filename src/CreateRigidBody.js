import { physicsWorld } from "./InitPhysics";
import rigidBodies from "./RigidBodies";
import scene from "./Scene";

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
    //Here we add a physicBody to the mesh
    threeObject.userData.physicsBody = body;
    scene.add(threeObject);
    if (mass > 0) {
        rigidBodies.push(threeObject);
        // Disable deactivation
        body.setActivationState(4);
    }
    //here we add the body into the world
    physicsWorld.addRigidBody(body);
}

export default createRigidBody