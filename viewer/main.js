/*
    viewer/main.js — Viewer entry point. Boots the Three.js scene and the HUD overlay, then
    starts the render loop. Phase 1 only: builds the visuals, does not wire any farming action
    to the model/controller layer yet (see compat.js's header comment for why).
*/

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
    createRenderer, createScene, createCamera, createControls, createLights, createGround,
    PLOT_W, PLOT_D
} from './scene.js';
import { createFarmhouse, createWindmill, createFence, createPond, scatterTrees } from './farm-props.js';
import { buildHud } from './hud.js';
import { buildPanels } from './panels.js';

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

// Small pond by the farmhouse, home to a real (verified, CC0/public) third-party asset:
// the "Duck" model from Khronos' official glTF-Sample-Assets repo — the canonical glTF demo
// model, served via jsdelivr's GitHub CDN (no auth, no rate limit, extremely stable since it
// backs countless glTF tutorials). Swap the URL below for any other .glb (e.g. a downloaded
// Kenney/Quaternius farm animal pack) to add more real assets the same way.
const DUCK_URL = 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/Duck/glTF-Binary/Duck.glb';
const pondPosition = new THREE.Vector3(-(PLOT_W / 2 + 2), 0, 0);
const pond = createPond(1.8);
pond.position.copy(pondPosition);
scene.add(pond);

let duck = null;
new GLTFLoader().load(
    DUCK_URL,
    (gltf) => {
        duck = gltf.scene;
        duck.scale.setScalar(0.01); // Duck.glb's original units are much larger than our scene
        duck.position.copy(pondPosition).setY(0.28);
        duck.traverse((node) => { if (node.isMesh) node.castShadow = true; });
        scene.add(duck);
    },
    undefined,
    (err) => {
        // Graceful fallback: the pond still looks fine empty, the rest of the scene is unaffected.
        console.warn('Duck.glb failed to load from CDN, continuing without it:', err);
    }
);

const hud = buildHud(hudRoot);
buildPanels(hudRoot, { menuButton: hud.menuButton });

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
    const elapsed = clock.getElapsedTime();
    blades.rotation.z += delta * 0.6; // slow idle rotation — the scene's signature touch of life
    if (duck) {
        duck.position.y = 0.28 + Math.sin(elapsed * 1.4) * 0.03;
        duck.rotation.y = Math.sin(elapsed * 0.5) * 0.6;
    }
    controls.update();
    renderer.render(scene, camera);
}
animate();

// HUD numbers (day/season/money) only change when the underlying sim ticks, which isn't wired
// to this layer yet — refresh on a light interval for now so the page doesn't look frozen
// mid-session even before phase 2 event wiring lands.
setInterval(() => hud.refresh(), 1000);
