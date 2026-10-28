
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

import { floors } from './entities/room/room-data.js';
import {
  createRoomStructure,
  createRoomLabel,
} from './entities/room/room-builder.js';

// =====================================================
// 1. СЦЕНА
// =====================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color('#050914');
scene.fog = new THREE.Fog('#050914', 45, 140);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  250
);

camera.position.set(0, 28, 32);


const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: 'high-performance',
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

// Пока отключаем дорогие тени.
renderer.shadowMap.enabled = false;

renderer.outputColorSpace = THREE.SRGBColorSpace;

document.querySelector('#app').appendChild(renderer.domElement);


document.querySelector('#app').appendChild(renderer.domElement);

// =====================================================
// 2. КАМЕРА
// =====================================================

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = true;
controls.zoomSpeed = 0.8;
controls.target.set(0, 0, 0);
controls.minDistance = 3;
controls.maxDistance = 90;
controls.maxPolarAngle = Math.PI * 0.48;

const cameraMove = {
  active: false,
  startTime: 0,
  duration: 900,
  fromPosition: new THREE.Vector3(),
  toPosition: new THREE.Vector3(),
  fromTarget: new THREE.Vector3(),
  toTarget: new THREE.Vector3(),
};

function moveCameraTo(position, target, duration = 900) {
  cameraMove.fromPosition.copy(camera.position);
  cameraMove.toPosition.copy(position);
  cameraMove.fromTarget.copy(controls.target);
  cameraMove.toTarget.copy(target);

  cameraMove.startTime = performance.now();
  cameraMove.duration = duration;
  cameraMove.active = true;
}

function updateCameraMove() {
  if (!cameraMove.active) return;

  const elapsed = performance.now() - cameraMove.startTime;
  const t = Math.min(elapsed / cameraMove.duration, 1);
  const eased = t * t * (3 - 2 * t);

  camera.position.lerpVectors(
    cameraMove.fromPosition,
    cameraMove.toPosition,
    eased
  );

  controls.target.lerpVectors(
    cameraMove.fromTarget,
    cameraMove.toTarget,
    eased
  );

  if (t >= 1) cameraMove.active = false;
}

renderer.domElement.addEventListener('pointerdown', () => {
  cameraMove.active = false;
});

// =====================================================
// 3. ОСВЕЩЕНИЕ
// =====================================================

scene.add(new THREE.AmbientLight('#b7d0ff', 1.7));

const mainLight = new THREE.DirectionalLight('#e4efff', 2.5);
mainLight.position.set(10, 35, 10);
mainLight.castShadow = false;
scene.add(mainLight);

const cyanLight = new THREE.PointLight('#00bfff', 35, 45);
cyanLight.position.set(-8, 8, -5);
scene.add(cyanLight);

// =====================================================
// 4. МАТЕРИАЛЫ
// =====================================================

const floorMaterial = new THREE.MeshStandardMaterial({
  color: '#101b30',
  metalness: 0.35,
  roughness: 0.55,
});

const wallMaterial = new THREE.MeshStandardMaterial({
  color: '#263b50',
  metalness: 0.2,
  roughness: 0.65,
});

const cornerMaterial = new THREE.MeshStandardMaterial({
  color: '#0758c9',
  emissive: '#063b96',
  emissiveIntensity: 0.35,
  metalness: 0.2,
  roughness: 0.55,
});

const outlineMaterial = new THREE.LineBasicMaterial({
  color: '#00bfff',
});

const courtyardMaterial = new THREE.MeshStandardMaterial({
  color: '#173b32',
  roughness: 0.85,
  side: THREE.DoubleSide,
});

const groundMaterial = new THREE.MeshStandardMaterial({
  color: '#26352f',
  roughness: 1,
});

const grassMaterial = new THREE.MeshStandardMaterial({
  color: '#426747',
  roughness: 1,
});

const roadMaterial = new THREE.MeshStandardMaterial({
  color: '#303943',
  roughness: 0.95,
});

const sidewalkMaterial = new THREE.MeshStandardMaterial({
  color: '#858f98',
  roughness: 0.9,
});

const markingMaterial = new THREE.MeshStandardMaterial({
  color: '#e4e8e9',
  roughness: 0.8,
});

