// data/story-enemies.js
// База шаблонов врагов для генератора историй

export const STORY_ENEMIES = [
  {
    id: 'enemy_mook_1',
    name: 'Уличный бандит',
    threat: 'Mook',
    quantity: '2d6',
    description: 'Обычные гангстеры с дешёвым оружием и кожаными жилетами.',
    tags: ['уличный', 'лёгкий']
  },
  {
    id: 'enemy_mook_2',
    name: 'Охранник корпорации',
    threat: 'Mook',
    quantity: '1d6+2',
    description: 'Обученные охранники в лёгком арморджеке, вооружены ПП или штурмовыми винтовками.',
    tags: ['корпоративный', 'средний']
  },
  {
    id: 'enemy_lieut_1',
    name: 'Лидер банды',
    threat: 'Lieutenant',
    quantity: '1',
    description: 'Опытный боец с кибероружием и усиленными рефлексами.',
    tags: ['уличный', 'сложный']
  },
  {
    id: 'enemy_lieut_2',
    name: 'Соло-наёмник',
    threat: 'Lieutenant',
    quantity: '1d3',
    description: 'Профессиональные убийцы с лучшим снаряжением и имплантами.',
    tags: ['наёмник', 'сложный']
  },
  {
    id: 'enemy_boss_1',
    name: 'Киберпсих',
    threat: 'Mini-Boss',
    quantity: '1',
    description: 'Опасный киберпсих с несколькими имплантами и боевым безумием.',
    tags: ['хоррор', 'опасный']
  },
  {
    id: 'enemy_boss_2',
    name: 'Корпоративный убийца',
    threat: 'Mini-Boss',
    quantity: '1',
    description: 'Элитный боец корпорации, готовый на всё ради выполнения задачи.',
    tags: ['корпоративный', 'опасный']
  },
  {
    id: 'enemy_vehicle_1',
    name: 'Автоматическая турель',
    threat: 'Mook',
    quantity: '1d4',
    description: 'Стационарная турель с автоматическим огнём. Неподвижна, но очень точна.',
    tags: ['техно', 'оборона']
  },
  {
    id: 'enemy_vehicle_2',
    name: 'Дрон-наблюдатель',
    threat: 'Mook',
    quantity: '1d6',
    description: 'Небольшие летающие дроны с камерами, могут вызывать подкрепление.',
    tags: ['техно', 'разведка']
  },
  {
    id: 'enemy_trap_1',
    name: 'Лазерная ловушка',
    threat: '—',
    quantity: '—',
    description: 'Смертельная лазерная сетка, наносящая серьёзный урон при касании.',
    tags: ['ловушка', 'оборона']
  }
];