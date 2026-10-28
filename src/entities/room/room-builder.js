
import * as THREE from 'three';

const WALL_HEIGHT = 3;
const WALL_THICKNESS = 0.12;

const wallMaterial = new THREE.MeshStandardMaterial({
  color: '#142943',
  metalness: 0.25,
  roughness: 0.55,
});

const edgeMaterial = new THREE.LineBasicMaterial({
  color: '#20cfff',
});

const floorMaterial = new THREE.MeshStandardMaterial({
  color: '#101b30',
  metalness: 0.35,
  roughness: 0.5,
});

const doorMaterial = new THREE.MeshStandardMaterial({
  color: '#183c57',
  metalness: 0.2,
  roughness: 0.5,
});

const frameMaterial = new THREE.MeshStandardMaterial({
  color: '#20cfff',
  emissive: '#087b9b',
  emissiveIntensity: 0.25,
  metalness: 0.35,
  roughness: 0.4,
});

const glassMaterial = new THREE.MeshStandardMaterial({
  color: '#79dfff',
  emissive: '#164b65',
  emissiveIntensity: 0.2,
  metalness: 0.25,
  roughness: 0.15,
  transparent: true,
  opacity: 0.65,
  side: THREE.DoubleSide,
  depthWrite: false,
});

const deskMaterial = new THREE.MeshStandardMaterial({
  color: '#805b3b',
  roughness: 0.7,
});

const deskTopMaterial = new THREE.MeshStandardMaterial({
  color: '#bd9568',
  roughness: 0.65,
});

const chairMaterial = new THREE.MeshStandardMaterial({
  color: '#247ba0',
  metalness: 0.2,
  roughness: 0.55,
});

const boardMaterial = new THREE.MeshStandardMaterial({
  color: '#123b45',
  emissive: '#062b35',
  emissiveIntensity: 0.35,
  roughness: 0.45,
});

const metalMaterial = new THREE.MeshStandardMaterial({
  color: '#526c83',
  metalness: 0.7,
  roughness: 0.35,
});

const SIDES = ['north', 'south', 'east', 'west'];

// =====================================================
// БАЗОВЫЕ ОБЪЕКТЫ
// =====================================================

function createWall(
  scene,
  x,
  z,
  width,
  depth,
  height = WALL_HEIGHT,
  y = height / 2,
  material = wallMaterial
) {
  if (width <= 0 || depth <= 0 || height <= 0) return null;

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.nonInteractive = true;

  scene.add(mesh);
  return mesh;
}

function createFurnitureBox(
  group,
  material,
  width,
  height,
  depth,
  x,
  y,
  z
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.nonInteractive = true;

  group.add(mesh);
  return mesh;
}

// =====================================================
// ПАРТА И СТУЛ
// =====================================================

function createDesk(group, x, z, angle = 0) {
  const desk = new THREE.Group();

  desk.position.set(x, 0, z);
  desk.rotation.y = angle;
  group.add(desk);

  createFurnitureBox(
    desk, deskTopMaterial,
    1.25, 0.09, 0.65,
    0, 0.78, 0
  );

  for (const dx of [-0.5, 0.5]) {
    for (const dz of [-0.23, 0.23]) {
      createFurnitureBox(
        desk, metalMaterial,
        0.045, 0.72, 0.045,
        dx, 0.38, dz
      );
    }
  }

  const chairZ = -0.58;

  createFurnitureBox(
    desk, chairMaterial,
    0.48, 0.08, 0.45,
    0, 0.47, chairZ
  );

  createFurnitureBox(
    desk, chairMaterial,
    0.48, 0.48, 0.07,
    0, 0.72, chairZ - 0.19
  );

  for (const dx of [-0.18, 0.18]) {
    for (const dz of [-0.14, 0.14]) {
      createFurnitureBox(
        desk, metalMaterial,
        0.035, 0.43, 0.035,
        dx, 0.23, chairZ + dz
      );
    }
  }

  return desk;
}

// =====================================================
// СТОЛ УЧИТЕЛЯ
// =====================================================

function createTeacherDesk(group, x, z, angle = 0) {
  const desk = new THREE.Group();

  desk.position.set(x, 0, z);
  desk.rotation.y = angle;
  group.add(desk);

  createFurnitureBox(
    desk, deskTopMaterial,
    1.5, 0.1, 0.75,
    0, 0.82, 0
  );

  for (const dx of [-0.58, 0.58]) {
    createFurnitureBox(
      desk, deskMaterial,
      0.12, 0.75, 0.65,
      dx, 0.4, 0
    );
  }
}

// =====================================================
// ДОСКА
// =====================================================