const windowGlassMaterial = new THREE.MeshPhysicalMaterial({
  color: '#65cfff',
  emissive: '#164b68',
  emissiveIntensity: 0.35,
  metalness: 0.15,
  roughness: 0.2,
  transparent: true,
  opacity: 0.72,
  side: THREE.DoubleSide,
  depthWrite: false,
});

const windowFrameMaterial = new THREE.MeshStandardMaterial({
  color: '#b8d4e8',
  metalness: 0.5,
  roughness: 0.35,
});

// =====================================================
// 5. РАЗМЕРЫ ЗДАНИЯ
// =====================================================

const BUILDING = {
  outerWidth: 48,
  outerDepth: 36,
  courtyardWidth: 30,
  courtyardDepth: 18,
  floorThickness: 0.35,
  wallHeight: 3,
  levelHeight: 3,
};

const outerX = BUILDING.outerWidth / 2;
const outerZ = BUILDING.outerDepth / 2;
const innerX = BUILDING.courtyardWidth / 2;
const innerZ = BUILDING.courtyardDepth / 2;

// =====================================================
// 6. ПОЛЫ И СТЕНЫ
// =====================================================

function addFloorPart(group, x, z, width, depth) {
  const geometry = new THREE.BoxGeometry(
    width,
    BUILDING.floorThickness,
    depth
  );

  const mesh = new THREE.Mesh(geometry, floorMaterial);
  mesh.position.set(x, -0.2, z);
  mesh.receiveShadow = true;
  group.add(mesh);
}

function addWall(
  group,
  x,
  z,
  width,
  depth,
  height = BUILDING.wallHeight
) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    wallMaterial
  );

  wall.position.set(x, height / 2, z);
  wall.castShadow = true;
  wall.receiveShadow = true;
  group.add(wall);
}

// =====================================================
// 7. НАРУЖНЫЕ СТЕНЫ С ОКНАМИ
// =====================================================

