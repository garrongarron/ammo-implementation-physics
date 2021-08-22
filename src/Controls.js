import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import camera from './Camera';
import renderer from './Renderer';

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2, 0);
controls.update();


export default controls