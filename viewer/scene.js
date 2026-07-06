/*
    viewer/scene.js — Renderer, camera, controls, lights, sky and the ground/plot grid.
    Grid size is derived from ConfigSys.land.slotMax, not hardcoded, so it stays in sync with
    the model layer's actual max plot count.
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ConfigSys } from '../controller/config.js';

export const GRID_COLS = 10;
export const GRID_ROWS = Math.ceil(ConfigSys.land.slotMax / GRID_COLS);
export const TILE_SIZE = 2.2;
export const TILE_GAP = 0.35;
export const PLOT_W = GRID_COLS * (TILE_SIZE + TILE_GAP);
export const PLOT_D = GRID_ROWS * (TILE_SIZE + TILE_GAP);

const PALETTE = {
    grass: 0x7fb242,
    grassDark: 0x5c8a34,
    soil: 0x8a5a34,
    soilDark: 0x6b4423,
    skyTop: 0xbfe6f5,
    skyHorizon: 0xffe7b8,
    sun: 0xfff2d0,
};

export function createRenderer(canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    return renderer;
}

export function createCamera(aspect) {
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 500);
    camera.position.set(PLOT_W * 0.55, PLOT_W * 0.55, PLOT_D * 0.85);
    return camera;
}

export function createControls(camera, domElement) {
    const controls = new OrbitControls(camera, domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = PLOT_W * 0.4;
    controls.maxDistance = PLOT_W * 1.8;
    controls.maxPolarAngle = Math.PI * 0.47; // never let the camera dip below ground level
    controls.minPolarAngle = Math.PI * 0.12; // never let it go fully top-down either
    controls.update();
    return controls;
}

// A soft vertical-gradient sky, built from a small canvas texture rather than a flat color —
// cheap, self-contained (no external asset), and reads much warmer than a solid clear color.
function createSkyDome() {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#' + PALETTE.skyTop.toString(16).padStart(6, '0'));
    gradient.addColorStop(1, '#' + PALETTE.skyHorizon.toString(16).padStart(6, '0'));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 256);

    const texture = new THREE.CanvasTexture(canvas);
    const geometry = new THREE.SphereGeometry(250, 24, 16);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, fog: false });
    return new THREE.Mesh(geometry, material);
}

export function createScene() {
    const scene = new THREE.Scene();
    scene.add(createSkyDome());
    scene.fog = new THREE.Fog(PALETTE.skyHorizon, PLOT_W * 1.1, PLOT_W * 2.4);
    return scene;
}

export function createLights(scene) {
    const sun = new THREE.DirectionalLight(PALETTE.sun, 2.4);
    sun.position.set(PLOT_W * 0.5, PLOT_W * 0.9, PLOT_D * 0.3);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const shadowSpan = Math.max(PLOT_W, PLOT_D) * 0.9;
    sun.shadow.camera.left = -shadowSpan;
    sun.shadow.camera.right = shadowSpan;
    sun.shadow.camera.top = shadowSpan;
    sun.shadow.camera.bottom = -shadowSpan;
    sun.shadow.camera.far = PLOT_W * 3;
    sun.shadow.bias = -0.0015;
    scene.add(sun);

    const sky = new THREE.HemisphereLight(PALETTE.skyTop, PALETTE.soilDark, 0.65);
    scene.add(sky);

    const fill = new THREE.AmbientLight(0xffffff, 0.18);
    scene.add(fill);

    return { sun, sky, fill };
}

// The 50-plot (or however many ConfigSys.land.slotMax says) soil grid, sitting on a big
// grass field. Each plot is its own mesh so a later phase can recolor/select individual
// plots without rebuilding geometry.
export function createGround(scene) {
    const fieldSize = Math.max(PLOT_W, PLOT_D) * 2.6;
    const grass = new THREE.Mesh(
        new THREE.PlaneGeometry(fieldSize, fieldSize),
        new THREE.MeshStandardMaterial({ color: PALETTE.grass, roughness: 1 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;
    scene.add(grass);

    const plots = [];
    const startX = -PLOT_W / 2 + TILE_SIZE / 2;
    const startZ = -PLOT_D / 2 + TILE_SIZE / 2;
    const soilGeometry = new THREE.BoxGeometry(TILE_SIZE, 0.22, TILE_SIZE);
    const borderGeometry = new THREE.BoxGeometry(TILE_SIZE + 0.12, 0.1, TILE_SIZE + 0.12);

    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const plotIndex = row * GRID_COLS + col;
            if (plotIndex >= ConfigSys.land.slotMax) break;

            const x = startX + col * (TILE_SIZE + TILE_GAP);
            const z = startZ + row * (TILE_SIZE + TILE_GAP);

            const border = new THREE.Mesh(
                borderGeometry,
                new THREE.MeshStandardMaterial({ color: PALETTE.grassDark, roughness: 1 })
            );
            border.position.set(x, 0.03, z);
            border.receiveShadow = true;
            scene.add(border);

            const soil = new THREE.Mesh(
                soilGeometry,
                new THREE.MeshStandardMaterial({ color: PALETTE.soil, roughness: 0.95 })
            );
            soil.position.set(x, 0.14, z);
            soil.castShadow = true;
            soil.receiveShadow = true;
            soil.userData.plotIndex = plotIndex;
            scene.add(soil);

            plots.push(soil);
        }
    }

    return plots;
}

export { PALETTE };