function addFacadeWall(
  group,
  horizontal,
  fixedPosition,
  length,
  direction,
  requestedWindowCount
) {
  const wallThickness = 0.22;
  const height = BUILDING.wallHeight;

  const windowWidth = 2.4;
  const windowHeight = 1.35;
  const windowSill = 0.85;
  const frameThickness = 0.09;
  const frameDepth = 0.12;

  const windowCount = requestedWindowCount ??
    Math.max(2, Math.floor(length / 5.5));

  const spacing = length / windowCount;
  const actualWindowWidth = Math.min(windowWidth, spacing * 0.65);
  const actualWindowHeight = Math.min(
    windowHeight,
    height - windowSill - 0.1
  );
  const windowTop = windowSill + actualWindowHeight;

  function addPart(center, partLength, bottom, partHeight) {
    if (partLength <= 0.01 || partHeight <= 0.01) return;

    const geometry = horizontal
      ? new THREE.BoxGeometry(partLength, partHeight, wallThickness)
      : new THREE.BoxGeometry(wallThickness, partHeight, partLength);

    const mesh = new THREE.Mesh(geometry, wallMaterial);

    mesh.position.set(
      horizontal ? center : fixedPosition,
      bottom + partHeight / 2,
      horizontal ? fixedPosition : center
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  function addWindow(center) {
    const halfW = actualWindowWidth / 2;
    const halfH = actualWindowHeight / 2;
    const outside = direction * (wallThickness / 2 + frameDepth / 2);

    const glassGeometry = horizontal
      ? new THREE.BoxGeometry(
          actualWindowWidth - frameThickness,
          actualWindowHeight - frameThickness,
          0.05
        )
      : new THREE.BoxGeometry(
          0.05,
          actualWindowHeight - frameThickness,
          actualWindowWidth - frameThickness
        );

    const glass = new THREE.Mesh(glassGeometry, windowGlassMaterial);

    glass.position.set(
      horizontal ? center : fixedPosition + outside,
      windowSill + halfH,
      horizontal ? fixedPosition + outside : center
    );

    glass.userData.nonInteractive = true;
    group.add(glass);

    function addFrame(offsetX, offsetY, width, partHeight) {
      const geometry = horizontal
        ? new THREE.BoxGeometry(width, partHeight, frameDepth)
        : new THREE.BoxGeometry(frameDepth, partHeight, width);

      const frame = new THREE.Mesh(geometry, windowFrameMaterial);

      frame.position.set(
        horizontal ? center + offsetX : fixedPosition + outside,
        windowSill + halfH + offsetY,
        horizontal ? fixedPosition + outside : center + offsetX
      );

      frame.castShadow = true;
      frame.userData.nonInteractive = true;
      group.add(frame);
    }

    addFrame(
      -halfW + frameThickness / 2,
      0,
      frameThickness,
      actualWindowHeight
    );

    addFrame(
      halfW - frameThickness / 2,
      0,
      frameThickness,
      actualWindowHeight
    );

    addFrame(
      0,
      halfH - frameThickness / 2,
      actualWindowWidth,
      frameThickness
    );

    addFrame(
      0,
      -halfH + frameThickness / 2,
      actualWindowWidth,
      frameThickness
    );

    addFrame(0, 0, frameThickness, actualWindowHeight);
  }

  for (let i = 0; i < windowCount; i++) {
    const cellStart = -length / 2 + i * spacing;
    const center = cellStart + spacing / 2;
    const sideLength = (spacing - actualWindowWidth) / 2;

    addPart(
      cellStart + sideLength / 2,
      sideLength,
      0,
      height
    );

    addPart(
      center + actualWindowWidth / 2 + sideLength / 2,
      sideLength,
      0,
      height
    );

    addPart(center, actualWindowWidth, 0, windowSill);

    addPart(
      center,
      actualWindowWidth,
      windowTop,
      height - windowTop
    );

    addWindow(center);
  }
}

// =====================================================
// 8. КАРКАС ЗДАНИЯ
// =====================================================

function createBuildingShell(group) {
  addFloorPart(
    group,
    0,
    -(innerZ + outerZ) / 2,
    BUILDING.courtyardWidth,
    outerZ - innerZ
  );

  addFloorPart(
    group,
    0,
    (innerZ + outerZ) / 2,
    BUILDING.courtyardWidth,
    outerZ - innerZ
  );

  addFloorPart(
    group,
    -(innerX + outerX) / 2,
    0,
    outerX - innerX,
    BUILDING.courtyardDepth
  );

  addFloorPart(
    group,
    (innerX + outerX) / 2,
    0,
    outerX - innerX,
    BUILDING.courtyardDepth
  );

  // Внутренние стены двора: по три окна на сторону.
  addFacadeWall(group, true, -innerZ, BUILDING.courtyardWidth, 1, 3);
  addFacadeWall(group, true, innerZ, BUILDING.courtyardWidth, -1, 3);
  addFacadeWall(group, false, -innerX, BUILDING.courtyardDepth, 1, 3);
  addFacadeWall(group, false, innerX, BUILDING.courtyardDepth, -1, 3);

  // Наружные фасады.
  addFacadeWall(group, true, -outerZ, BUILDING.outerWidth, -1);
  addFacadeWall(group, true, outerZ, BUILDING.outerWidth, 1);
  addFacadeWall(group, false, -outerX, BUILDING.outerDepth, -1);
  addFacadeWall(group, false, outerX, BUILDING.outerDepth, 1);

  if (group.name === 'floor-1') {
    const courtyard = new THREE.Mesh(
      new THREE.BoxGeometry(
        BUILDING.courtyardWidth,
        0.08,
        BUILDING.courtyardDepth
      ),
      courtyardMaterial
    );

    courtyard.position.set(0, -0.23, 0);
    courtyard.receiveShadow = true;
    courtyard.userData.nonInteractive = true;
    group.add(courtyard);
  }
}

// =====================================================
// 8.1. ДЕРЕВЬЯ ВО ДВОРЕ
// =====================================================

function createCourtyardTrees(group) {
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x79502f,
  });

  const leavesMaterial = new THREE.MeshStandardMaterial({
    color: 0x39804a,
  });

  const positions = [
    [-11, -6], [-5, -6], [5, -6], [11, -6],
    [-11, 6], [-5, 6], [5, 6], [11, 6],
    [-12, 0], [12, 0],
  ];

  positions.forEach(([x, z]) => {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.22, 1.8, 8),
      trunkMaterial
    );

    trunk.position.y = 0.9;
    trunk.castShadow = true;
    trunk.userData.nonInteractive = true;
    tree.add(trunk);

    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 10, 8),
      leavesMaterial
    );

    leaves.position.y = 2.2;
    leaves.castShadow = true;
    leaves.userData.nonInteractive = true;
    tree.add(leaves);

    const top = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 10, 8),
      leavesMaterial
    );

    top.position.y = 2.9;
    top.castShadow = true;
    top.userData.nonInteractive = true;
    tree.add(top);

    tree.userData.nonInteractive = true;
    group.add(tree);
  });
}

