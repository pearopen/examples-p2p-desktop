import BlindPeering from 'blind-peering'
import Corestore from 'corestore'
import debounce from 'debounceify'
import Hyperswarm from 'hyperswarm'
import ReadyResource from 'ready-resource'

import ChatRoom from './chat-room'

export default class WorkerTask extends ReadyResource {
  constructor (rpc, storage, opts = {}) {
    super()

    /** @type {InstanceType<typeof import('../spec/hrpc').default>} */
    this.rpc = rpc
    this.storage = storage
    this.blindPeerKeys = opts.blindPeerKey || []
    this.invite = opts.invite
    this.name = opts.name || `User ${Date.now()}`

    this.store = new Corestore(storage)
    this.swarm = new Hyperswarm()
    this.swarm.on('connection', (conn) => this.store.replicate(conn))

    this.blindPeering = new BlindPeering(this.swarm, this.store.namespace('blind-peering'), {
      mirrors: this.blindPeerKeys
    })

    this.room = new ChatRoom(this.store, this.swarm, this.invite)
    this.debounceMessages = debounce(() => this._messages())
    this.room.on('update', () => this.debounceMessages())
  }

  async _open () {
    await this.store.ready()
    await this.room.ready()

    await this.blindPeering.addAutobase(this.room.base)

    this.rpc.onAddMessage(async (data) => {
      await this.room.addMessage(data, { name: this.name, at: Date.now() })
    })
    await this.debounceMessages()
  }

  async _close () {
    await this.blindPeering.close()
    await this.room.close()
    await this.swarm.destroy()
    await this.store.close()
  }

  async _messages () {
    const messages = await this.room.getMessages()
    messages.sort((a, b) => a.info.at - b.info.at)
    this.rpc.messages(messages)
  }
}
