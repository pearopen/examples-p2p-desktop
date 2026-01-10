import Corestore from 'corestore'
import debounce from 'debounceify'
import crypto from 'hypercore-crypto'
import Hyperswarm from 'hyperswarm'
import Identity from 'keet-identity-key'
import ReadyResource from 'ready-resource'

import ChatRoomIdentity from './chat-room-identity'

export default class WorkerTask extends ReadyResource {
  constructor (rpc, storage, mnemonic, opts = {}) {
    super()

    /** @type {InstanceType<typeof import('../spec/hrpc').default>} */
    this.rpc = rpc
    this.storage = storage
    this.mnemonic = mnemonic
    this.invite = opts.invite
    this.name = opts.name || `User ${Date.now()}`

    this.store = new Corestore(storage)
    this.swarm = new Hyperswarm()
    this.swarm.on('connection', (conn) => this.store.replicate(conn))

    this.room = new ChatRoomIdentity(this.store, this.swarm, this.invite)
    this.debounceMessages = debounce(() => this._messages())
    this.room.on('update', () => this.debounceMessages())

    this.identity = null
    this.deviceKeyPair = null
    this.deviceProof = null
  }

  async _open () {
    this.identity = await Identity.from({ mnemonic: this.mnemonic })
    this.deviceKeyPair = crypto.keyPair()
    this.deviceProof = await this.identity.bootstrap(this.deviceKeyPair.publicKey)

    await this.store.ready()
    await this.room.ready()

    this.rpc.onAddMessage(async (data) => {
      const proof = Identity.attestData(Buffer.from(data), this.deviceKeyPair, this.deviceProof)
      await this.room.addMessage(data, proof, { name: this.name, at: Date.now() })
    })
    await this.debounceMessages()
  }

  async _close () {
    await this.room.close()
    await this.swarm.destroy()
    await this.store.close()
  }

  async _messages () {
    const messages = await this.room.getMessages()
    messages.sort((a, b) => a.info.at - b.info.at)
    for (const msg of messages) {
      const res = Identity.verify(msg.proof, Buffer.from(msg.text), {
        expectedIdentity: this.identity.identityPublicKey
      })
      msg.info.verified = !!res
    }
    this.rpc.messages(messages)
  }
}