function createBoard(group, room) {
  const { x, z, width, depth } = room;
  const side = room.doorSide || 'south';

  let boardX = x;
  let boardZ = z;
  let boardWidth = Math.min(2.6, width - 1);
  let boardDepth = 0.09;

  if (side === 'south') {
    boardZ = z - depth / 2 + 0.2;
  } else if (side === 'north') {
    boardZ = z + depth / 2 - 0.2;
  } else if (side === 'east') {
    boardX = x - width / 2 + 0.2;
    boardWidth = 0.09;
    boardDepth = Math.min(2.6, depth - 1);
  } else {
    boardX = x + width / 2 - 0.2;
    boardWidth = 0.09;
    boardDepth = Math.min(2.6, depth - 1);
  }

  createFurnitureBox(
    group, boardMaterial,
    boardWidth, 1.05, boardDepth,
    boardX, 1.55, boardZ
  );

  const trim = 0.045;
  const horizontal = boardWidth > boardDepth;

  if (horizontal) {
    for (const y of [1.02, 2.08]) {
      createFurnitureBox(
        group, frameMaterial,
        boardWidth + trim, 0.035, 0.12,
        boardX, y, boardZ
      );
    }

    for (const dx of [-boardWidth / 2, boardWidth / 2]) {
      createFurnitureBox(
        group, frameMaterial,
        0.035, 1.08, 0.12,
        boardX + dx, 1.55, boardZ
      );
    }
  } else {
    for (const dz of [-boardDepth / 2, boardDepth / 2]) {
      createFurnitureBox(
        group, frameMaterial,
        0.12, 1.08, 0.035,
        boardX, 1.55, boardZ + dz
      );
    }

    for (const y of [1.02, 2.08]) {
      createFurnitureBox(
        group, frameMaterial,
        0.12, 0.035, boardDepth + trim,
        boardX, y, boardZ
      );
    }
  }
}

// =====================================================
// МЕБЕЛЬ В КАБИНЕТЕ
// =====================================================

function createClassroomFurniture(scene, room) {
  const furniture = new THREE.Group();

  furniture.name = `furniture-${room.id}`;
  furniture.userData.roomId = room.id;
  furniture.userData.furniture = true;

  const { x, z, width, depth } = room;
  const side = room.doorSide || 'south';

  createBoard(furniture, room);

  let forwardX = 0;
  let forwardZ = 0;

  if (side === 'south') forwardZ = 1;
  if (side === 'north') forwardZ = -1;
  if (side === 'east') forwardX = -1;
  if (side === 'west') forwardX = 1;

  const rightX = -forwardZ;
  const rightZ = forwardX;
  const angle = Math.atan2(forwardX, forwardZ);

  createTeacherDesk(
    furniture,
    x - forwardX * 1.05,
    z - forwardZ * 1.05,
    angle
  );

  const rowDistances = [0.45, 1.85];
  const columnDistances = [-1.05, 1.05];

  for (const rowDistance of rowDistances) {
    for (const columnDistance of columnDistances) {
      const deskX =
        x + forwardX * rowDistance + rightX * columnDistance;

      const deskZ =
        z + forwardZ * rowDistance + rightZ * columnDistance;

      const localX = deskX - x;
      const localZ = deskZ - z;

      const fits =
        Math.abs(localX) + 0.9 <= width / 2 - 0.2 &&
        Math.abs(localZ) + 0.9 <= depth / 2 - 0.2;

      if (!fits) continue;

      createDesk(furniture, deskX, deskZ, angle);
    }
  }

  scene.add(furniture);
  return furniture;
}

// =====================================================
// ПОЛ КАБИНЕТА
// =====================================================

function createRoomFloor(scene, room) {
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(room.width, 0.08, room.depth),
    floorMaterial
  );

  floor.position.set(room.x, 0.04, room.z);
  floor.receiveShadow = true;
  floor.userData.nonInteractive = true;
  scene.add(floor);

  const points = [
    new THREE.Vector3(
      room.x - room.width / 2, 0.09,
      room.z - room.depth / 2
    ),
    new THREE.Vector3(
      room.x + room.width / 2, 0.09,
      room.z - room.depth / 2
    ),
    new THREE.Vector3(
      room.x + room.width / 2, 0.09,
      room.z + room.depth / 2
    ),
    new THREE.Vector3(
      room.x - room.width / 2, 0.09,
      room.z + room.depth / 2
    ),
  ];

  const geometry = new THREE.BufferGeometry().setFromPoints([
    ...points,
    points[0],
  ]);

  const outline = new THREE.Line(geometry, edgeMaterial);
  outline.userData.nonInteractive = true;
  scene.add(outline);
}

