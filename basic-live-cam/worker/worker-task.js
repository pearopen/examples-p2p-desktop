import Corestore from 'corestore'
import debounce from 'debounceify'
import Hyperswarm from 'hyperswarm'
import ReadyResource from 'ready-resource'

import LiveCamRoom from './live-cam-room'

export default class Worker extends ReadyResource {
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

    this.room = new LiveCamRoom(this.store, this.swarm, this.invite)
    this.debounceVideos = debounce(() => this._videos())
    this.debounceMessages = debounce(() => this._messages())
    this.room.on('update', async () => {
      await this.debounceVideos()
      await this.debounceMessages()
    })
  }

  async _open () {
    await this.store.ready()
    await this.room.ready()

    this.rpc.onAddMessage(async (data) => {
      await this.room.addMessage(data, { name: this.name, at: Date.now() })
    })
    await this.debounceVideos()
    await this.debounceMessages()
  }

  async _close () {
    await this.room.close()
    await this.swarm.destroy()
    await this.store.close()
  }

  async _videos () {
    const videos = await this.room.getVideos()
    this.rpc.videos(videos)
  }

  async _messages () {
    const messages = await this.room.getMessages()
    messages.sort((a, b) => a.info.at - b.info.at)
    this.rpc.messages(messages)
  }
}