// =====================================================
// 8.2. ФУТБОЛЬНОЕ ПОЛЕ
// =====================================================

function createFootballField(group) {
  const field = new THREE.Group();
  field.name = 'courtyard-football-field';
  field.userData.nonInteractive = true;

  const greenMaterial = new THREE.MeshStandardMaterial({
    color: 0x398b42,
    roughness: 1,
  });

  const stripeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1,
  });

  const width = 14;
  const depth = 8;
  const y = 0.04;

  const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    greenMaterial
  );

  grass.rotation.x = -Math.PI / 2;
  grass.position.y = y;
  grass.receiveShadow = true;
  grass.userData.nonInteractive = true;
  field.add(grass);

  function line(x, z, w, d) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.015, d),
      stripeMaterial
    );

    mesh.position.set(x, y + 0.01, z);
    mesh.userData.nonInteractive = true;
    field.add(mesh);
  }

  const t = 0.045;

  line(0, -depth / 2, width, t);
  line(0, depth / 2, width, t);
  line(-width / 2, 0, t, depth);
  line(width / 2, 0, t, depth);
  line(0, 0, t, depth);

  const circle = new THREE.Mesh(
    new THREE.RingGeometry(0.9, 0.96, 48),
    stripeMaterial
  );

  circle.rotation.x = -Math.PI / 2;
  circle.position.y = y + 0.02;
  circle.userData.nonInteractive = true;
  field.add(circle);

  const point = new THREE.Mesh(
    new THREE.CircleGeometry(0.08, 16),
    stripeMaterial
  );

  point.rotation.x = -Math.PI / 2;
  point.position.y = y + 0.02;
  point.userData.nonInteractive = true;
  field.add(point);

  const boxDepth = 3;
  const boxWidth = 5;

  [-1, 1].forEach((side) => {
    const x = side * (width / 2 - boxDepth / 2);

    line(x, 0, boxDepth, t);
    line(side * (width / 2 - boxDepth), 0, t, boxWidth);

    line(
      side * (width / 2 - boxDepth / 2),
      -boxWidth / 2,
      boxDepth,
      t
    );

    line(
      side * (width / 2 - boxDepth / 2),
      boxWidth / 2,
      boxDepth,
      t
    );
  });

  const goalMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.45,
    metalness: 0.15,
  });

  const netMaterial = new THREE.MeshBasicMaterial({
    color: 0xdedede,
    wireframe: true,
  });

  function createGoal(x, direction) {
    const goal = new THREE.Group();

    const goalWidth = 2;
    const goalHeight = 1.2;
    const goalDepth = 0.7;
    const barThickness = 0.07;

    [-goalWidth / 2, goalWidth / 2].forEach((z) => {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(
          barThickness,
          goalHeight,
          barThickness
        ),
        goalMaterial
      );

      post.position.set(0, goalHeight / 2, z);
      post.userData.nonInteractive = true;
      goal.add(post);
    });

    const crossbar = new THREE.Mesh(
      new THREE.BoxGeometry(
        barThickness,
        barThickness,
        goalWidth + barThickness
      ),
      goalMaterial
    );

    crossbar.position.set(0, goalHeight, 0);
    crossbar.userData.nonInteractive = true;
    goal.add(crossbar);

    const net = new THREE.Mesh(
      new THREE.BoxGeometry(goalDepth, goalHeight, goalWidth),
      netMaterial
    );

    net.position.set(
      direction * goalDepth / 2,
      goalHeight / 2,
      0
    );

    net.userData.nonInteractive = true;
    goal.add(net);

    goal.position.set(x, y, 0);
    goal.userData.nonInteractive = true;
    field.add(goal);
  }

  createGoal(-width / 2, -1);
  createGoal(width / 2, 1);

  group.add(field);
}

// =====================================================
// 8.3. ТУРНИК И СКАМЕЙКИ
// =====================================================

