/*
    viewer/farm-props.js — Procedural low-poly farm scenery (farmhouse, windmill, fence, trees).
    Built entirely from Three.js primitives instead of loaded model files, so the scene always
    renders correctly with zero dependency on any third-party asset URL staying online. Swapping
    any of these for a real .glb later (e.g. a downloaded Kenney Nature/Farm kit) is a drop-in
    change — just replace the returned Group's children.
*/

import * as THREE from 'three';

const WOOD = 0xa9713f;
const WOOD_DARK = 0x6f4518;
const WALL = 0xf3e2b9;
const ROOF = 0xb5432f;
const LEAF = 0x4f8a3d;
const LEAF_DARK = 0x3c6d2e;
const TRUNK = 0x6f4518;
const STONE = 0x9a9a8f;

function box(w, h, d, color, opts = {}) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color, roughness: opts.roughness ?? 0.85, metalness: opts.metalness ?? 0 })
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function cone(radius, height, color, segments = 4) {
    const mesh = new THREE.Mesh(
        new THREE.ConeGeometry(radius, height, segments),
        new THREE.MeshStandardMaterial({ color, roughness: 0.9 })
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function cylinder(radiusTop, radiusBottom, height, color, segments = 10) {
    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
        new THREE.MeshStandardMaterial({ color, roughness: 0.9 })
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

export function createFarmhouse() {
    const group = new THREE.Group();

    const body = box(4.2, 2.6, 3.4, WALL);
    body.position.y = 1.3;
    group.add(body);

    const roof = cone(3.4, 1.8, ROOF, 4);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 2.6 + 0.9;
    group.add(roof);

    const door = box(0.9, 1.6, 0.12, WOOD_DARK);
    door.position.set(0, 0.8, 3.4 / 2 + 0.02);
    group.add(door);

    const windowGlow = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.7, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xffe9a8, emissive: 0xffcf6b, emissiveIntensity: 0.6 })
    );
    windowGlow.position.set(-1.3, 1.5, 3.4 / 2 + 0.02);
    group.add(windowGlow);
    const windowGlow2 = windowGlow.clone();
    windowGlow2.position.x = 1.3;
    group.add(windowGlow2);

    const chimney = box(0.45, 1.1, 0.45, STONE);
    chimney.position.set(1.2, 2.6 + 0.9, 0);
    group.add(chimney);

    return group;
}

export function createWindmill() {
    const group = new THREE.Group();

    const tower = cylinder(0.55, 0.85, 3.6, WALL);
    tower.position.y = 1.8;
    group.add(tower);

    const roof = cone(0.85, 1, ROOF, 8);
    roof.position.y = 3.6 + 0.5;
    group.add(roof);

    const hub = cylinder(0.18, 0.18, 0.3, WOOD_DARK, 8);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(0, 3.2, 0.75);
    group.add(hub);

    const bladesGroup = new THREE.Group();
    bladesGroup.position.set(0, 3.2, 0.75);
    const bladeGeometry = new THREE.BoxGeometry(0.18, 1.8, 0.05);
    const bladeMaterial = new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.8 });
    for (let i = 0; i < 4; i++) {
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.castShadow = true;
        blade.position.y = 0.95;
        const pivot = new THREE.Group();
        pivot.rotation.z = (Math.PI / 2) * i;
        pivot.add(blade);
        bladesGroup.add(pivot);
    }
    group.add(bladesGroup);

    return { group, blades: bladesGroup };
}

export function createTree(scale = 1) {
    const group = new THREE.Group();

    const trunk = cylinder(0.14 * scale, 0.2 * scale, 1.2 * scale, TRUNK, 6);
    trunk.position.y = 0.6 * scale;
    group.add(trunk);

    const leafColors = [LEAF, LEAF_DARK, LEAF];
    for (let i = 0; i < 3; i++) {
        const leaves = cone(0.9 * scale - i * 0.18 * scale, 1.1 * scale, leafColors[i], 8);
        leaves.position.y = 1.3 * scale + i * 0.65 * scale;
        group.add(leaves);
    }

    return group;
}

const WATER = 0x4a90c4;

export function createPond(radius = 2.2) {
    const group = new THREE.Group();

    const bank = new THREE.Mesh(
        new THREE.CylinderGeometry(radius + 0.35, radius + 0.5, 0.25, 20),
        new THREE.MeshStandardMaterial({ color: 0x8a8265, roughness: 1 })
    );
    bank.position.y = 0.02;
    bank.receiveShadow = true;
    group.add(bank);

    const water = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, 0.2, 24),
        new THREE.MeshStandardMaterial({ color: WATER, roughness: 0.25, metalness: 0.1 })
    );
    water.position.y = 0.15;
    group.add(water);

    return group;
}

export function createFence(width, depth) {
    const group = new THREE.Group();
    const postHeight = 0.9;
    const post = () => cylinder(0.06, 0.06, postHeight, WOOD_DARK, 6);
    const spacing = 2.4;

    const placeRow = (length, axis, fixedCoord) => {
        const count = Math.max(2, Math.round(length / spacing));
        for (let i = 0; i <= count; i++) {
            const t = -length / 2 + (length * i) / count;
            const p = post();
            p.position.y = postHeight / 2;
            if (axis === 'x') p.position.set(t, postHeight / 2, fixedCoord);
            else p.position.set(fixedCoord, postHeight / 2, t);
            group.add(p);
        }
        const railGeometry = new THREE.BoxGeometry(axis === 'x' ? length : 0.06, 0.06, axis === 'x' ? 0.06 : length);
        const railMaterial = new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.8 });
        const rail = new THREE.Mesh(railGeometry, railMaterial);
        rail.position.set(axis === 'x' ? 0 : fixedCoord, postHeight * 0.65, axis === 'x' ? fixedCoord : 0);
        rail.castShadow = true;
        group.add(rail);
    };

    placeRow(width, 'x', depth / 2);
    placeRow(width, 'x', -depth / 2);
    placeRow(depth, 'z', width / 2);
    placeRow(depth, 'z', -width / 2);

    return group;
}

// Deterministic scatter (not Math.random) so the scene composition is stable across reloads.
const TREE_LAYOUT = [
    [1, 0.85], [1, 1.1], [1, 0.95], [1, 1.2], [1, 0.9],
    [1, 1.05], [1, 0.8], [1, 1.15], [1, 1.0], [1, 0.9],
];

export function scatterTrees(scene, plotWidth, plotDepth) {
    const marginX = plotWidth / 2 + 2.5;
    const marginZ = plotDepth / 2 + 2.5;
    const positions = [
        [-marginX, -marginZ * 0.6], [-marginX, 0], [-marginX, marginZ * 0.6],
        [marginX, -marginZ * 0.6], [marginX, 0], [marginX, marginZ * 0.6],
        [-marginX * 0.4, -marginZ], [marginX * 0.4, -marginZ],
        [-marginX * 0.4, marginZ], [marginX * 0.4, marginZ],
    ];
    positions.forEach(([x, z], i) => {
        const [, scale] = TREE_LAYOUT[i % TREE_LAYOUT.length];
        const tree = createTree(scale);
        tree.position.set(x, 0, z);
        scene.add(tree);
    });
}
