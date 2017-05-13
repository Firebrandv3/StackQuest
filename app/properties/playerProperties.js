const playerProperties = {
  wizard: {
    stats: {
      maxHp: 100,
      attack: 8,
      defense: 10,
    },
    frames: {
      walk_up: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      walk_left: [9, 10, 11, 12, 13, 14, 15, 16, 17],
      walk_down: [18, 19, 20, 21, 22, 23, 24, 25, 26],
      walk_right: [27, 28, 29, 30, 31, 32, 33, 34, 35]
    },
    weaponKey: 'fireball',
    armorKey: 'basicArmor',
    homeState: 'fantasyState'
  },

  cyborg: {
    stats: {
      maxHp: 100,
      attack: 10,
      defense: 8,
    },
    frames: {
      walk_up: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      walk_left: [9, 10, 11, 12, 13, 14, 15, 16, 17],
      walk_down: [18, 19, 20, 21, 22, 23, 24, 25, 26],
      walk_right: [27, 28, 29, 30, 31, 32, 33, 34, 35]
    },
    weaponKey: 'missle',
    armorKey: 'basicArmor',
    homeState: 'fantasyState'
  },
}

export default playerProperties
