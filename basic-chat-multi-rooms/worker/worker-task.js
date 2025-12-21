import Corestore from 'corestore'
import debounce from 'debounceify'
import Hyperswarm from 'hyperswarm'
import ReadyResource from 'ready-resource'

import ChatAccount from './chat-account'

export default class WorkerTask extends ReadyResource {
  constructor (rpc, storage, opts = {}) {
    super()

    /** @type {InstanceType<typeof import('../spec/hrpc').default>} */
    this.rpc = rpc
    this.storage = storage
    this.invite = opts.invite
    this.name = opts.name || `User ${Date.now()}`

    this.store = new Corestore(storage)
    this.swarm = new Hyperswarm()
    this.swarm.on('connection', (conn) => this.store.replicate(conn))

    this.account = new ChatAccount(this.store, this.swarm, this.invite)
    this.debounceRooms = debounce(() => this._rooms())
    this.account.on('update', () => this.debounceRooms())
    this.account.on('messages', (roomId, messages) => this.rpc.messages({ messages, roomId }))
  }

  async _open () {
    await this.store.ready()
    await this.account.ready()

    this.rpc.onAddRoom(async (data) => {
      await this.account.addRoom(data, { at: Date.now() })
    })
    this.rpc.onJoinRoom(async (data) => {
      await this.account.joinRoom(data)
    })
    this.rpc.onAddMessage(async (data) => {
      await this.account.addMessage(data.roomId, data.text, { name: this.name, at: Date.now() })
    })
    await this.debounceRooms()
  }

  async _close () {
    await this.account.close()
    await this.swarm.destroy()
    await this.store.close()
  }

  async _rooms () {
    const rooms = Object.entries(this.account.rooms).map(([id, room]) => ({
      id,
      name: room.name,
      info: room.info
    }))
    rooms.sort((a, b) => a.info.at - b.info.at)
    this.rpc.rooms(rooms)
  }
}