function createCourtyardFurniture(group) {
  const metal = new THREE.MeshStandardMaterial({
    color: '#596773',
    metalness: 0.75,
    roughness: 0.3,
  });

  const steel = new THREE.MeshStandardMaterial({
    color: '#c0cbd3',
    metalness: 0.85,
    roughness: 0.24,
  });

  const wood = new THREE.MeshStandardMaterial({
    color: '#95613c',
    roughness: 0.75,
  });

  const woodAlt = new THREE.MeshStandardMaterial({
    color: '#ad7950',
    roughness: 0.75,
  });

  function box(parent, w, h, d, x, y, z, material) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      material
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.nonInteractive = true;
    parent.add(mesh);

    return mesh;
  }

  function tube(parent, a, b, radius, material) {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);
    const direction = new THREE.Vector3().subVectors(end, start);

    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(
        radius,
        radius,
        direction.length(),
        16
      ),
      material
    );

    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize()
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.nonInteractive = true;
    parent.add(mesh);

    return mesh;
  }

  // Турник
  const bar = new THREE.Group();
  bar.name = 'courtyard-pull-up-bar';
  bar.userData.nonInteractive = true;

  const barZ = 6.7;
  const barWidth = 2.8;
  const barHeight = 2.15;
  const postRadius = 0.065;

  for (const x of [-barWidth / 2, barWidth / 2]) {
    tube(
      bar,
      [x, 0.08, barZ],
      [x, barHeight, barZ],
      postRadius,
      metal
    );

    box(bar, 0.34, 0.08, 0.34, x, 0.04, barZ, metal);
  }

  tube(
    bar,
    [-barWidth / 2, barHeight, barZ],
    [barWidth / 2, barHeight, barZ],
    0.055,
    steel
  );

  group.add(bar);

  // Скамейки
  function createBench(x, z, rotation = 0) {
    const bench = new THREE.Group();
    bench.name = 'courtyard-bench';
    bench.userData.nonInteractive = true;

    const width = 2.0;
    const depth = 0.48;
    const seatY = 0.48;
    const backY = 0.88;

    for (const supportX of [-0.7, 0.7]) {
      box(
        bench,
        0.07, seatY, 0.07,
        supportX, seatY / 2, depth * 0.25,
        metal
      );

      box(
        bench,
        0.07, backY, 0.07,
        supportX, backY / 2, -depth * 0.38,
        metal
      );

      box(
        bench,
        0.12, 0.06, depth * 0.9,
        supportX, seatY - 0.07, 0,
        metal
      );
    }

    for (let i = 0; i < 3; i++) {
      const plankDepth = depth / 3;

      box(
        bench,
        width,
        0.065,
        plankDepth - 0.012,
        0,
        seatY,
        -depth / 2 + plankDepth * (i + 0.5),
        i % 2 === 0 ? wood : woodAlt
      );
    }

    for (let i = 0; i < 2; i++) {
      box(
        bench,
        width,
        0.09,
        0.055,
        0,
        0.68 + i * 0.16,
        -depth * 0.38,
        i === 0 ? wood : woodAlt
      );
    }

    bench.position.set(x, 0, z);
    bench.rotation.y = rotation;

    group.add(bench);
  }

  // Боковые скамейки расположены между деревьями и полем.
  createBench(-10.5, 0, Math.PI / 2);
  createBench(10, 0, -Math.PI / 2);
  createBench(0, -7, 0);
}

// =====================================================
// 9. ЗЕМЛЯ
// =====================================================

const SCHOOL_GROUND = {
  width: 100,
  depth: 85,
};

function createGroundPart({
  width,
  depth,
  x,
  z,
  y = -0.55,
  material,
}) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.1, depth),
    material
  );

  mesh.position.set(x, y, z);
  mesh.receiveShadow = true;
  mesh.userData.nonInteractive = true;
  scene.add(mesh);

  return mesh;
}

function createSchoolGround() {
  createGroundPart({
    width: SCHOOL_GROUND.width,
    depth: SCHOOL_GROUND.depth,
    x: 0,
    z: 0,
    y: -0.72,
    material: grassMaterial,
  });
}

createSchoolGround();

// =====================================================
// 10. СОЗДАНИЕ ЭТАЖЕЙ И КАБИНЕТОВ
// =====================================================

const floorGroups = new Map();
const roomTargets = new Map();
const roomMeshes = new Map();
const courtyardDecorations = new Map();

