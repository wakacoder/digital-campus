
const makeRoom = (
  id,
  x,
  z,
  doorSide,
  windowSide,
  width = 6,
  depth = 6
) => ({
  id: String(id),
  name: `Кабинет ${id}`,
  x,
  z,
  width,
  depth,
  teacher: 'Не назначен',
  group: '—',
  subject: 'Нет данных',
  status: 'Неизвестно',
  doorSide,
  windowSide,
  type: 'classroom',
});

const makeCorner = (id, x, z, size = 6) => ({
  id,
  name: '',
  x,
  z,
  width: size,
  depth: size,
  type: 'corner',
  teacher: '—',
  group: '—',
  subject: 'Угловая зона',
  status: 'Общая зона',
});

// Общая планировка: 20 кабинетов и 4 угловые зоны.
function createFloor(floorNumber) {
  const firstId = floorNumber * 100;

  const positions = [
    // Северная сторона
    [-15, -15, 'south', 'north'],
    [-9, -15, 'south', 'north'],
    [-3, -15, 'south', 'north'],
    [3, -15, 'south', 'north'],
    [9, -15, 'south', 'north'],
    [15, -15, 'south', 'north'],

    // Южная сторона
    [-15, 15, 'north', 'south'],
    [-9, 15, 'north', 'south'],
    [-3, 15, 'north', 'south'],
    [3, 15, 'north', 'south'],
    [9, 15, 'north', 'south'],
    [15, 15, 'north', 'south'],

    // Западная сторона
    [-21, -9, 'east', 'west'],
    [-21, -3, 'east', 'west'],
    [-21, 3, 'east', 'west'],
    [-21, 9, 'east', 'west'],

    // Восточная сторона
    [21, -9, 'west', 'east'],
    [21, -3, 'west', 'east'],
    [21, 3, 'west', 'east'],
    [21, 9, 'west', 'east'],
  ];

  const rooms = positions.map(([x, z, doorSide, windowSide], index) =>
    makeRoom(
      firstId + index,
      x,
      z,
      doorSide,
      windowSide
    )
  );

  rooms.push(
    makeCorner(`corner-${floorNumber}-nw`, -21, -15),
    makeCorner(`corner-${floorNumber}-ne`, 21, -15),
    makeCorner(`corner-${floorNumber}-sw`, -21, 15),
    makeCorner(`corner-${floorNumber}-se`, 21, 15)
  );

  return {
    id: floorNumber,
    name: `${floorNumber} этаж`,
    rooms,
  };
}

export const floor1 = createFloor(1);
export const floor2 = createFloor(2);
export const floor3 = createFloor(3);

export const floors = [floor1, floor2, floor3];