// =====================================================
// ДВЕРЬ
// =====================================================

function createDoor(scene, x, z, side = 'south') {
  const doorWidth = 1.05;
  const doorHeight = 1.9;
  const thickness = 0.07;
  const sideDoor = side === 'east' || side === 'west';

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(
      sideDoor ? thickness : doorWidth,
      doorHeight,
      sideDoor ? doorWidth : thickness
    ),
    doorMaterial
  );

  door.position.set(x, doorHeight / 2, z);
  door.castShadow = true;
  door.userData.nonInteractive = true;
  scene.add(door);

  const frameWidth = 0.07;
  const frameDepth = 0.09;

  if (sideDoor) {
    for (const offset of [-doorWidth / 2, doorWidth / 2]) {
      createWall(
        scene, x, z + offset,
        frameDepth, frameWidth,
        doorHeight, doorHeight / 2,
        frameMaterial
      );
    }

    createWall(
      scene, x, z,
      frameDepth, doorWidth + frameWidth,
      frameWidth, doorHeight,
      frameMaterial
    );
  } else {
    for (const offset of [-doorWidth / 2, doorWidth / 2]) {
      createWall(
        scene, x + offset, z,
        frameWidth, frameDepth,
        doorHeight, doorHeight / 2,
        frameMaterial
      );
    }

    createWall(
      scene, x, z,
      doorWidth + frameWidth, frameDepth,
      frameWidth, doorHeight,
      frameMaterial
    );
  }
}

function createDoorWall(scene, room, side) {
  const { x, z, width, depth } = room;
  const horizontal = side === 'north' || side === 'south';
  const wallLength = horizontal ? width : depth;
  const doorWidth = Math.min(1.05, wallLength * 0.3);
  const segment = (wallLength - doorWidth) / 2;

  const wallZ =
    side === 'north' ? z - depth / 2 :
    side === 'south' ? z + depth / 2 : z;

  const wallX =
    side === 'west' ? x - width / 2 :
    side === 'east' ? x + width / 2 : x;

  if (horizontal) {
    createWall(
      scene,
      x - doorWidth / 2 - segment / 2,
      wallZ, segment, WALL_THICKNESS
    );

    createWall(
      scene,
      x + doorWidth / 2 + segment / 2,
      wallZ, segment, WALL_THICKNESS
    );

    // Перемычка над дверью
    createWall(
      scene, x, wallZ,
      doorWidth, WALL_THICKNESS,
      WALL_HEIGHT - 1.9,
      1.9 + (WALL_HEIGHT - 1.9) / 2
    );

    createDoor(scene, x, wallZ, side);
  } else {
    createWall(
      scene,
      wallX,
      z - doorWidth / 2 - segment / 2,
      WALL_THICKNESS, segment
    );

    createWall(
      scene,
      wallX,
      z + doorWidth / 2 + segment / 2,
      WALL_THICKNESS, segment
    );

    createWall(
      scene, wallX, z,
      WALL_THICKNESS, doorWidth,
      WALL_HEIGHT - 1.9,
      1.9 + (WALL_HEIGHT - 1.9) / 2
    );

    createDoor(scene, wallX, z, side);
  }
}

// =====================================================
// ОКНО С НАСТОЯЩИМ ПРОЁМОМ
// =====================================================

