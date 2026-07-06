/*
    viewer/main.js — Viewer entry point. Boots the Three.js scene and the HUD overlay, then
    starts the render loop. Phase 1 only: builds the visuals, does not wire any farming action
    to the model/controller layer yet (see compat.js's header comment for why).
*/

import * as THREE from 'three';
import {
    createRenderer, createScene, createCamera, createControls, createLights, createGround,
    PLOT_W, PLOT_D
} from './scene.js';
import { createFarmhouse, createWindmill, createFence, scatterTrees } from './farm-props.js';
import { buildHud } from './hud.js';

const canvas = document.getElementById('farm-canvas');
const hudRoot = document.getElementById('hud-root');

const renderer = createRenderer(canvas);
const scene = createScene();
const camera = createCamera(window.innerWidth / window.innerHeight);
const controls = createControls(camera, renderer.domElement);
createLights(scene);
createGround(scene);

scene.add(createFence(PLOT_W + 1.2, PLOT_D + 1.2));
scatterTrees(scene, PLOT_W, PLOT_D);

const farmhouse = createFarmhouse();
farmhouse.position.set(-(PLOT_W / 2 + 4.5), 0, -(PLOT_D / 2 - 1));
farmhouse.rotation.y = Math.PI / 6;
scene.add(farmhouse);

const { group: windmill, blades } = createWindmill();
windmill.position.set(-(PLOT_W / 2 + 4.5), 0, (PLOT_D / 2 - 1.5));
windmill.rotation.y = Math.PI / 5;
scene.add(windmill);

const hud = buildHud(hudRoot);

function resize() {
    const { innerWidth, innerHeight } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    blades.rotation.z += delta * 0.6; // slow idle rotation — the scene's signature touch of life
    controls.update();
    renderer.render(scene, camera);
}
animate();

// HUD numbers (day/season/money) only change when the underlying sim ticks, which isn't wired
// to this layer yet — refresh on a light interval for now so the page doesn't look frozen
// mid-session even before phase 2 event wiring lands.
setInterval(() => hud.refresh(), 1000);