function createRoomTarget(group, roomData) {
  if (roomData.type === 'corner') return null;

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(roomData.width, 0.15, roomData.depth),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );

  mesh.position.set(roomData.x, 0.12, roomData.z);

  mesh.userData = {
    id: String(roomData.id),
    floorId: roomData.floorId,
    nonInteractive: false,
  };

  group.add(mesh);
  return mesh;
}

floors.forEach((floor, index) => {
  const floorGroup = new THREE.Group();
  floorGroup.name = `floor-${floor.id}`;
  floorGroup.position.y = index * BUILDING.levelHeight;

  createBuildingShell(floorGroup);

  // Запоминаем объекты двора отдельно от здания.
  const courtyardStartIndex = floorGroup.children.length;

  createCourtyardTrees(floorGroup);
  createFootballField(floorGroup);
  createCourtyardFurniture(floorGroup);

  courtyardDecorations.set(
    floor.id,
    floorGroup.children.slice(courtyardStartIndex)
  );

  const targets = [];

  floor.rooms.forEach((roomData) => {
    roomData.floorId = floor.id;

    if (roomData.type === 'corner') {
      const corner = new THREE.Mesh(
        new THREE.BoxGeometry(roomData.width, 0.12, roomData.depth),
        cornerMaterial
      );

      corner.position.set(roomData.x, 0.02, roomData.z);
      corner.receiveShadow = true;

      corner.userData = {
        type: 'corner',
        nonInteractive: true,
      };

      floorGroup.add(corner);
      return;
    }

    createRoomStructure(floorGroup, roomData);
    createRoomLabel(floorGroup, roomData);

    const target = createRoomTarget(floorGroup, roomData);

    if (target) {
      targets.push(target);
      roomMeshes.set(`${floor.id}:${roomData.id}`, target);
    }
  });

  scene.add(floorGroup);
  floorGroups.set(floor.id, floorGroup);
  roomTargets.set(floor.id, targets);

  floorGroup.visible = index === 0;
});

// =====================================================
// 11. ПЕРЕКЛЮЧЕНИЕ ЭТАЖЕЙ
// =====================================================

const floorPanel = document.createElement('div');

Object.assign(floorPanel.style, {
  position: 'fixed',
  top: '16px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: '8px',
  padding: '10px',
  border: '1px solid rgba(32,207,255,0.35)',
  borderRadius: '14px',
  background: 'rgba(5,12,25,0.92)',
  backdropFilter: 'blur(12px)',
  zIndex: '1000',
});

document.body.appendChild(floorPanel);

let activeFloor = floors[0];

function createFloorButton(label, floor) {
  const button = document.createElement('button');
  button.textContent = label;

  Object.assign(button.style, {
    padding: '10px 16px',
    border: '1px solid #24516b',
    borderRadius: '9px',
    color: '#e7f7ff',
    background: '#10243a',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  });

  button.addEventListener('click', () => {
    if (floor) {
      switchFloor(floor.id);
    } else {
      showAllFloors();
    }
  });

  floorPanel.appendChild(button);
  return button;
}

const floorButtons = new Map();

floors.forEach((floor) => {
  floorButtons.set(floor.id, createFloorButton(floor.name, floor));
});

const allFloorsButton = createFloorButton('Вся школа', null);

function updateFloorButtonStyles(allVisible = false) {
  for (const [id, button] of floorButtons) {
    const selected = !allVisible && id === activeFloor.id;

    button.style.background = selected ? '#087ca5' : '#10243a';
    button.style.borderColor = selected ? '#45e5ff' : '#24516b';
  }

  allFloorsButton.style.background = allVisible ? '#087ca5' : '#10243a';
  allFloorsButton.style.borderColor = allVisible ? '#45e5ff' : '#24516b';
}

// =====================================================
// 12. ПОДСВЕТКА КАБИНЕТА
// =====================================================

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const highlight = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    color: '#00cfff',
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
);

highlight.rotation.x = -Math.PI / 2;
highlight.position.y = 0.105;
highlight.visible = false;
scene.add(highlight);

const highlightOutline = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)),
  new THREE.LineBasicMaterial({ color: '#45e5ff' })
);

