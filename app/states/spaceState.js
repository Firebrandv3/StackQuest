import { GamePlayers, socket } from '../sockets'
import loadMaps from './utils/loadMaps'
import buildMaps from './utils/buildMaps'
import playerMovement from './utils/playerMovement'
import mapTransition from './utils/mapTransition'

let map
  , cursors
  , playerObject
  , player

export const spaceState = {
  init(character) {
    if (character) player = character
  },

  preload() {
    loadMaps.space()
  },

  create() {
    this.physics.startSystem(Phaser.Physics.P2JS)

    buildMaps.space()

    socket.emit('setupState', player, 'spaceState')

    playerObject = StackQuest.game.add.text(player.x, player.y, player.class, { font: '32px Arial', fill: '#ffffff' })

    this.physics.p2.enable(playerObject)

    this.camera.follow(playerObject)

    this.physics.p2.setBoundsToWorld(true, true, true, true, false)

    cursors = this.input.keyboard.createCursorKeys()
  },

  update() {
    playerMovement(playerObject, cursors)
    mapTransition(player, playerObject, 'fantasyState')
  },

  render() {
    this.game.debug.cameraInfo(this.camera, 32, 32)
  }
}

export default spaceState
