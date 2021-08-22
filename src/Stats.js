import Stats from 'three/examples/jsm/libs/stats.module.js';
import container from "./Container";

const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
container.appendChild(stats.domElement);


export default stats