highlightOutline.rotation.x = -Math.PI / 2;
highlightOutline.position.y = 0.115;
highlightOutline.visible = false;
scene.add(highlightOutline);

function setRoomHighlight(room) {
  if (!room || room.userData.nonInteractive) {
    highlight.visible = false;
    highlightOutline.visible = false;
    renderer.domElement.style.cursor = 'grab';
    return;
  }

  const roomData = activeFloor.rooms.find(
    (item) => String(item.id) === String(room.userData.id)
  );

  if (!roomData || roomData.type === 'corner') {
    highlight.visible = false;
    highlightOutline.visible = false;
    return;
  }

  const floorIndex = floors.findIndex(
    (floor) => floor.id === activeFloor.id
  );

  const floorOffset = Math.max(floorIndex, 0) * BUILDING.levelHeight;

  highlight.position.set(
    roomData.x,
    floorOffset + 0.105,
    roomData.z
  );

  highlight.scale.set(roomData.width, roomData.depth, 1);
  highlight.visible = true;

  highlightOutline.position.set(
    roomData.x,
    floorOffset + 0.115,
    roomData.z
  );

  highlightOutline.scale.set(roomData.width, roomData.depth, 1);
  highlightOutline.visible = true;

  renderer.domElement.style.cursor = 'pointer';
}

function updatePointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();

  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
}


let pointerMovePending = false;
let lastPointerEvent = null;

renderer.domElement.addEventListener('pointermove', (event) => {
  lastPointerEvent = event;

  if (pointerMovePending) return;
  pointerMovePending = true;

  requestAnimationFrame(() => {
    pointerMovePending = false;

    if (!lastPointerEvent) return;

    updatePointer(lastPointerEvent);

    const targets = roomTargets.get(activeFloor.id) || [];
    const hits = raycaster.intersectObjects(targets, false);

    setRoomHighlight(hits.length ? hits[0].object : null);
  });
});


// =====================================================
// 13. КАРТОЧКА КАБИНЕТА
// =====================================================

const info = document.querySelector('#room-info');
const roomNumber = document.querySelector('#room-number');
const roomName = document.querySelector('#room-name');
const roomStatus = document.querySelector('#room-status');
const roomTeacher = document.querySelector('#room-teacher');
const roomGroup = document.querySelector('#room-group');
const roomSubject = document.querySelector('#room-subject');
const closeRoom = document.querySelector('#close-room');

const searchInput = document.querySelector('#room-search');
const searchButton = document.querySelector('#search-button');
const searchMessage = document.querySelector('#search-message');

function openRoomCard(data) {
  if (!data || data.type === 'corner') return;

  roomNumber.textContent = data.id;
  roomName.textContent = data.name;
  roomStatus.textContent = String(data.status ?? 'Неизвестно').toUpperCase();
  roomTeacher.textContent = data.teacher ?? 'Не назначен';
  roomGroup.textContent = data.group ?? '—';
  roomSubject.textContent = data.subject ?? 'Нет данных';

  info.classList.add('visible');
}

closeRoom.addEventListener('click', () => {
  info.classList.remove('visible');
});

// =====================================================
// 14. ПРИБЛИЖЕНИЕ К КАБИНЕТУ
// =====================================================

function focusRoom(roomData) {
  if (!roomData || roomData.type === 'corner') return;

  const floorIndex = floors.findIndex(
    (floor) => floor.id === activeFloor.id
  );

  const floorOffset = Math.max(floorIndex, 0) * BUILDING.levelHeight;

  const target = new THREE.Vector3(
    roomData.x,
    floorOffset + 0.3,
    roomData.z
  );

  const cameraPosition = new THREE.Vector3(
    roomData.x,
    floorOffset + 7,
    roomData.z + 8
  );

  moveCameraTo(cameraPosition, target, 900);
}

// =====================================================
// 15. КЛИК ПО КАБИНЕТУ
// =====================================================

renderer.domElement.addEventListener('click', (event) => {
  updatePointer(event);

  const targets = roomTargets.get(activeFloor.id) || [];
  const hits = raycaster.intersectObjects(targets, false);

  if (!hits.length) return;

  const selectedRoom = hits[0].object;

  if (selectedRoom.userData.nonInteractive) return;

  const data = activeFloor.rooms.find(
    (item) => String(item.id) === String(selectedRoom.userData.id)
  );

  if (!data || data.type === 'corner') return;

  openRoomCard(data);
  setRoomHighlight(selectedRoom);
  focusRoom(data);
});

