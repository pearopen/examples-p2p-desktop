import Autobase from 'autobase'
import b4a from 'b4a'
import BlindPairing from 'blind-pairing'
import HyperDB from 'hyperdb'
import ReadyResource from 'ready-resource'
import z32 from 'z32'

import * as BasicChatDispatch from '../spec/dispatch'
import BasicChatDb from '../spec/db'

export default class ChatRoom extends ReadyResource {
  constructor (store, swarm, invite) {
    super()

    this.store = store
    this.swarm = swarm
    this.invite = invite

    this.pairing = new BlindPairing(swarm)

    /** @type {{ add: function(string, function(any, { view: HyperDB, base: Autobase })) }} */
    this.router = new BasicChatDispatch.Router()
    this._setupRouter()

    this.localBase = null
    this.localKey = null

    this.base = null
    this.pairMember = null
  }

  async _open () {
    await this.store.ready()

    const isEmpty = await this.isEmptyBase()
    let key
    let encryptionKey
    if (isEmpty && this.invite) {
      const res = await new Promise((resolve) => {
        this.pairing.addCandidate({
          invite: z32.decode(this.invite),
          userData: this.localKey,
          onadd: resolve
        })
      })
      key = res.key
      encryptionKey = res.encryptionKey
    }

    // if base is not initialized, key and encryptionKey must be provided
    // if base is already initialized in this store namespace, key and encryptionKey can be omitted
    this.base = new Autobase(this.store, key, {
      encrypt: true,
      encryptionKey,
      open: this._openBase.bind(this),
      close: this._closeBase.bind(this),
      apply: this._applyBase.bind(this)
    })

    const writablePromise = new Promise((resolve) => {
      this.base.on('update', () => {
        if (this.base.writable) resolve()
        if (!this.base._interrupting) this.emit('update')
      })
    })
    await this.base.ready()
    this.swarm.join(this.base.discoveryKey)
    if (!this.base.writable) await writablePromise

    this.view.core.download({ start: 0, end: -1 })

    this.pairMember = this.pairing.addMember({
      discoveryKey: this.base.discoveryKey,
      /** @type {function(import('blind-pairing-core').MemberRequest)} */
      onadd: async (request) => {
        const inv = await this.view.findOne('@basic-chat/invites', {})
        if (inv === null || !b4a.equals(inv.id, request.inviteId)) {
          return
        }
        request.open(inv.publicKey)
        await this.addWriter(request.userData)
        request.confirm({
          key: this.base.key,
          encryptionKey: this.base.encryptionKey
        })
      }
    })
  }

  async _close () {
    await this.pairMember?.close()
    await this.localBase?.close()
    await this.base?.close()
    await this.pairing.close()
  }

  _openBase (store) {
    return HyperDB.bee(store.get('view'), BasicChatDb, { extension: false, autoUpdate: true })
  }

  async _closeBase (view) {
    await view.close()
  }

  async _applyBase (nodes, view, base) {
    for (const node of nodes) {
      await this.router.dispatch(node.value, { view, base })
    }
    await view.flush()
  }

  _setupRouter () {
    this.router.add('@basic-chat/add-writer', async (data, context) => {
      await context.base.addWriter(data.key)
    })
    this.router.add('@basic-chat/add-invite', async (data, context) => {
      await context.view.insert('@basic-chat/invites', data)
    })
    this.router.add('@basic-chat/add-message', async (data, context) => {
      await context.view.insert('@basic-chat/messages', data)
    })
  }

  /** @type {HyperDB} */
  get view () {
    return this.base.view
  }

  async isEmptyBase () {
    const baseLocal = Autobase.getLocalCore(this.store)
    this.localBase = baseLocal
    await baseLocal.ready()
    this.localKey = baseLocal.key
    const isEmpty = baseLocal.length === 0
    await baseLocal.close()
    return isEmpty
  }

  async getInvite () {
    const existing = await this.view.findOne('@basic-chat/invites', {})
    if (existing) {
      return z32.encode(existing.invite)
    }
    const { id, invite, publicKey, expires } = BlindPairing.createInvite(this.base.key)
    const record = { id, invite, publicKey, expires }
    await this.base.append(
      BasicChatDispatch.encode('@basic-chat/add-invite', record)
    )
    return z32.encode(record.invite)
  }

  async addWriter (key) {
    await this.base.append(
      BasicChatDispatch.encode('@basic-chat/add-writer', { key: b4a.isBuffer(key) ? key : b4a.from(key) })
    )
  }

  async getMessages ({ reverse = true, limit = 100 } = {}) {
    return await this.view.find('@basic-chat/messages', { reverse, limit }).toArray()
  }

  async addMessage (text, info) {
    const id = Math.random().toString(16).slice(2)
    await this.base.append(
      BasicChatDispatch.encode('@basic-chat/add-message', { id, text, info })
    )
  }
}