function createWindowWall(scene, room, side) {
  const { x, z, width, depth } = room;
  const horizontal = side === 'north' || side === 'south';

  const wallLength = horizontal ? width : depth;
  const windowWidth = Math.min(1.8, wallLength * 0.4);
  const segment = (wallLength - windowWidth) / 2;

  const sillHeight = 0.85;
  const windowHeight = 1.2;
  const windowTop = sillHeight + windowHeight;
  const t = WALL_THICKNESS;

  const wallX =
    side === 'west' ? x - width / 2 :
    side === 'east' ? x + width / 2 : x;

  const wallZ =
    side === 'north' ? z - depth / 2 :
    side === 'south' ? z + depth / 2 : z;

  if (horizontal) {
    // Стена слева и справа от проёма
    createWall(
      scene,
      x - windowWidth / 2 - segment / 2,
      wallZ,
      segment,
      t
    );

    createWall(
      scene,
      x + windowWidth / 2 + segment / 2,
      wallZ,
      segment,
      t
    );

    // Подоконная часть стены
    createWall(
      scene,
      x,
      wallZ,
      windowWidth,
      t,
      sillHeight,
      sillHeight / 2
    );

    // Стена над окном
    if (WALL_HEIGHT > windowTop) {
      createWall(
        scene,
        x,
        wallZ,
        windowWidth,
        t,
        WALL_HEIGHT - windowTop,
        windowTop + (WALL_HEIGHT - windowTop) / 2
      );
    }

    // Стекло располагается в плоскости проёма
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth - 0.08, windowHeight - 0.08, 0.035),
      glassMaterial
    );

    glass.position.set(x, sillHeight + windowHeight / 2, wallZ);
    glass.userData.nonInteractive = true;
    scene.add(glass);

    // Рама по периметру
    for (const offset of [-windowWidth / 2, windowWidth / 2]) {
      createWall(
        scene,
        x + offset,
        wallZ,
        0.055,
        0.09,
        windowHeight + 0.08,
        sillHeight + windowHeight / 2,
        frameMaterial
      );
    }

    for (const y of [sillHeight, windowTop]) {
      createWall(
        scene,
        x,
        wallZ,
        windowWidth + 0.06,
        0.09,
        0.055,
        y,
        frameMaterial
      );
    }

    // Вертикальная перемычка
    createWall(
      scene,
      x,
      wallZ,
      0.045,
      0.09,
      windowHeight,
      sillHeight + windowHeight / 2,
      frameMaterial
    );
  } else {
    // Стена слева и справа от проёма вдоль оси Z
    createWall(
      scene,
      wallX,
      z - windowWidth / 2 - segment / 2,
      t,
      segment
    );

    createWall(
      scene,
      wallX,
      z + windowWidth / 2 + segment / 2,
      t,
      segment
    );

    // Подоконная часть стены
    createWall(
      scene,
      wallX,
      z,
      t,
      windowWidth,
      sillHeight,
      sillHeight / 2
    );

    // Стена над окном
    if (WALL_HEIGHT > windowTop) {
      createWall(
        scene,
        wallX,
        z,
        t,
        windowWidth,
        WALL_HEIGHT - windowTop,
        windowTop + (WALL_HEIGHT - windowTop) / 2
      );
    }

    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, windowHeight - 0.08, windowWidth - 0.08),
      glassMaterial
    );

    glass.position.set(wallX, sillHeight + windowHeight / 2, z);
    glass.userData.nonInteractive = true;
    scene.add(glass);

    for (const offset of [-windowWidth / 2, windowWidth / 2]) {
      createWall(
        scene,
        wallX,
        z + offset,
        0.09,
        0.055,
        windowHeight + 0.08,
        sillHeight + windowHeight / 2,
        frameMaterial
      );
    }

    for (const y of [sillHeight, windowTop]) {
      createWall(
        scene,
        wallX,
        z,
        0.09,
        windowWidth + 0.06,
        0.055,
        y,
        frameMaterial
      );
    }

    createWall(
      scene,
      wallX,
      z,
      0.09,
      0.045,
      windowHeight,
      sillHeight + windowHeight / 2,
      frameMaterial
    );
  }
}

// =====================================================
// СОЗДАНИЕ КАБИНЕТА
// =====================================================

export function createRoomStructure(scene, room) {
  if (room.type === 'corner') return room;

  createRoomFloor(scene, room);

  const { x, z, width, depth } = room;
  const doorSide = room.doorSide || 'south';
  const windowSide = room.windowSide;

  for (const side of SIDES) {
    if (side === doorSide) {
      createDoorWall(scene, room, side);
    } else if (side === windowSide) {
      createWindowWall(scene, room, side);
    } else if (side === 'north' || side === 'south') {
      const wallZ =
        side === 'north' ? z - depth / 2 : z + depth / 2;

      createWall(scene, x, wallZ, width, WALL_THICKNESS);
    } else {
      const wallX =
        side === 'west' ? x - width / 2 : x + width / 2;

      createWall(scene, wallX, z, WALL_THICKNESS, depth);
    }
  }

  createClassroomFurniture(scene, room);
  return room;
}

// =====================================================
// ПОДПИСЬ КАБИНЕТА
// =====================================================

export function createRoomLabel(scene, room) {
  if (room.type === 'corner') return null;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = 512;
  canvas.height = 128;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(8, 18, 35, 0.92)';
  context.fillRect(8, 8, canvas.width - 16, canvas.height - 16);

  context.strokeStyle = '#20cfff';
  context.lineWidth = 4;
  context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

  context.fillStyle = '#ffffff';
  context.font = 'bold 44px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(
    room.name || room.id,
    canvas.width / 2,
    canvas.height / 2
  );

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.position.set(room.x, 2.65, room.z);
  sprite.scale.set(2.2, 0.55, 1);
  sprite.renderOrder = 10;
  sprite.userData.nonInteractive = true;

  scene.add(sprite);
  return sprite;
}
