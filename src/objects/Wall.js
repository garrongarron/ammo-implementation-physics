import * as THREE from 'three';
import createParalellepiped from "../CreateParalellepiped";
import createMaterial from './CreateMaetrial';

const createWall = () => {
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
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
export default createWall