
import * as THREE from 'three';

const corridorMaterial = new THREE.MeshStandardMaterial({
  color: '#0b2035',
  metalness: 0.65,
  roughness: 0.35,
  emissive: '#00304a',
  emissiveIntensity: 0.5,
});

const edgeMaterial = new THREE.LineBasicMaterial({
  color: '#087ca5',
});

const courtyardMaterial = new THREE.MeshStandardMaterial({
  color: '#173b32',
  metalness: 0.15,
  roughness: 0.85,
  side: THREE.DoubleSide,
});

const courtyardEdgeMaterial = new THREE.LineBasicMaterial({
  color: '#278c70',
});

function createFloorSection(scene, {
  x,
  z,
  width,
  depth,
  material,
  name,
  y = -0.015,
  edgeMaterial: sectionEdgeMaterial = edgeMaterial,
}) {
  const geometry = new THREE.BoxGeometry(width, 0.12, depth);
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(x, y, z);
  mesh.receiveShadow = true;
  mesh.userData = { name };

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    sectionEdgeMaterial
  );

  mesh.add(edges);
  scene.add(mesh);

  return mesh;
}

/**
 * Создаёт участок пола коридора.
 */
export function createCorridor(scene, {
  x,
  z,
  width,
  depth,
  name = 'Коридор',
}) {
  return createFloorSection(scene, {
    x,
    z,
    width,
    depth,
    material: corridorMaterial,
    name,
  });
}

/**
 * Создаёт дворик по центру здания.
 * Центр дворика всегда находится в координатах (0, 0).
 */
export function createCourtyard(
  scene,
  {
    width = 36,
    depth = 24,
    y = -0.02,
    name = 'Внутренний двор',
  } = {}
) {
  return createFloorSection(scene, {
    x: 0,
    z: 0,
    width,
    depth,
    material: courtyardMaterial,
    edgeMaterial: courtyardEdgeMaterial,
    name,
    y,
  });
}
