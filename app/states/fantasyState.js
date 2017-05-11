import { GamePlayers, socket } from '../sockets'
import Easystar from 'easystarjs'
import throttle from 'lodash.throttle'
import Enemy from '../constructor/Enemy'
import Loot from '../constructor/Loot'
import loadMaps from './utils/loadMaps'
import buildMaps from './utils/buildMaps'
import createCursors from './utils/createCursors'
import createPlayer from './utils/createPlayer'
import createProjectile from './utils/createProjectile'
import playerMovement from './utils/playerMovement'
import playerAttack from './utils/playerAttack'
import mapTransition from './utils/mapTransition'
import playerClass from '../constructor/Player'

let map
  , cursors
  , playerObject
  , player
  , projectile
  , graveyard = []
  , enemyCounter = 0
  , lootCounter = 0
  , lootTouched = 0

const localState = {
  players: [],
  enemies: {},
  loot: []
}

const fantasyState = {
  init(character) {
    console.log(character)
    if (character) player = character
    // if (character) player = new playerClass(this.game,
    //                                         'player',
    //                                         {x: 200, y: 200},
    //                                         character.class,
    //                                         character
    //                                        )
    console.log('player set:', player)
  },

  preload() {
    loadMaps.fantasy()
  },

  create() {
    this.physics.startSystem(Phaser.Physics.ARCADE)

    cursors = createCursors()
    map = buildMaps.fantasy()

    socket.emit('setupState', player, 'fantasyState')

    playerObject = createPlayer(player)
    localState.players.push(playerObject)
    projectile = createProjectile.bullet(playerObject)

    this.makeCollisionMap()
    this.spawnEnemy()
    this.spawnLoot()

    this.physics.setBoundsToWorld(true, true, true, true, false)

    StackQuest.game.input.onDown.add((pointer, mouseEvent) => playerAttack(pointer, mouseEvent, playerObject, projectile), this)
  },

  update() {
    graveyard.forEach(enemy => enemy.destroy())
    graveyard = []

    if (Math.random() * 1000 <= 20) this.spawnEnemy()

    // spawn loot
    if (Math.random() * 1000 <= 25) this.spawnLoot()

    playerMovement(playerObject, cursors)
    mapTransition(player, playerObject, 'spaceState')

    for (const enemyKey in localState.enemies) {
      this.enemyPathFinding(enemyKey)
    }

    // should abstract into different fn
    for (const itemKey in localState.loot) {
      let self = this
      const item = localState.loot[itemKey]
      this.physics.arcade.collide(playerObject, item, function(player, loot) {
        console.log('play obj ', playerObject)
        console.log('loot' + itemKey + ' touched', loot)
        // playerObject.
        // current loot count
        lootTouched++
        const lootCount = self.game.add.text(player.x, player.y + 20, 'Loot acquired ' + lootTouched, { font: '22px Times New Roman', fill: '#ffffff' })
        setTimeout(lootCount.destory, 3000)
        loot.destroy()
      })
    }
    // get this guy out, need to detect collsion better
    this.physics.arcade.collide(playerObject, localState.loot[0], function(player, loot) {
      console.log('play obj ', playerObject)
      console.log('loot', loot)
      // playerObject.


      loot.destroy()
    })
  },

  render() {
    this.game.debug.cameraInfo(this.camera, 32, 32)
  },

  enemyPathFinding(enemyKey) {
    const enemy = localState.enemies[enemyKey]
    StackQuest.game.physics.arcade.overlap(projectile.bullets, enemy, () => {
      // console.log('enemy in fantasy state is:', enemy)
      //make sure projectile stops AS SOON AS it hits target
      let didDie = enemy.takeDamage(projectile.damage)
      if (didDie) {
        graveyard.push(enemy)
        delete localState.enemies[enemyKey]
      }
    })
    StackQuest.game.physics.arcade.overlap(enemy, playerObject, () => {
      playerObject.internalStats.hp -= enemy.attack()
      if (playerObject.internalStats.hp <= 0) {
        playerObject.position.x = 200
        playerObject.position.y = 200
        //  reset internal health: TEMP
        playerObject.internalStats.hp = 100
      }
    })
    const closestPlayer = enemy.findClosestPlayer(localState)
    this.easystar.findPath(Math.floor(enemy.position.x / map.width), Math.floor(enemy.position.y / map.height), Math.floor(closestPlayer.position.x / map.width), Math.floor(closestPlayer.position.y / map.height), (path) => enemy.move(path, this))
    this.easystar.calculate()
  },

  makeCollisionMap() {
    const collisionArray = []
    for (let rowIdx = 0; rowIdx < map.height; rowIdx++) {
      const rowArray = []
      for (let colIdx = 0; colIdx < map.width; colIdx++) {
        let collision = false
        for (const layer of map.layers) {
          if (layer.data[rowIdx][colIdx].collides) {
            collision = true
            break
          }
        }
        rowArray.push(Number(collision))
      }
      collisionArray.push(rowArray)
    }
    this.easystar = new Easystar.js()
    this.easystar.setGrid(collisionArray)
    this.easystar.setAcceptableTiles([0])
    this.easystar.enableDiagonals()
  },

  getPointFromGrid(rowIdx, colIdx) {
    const y = (rowIdx * map.height) + (map.height / 2)
    const x = (colIdx * map.width) + (map.width / 2)
    return new Phaser.Point(x, y)
  },

  spawnEnemy() {
    localState.enemies[enemyCounter++] = new Enemy(this.game, 'Soldier', { x: Math.random() * 1920, y: Math.random() * 1920 }, `${Math.random() > 0.5 ? 'soldier' : 'soldieralt'}`)
  },
  spawnLoot() {
    localState.loot[lootCounter++] = new Loot(this.game, 'Item', { x: Math.random() * 1920, y: Math.random() * 1080 }, 'item')
  }
}

export default fantasyState