// =====================================================
// 16. ПЕРЕКЛЮЧЕНИЕ ЭТАЖЕЙ
// =====================================================

function focusFloor(floor) {
  const floorIndex = floors.findIndex(
    (item) => item.id === floor.id
  );

  const floorOffset = Math.max(floorIndex, 0) * BUILDING.levelHeight;

  const target = new THREE.Vector3(0, floorOffset, 0);
  const position = new THREE.Vector3(0, floorOffset + 28, 32);

  moveCameraTo(position, target, 900);
}

function switchFloor(floorId) {
  const floor = floors.find((item) => item.id === floorId);
  if (!floor) return;

  activeFloor = floor;

  for (const [id, group] of floorGroups) {
    group.visible = id === floorId;
  }

  // При выборе этажа его двор снова виден.
  const decorations = courtyardDecorations.get(floorId);

  if (decorations) {
    decorations.forEach((object) => {
      object.visible = true;
    });
  }

  highlight.visible = false;
  highlightOutline.visible = false;
  info.classList.remove('visible');

  focusFloor(floor);
  updateFloorButtonStyles(false);
}


function showAllFloors() {
  for (const group of floorGroups.values()) {
    group.visible = true;
  }

  // Показываем декор двора только на первом этаже.
  for (const [floorId, decorations] of courtyardDecorations) {
    const isFirstFloor = floorId === floors[0].id;

    decorations.forEach((object) => {
      object.visible = isFirstFloor;
    });
  }

  highlight.visible = false;
  highlightOutline.visible = false;
  info.classList.remove('visible');

  moveCameraTo(
    new THREE.Vector3(55, 52, 60),
    new THREE.Vector3(0, BUILDING.levelHeight, 0),
    1000
  );

  updateFloorButtonStyles(true);
}


updateFloorButtonStyles(false);

// =====================================================
// 17. ПОИСК КАБИНЕТА
// =====================================================

function searchRoom() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    searchMessage.textContent = 'Введите номер кабинета';
    return;
  }

  let foundFloor = null;
  let foundRoom = null;

  for (const floor of floors) {
    const match = floor.rooms.find((room) => {
      if (room.type === 'corner') return false;

      return (
        String(room.id).toLowerCase() === query ||
        String(room.name).toLowerCase().includes(query)
      );
    });

    if (match) {
      foundFloor = floor;
      foundRoom = match;
      break;
    }
  }

  if (!foundRoom || !foundFloor) {
    searchMessage.textContent = 'Кабинет не найден';
    return;
  }

  switchFloor(foundFloor.id);

  const room = roomMeshes.get(`${foundFloor.id}:${foundRoom.id}`);

  if (!room) {
    searchMessage.textContent = 'Не удалось выбрать кабинет';
    return;
  }

  setRoomHighlight(room);
  openRoomCard(foundRoom);
  focusRoom(foundRoom);

  searchMessage.textContent =
    `Найдено: ${foundRoom.name} — ${foundFloor.name}`;
}

searchButton.addEventListener('click', searchRoom);

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') searchRoom();
});

// =====================================================
// 18. ИЗМЕНЕНИЕ РАЗМЕРА ОКНА БРАУЗЕРА
// =====================================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

// =====================================================
// 19. ЦИКЛ РЕНДЕРИНГА
// =====================================================


const perfStats = {
  frames: 0,
  lastTime: performance.now(),
};

function updatePerfStats() {
  perfStats.frames++;

  const now = performance.now();

  if (now - perfStats.lastTime >= 1000) {
    const fps = Math.round(
      (perfStats.frames * 1000) / (now - perfStats.lastTime)
    );

    const info = renderer.info;

    console.log(
      `[Digital Campus] FPS: ${fps} | ` +
      `Draw calls: ${info.render.calls} | ` +
      `Triangles: ${info.render.triangles} | ` +
      `Geometries: ${info.memory.geometries} | ` +
      `Textures: ${info.memory.textures}`
    );

    perfStats.frames = 0;
    perfStats.lastTime = now;
  }
}


function animate() {
  requestAnimationFrame(animate);

  updateCameraMove();
  controls.update();

  renderer.render(scene, camera);
}

animate();
