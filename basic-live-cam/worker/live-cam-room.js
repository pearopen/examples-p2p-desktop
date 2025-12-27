import Autobase from 'autobase'
import b4a from 'b4a'
import ffmpeg from 'bare-ffmpeg'
import BlindPairing from 'blind-pairing'
import { spawn } from 'child_process'
import Hyperblobs from 'hyperblobs'
import BlobServer from 'hypercore-blob-server'
import idEnc from 'hypercore-id-encoding'
import HyperDB from 'hyperdb'
import ReadyResource from 'ready-resource'
import z32 from 'z32'

import * as LiveCamDispatch from '../spec/dispatch'
import LiveCamDb from '../spec/db'

export default class LiveCamRoom extends ReadyResource {
  constructor (store, swarm, invite) {
    super()

    this.store = store
    this.swarm = swarm
    this.invite = invite

    this.pairing = new BlindPairing(swarm)

    /** @type {{ add: function(string, function(any, { view: HyperDB, base: Autobase })) }} */
    this.router = new LiveCamDispatch.Router()
    this._setupRouter()

    this.localBase = Autobase.getLocalCore(this.store)
    this.base = null
    this.pairMember = null

    this.blobs = new Hyperblobs(this.store.get({ name: 'blobs' }))
    this.blobServer = new BlobServer(this.store.session())
    this.blobsCores = {}

    this.ffmpeg = null
    this.fragIdx = 0
  }

  async _open () {
    await this.localBase.ready()
    const localKey = this.localBase.key
    const isEmpty = this.localBase.length === 0

    let key
    let encryptionKey
    if (isEmpty && this.invite) {
      const res = await new Promise((resolve) => {
        this.pairing.addCandidate({
          invite: z32.decode(this.invite),
          userData: localKey,
          onadd: resolve
        })
      })
      key = res.key
      encryptionKey = res.encryptionKey
    }

    // if base is not initialized, key and encryptionKey must be provided
    // if base is already initialized in this store namespace, key and encryptionKey can be omitted
    await this.localBase.close()
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
        const inv = await this.view.findOne('@basic-live-cam/invites', { id: request.inviteId })
        if (!inv) return
        request.open(inv.publicKey)
        await this.addWriter(request.userData)
        request.confirm({
          key: this.base.key,
          encryptionKey: this.base.encryptionKey
        })
      }
    })

    await this.blobs.ready()
    await this.blobServer.listen()

    if (!this.invite) this._startLiveCam()
  }

  async _close () {
    this.ffmpeg?.kill('SIGKILL')
    await this.blobServer.close()
    await this.blobs.close()
    await this.pairMember?.close()
    await this.base?.close()
    await this.localBase.close()
    await this.pairing.close()
  }

  _openBase (store) {
    return HyperDB.bee(store.get('view'), LiveCamDb, { extension: false, autoUpdate: true })
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
    this.router.add('@basic-live-cam/add-writer', async (data, context) => {
      await context.base.addWriter(data.key)
    })
    this.router.add('@basic-live-cam/add-invite', async (data, context) => {
      await context.view.insert('@basic-live-cam/invites', data)
    })
    this.router.add('@basic-live-cam/add-video', async (data, context) => {
      await context.view.insert('@basic-live-cam/videos', data)
    })
    this.router.add('@basic-live-cam/add-message', async (data, context) => {
      await context.view.insert('@basic-live-cam/messages', data)
    })
  }

  /** @type {HyperDB} */
  get view () {
    return this.base.view
  }

  async getInvite () {
    const existing = await this.view.findOne('@basic-live-cam/invites', {})
    if (existing) {
      return z32.encode(existing.invite)
    }
    const { id, invite, publicKey, expires } = BlindPairing.createInvite(this.base.key)
    await this.base.append(
      LiveCamDispatch.encode('@basic-live-cam/add-invite', { id, invite, publicKey, expires })
    )
    return z32.encode(invite)
  }

  async addWriter (key) {
    await this.base.append(
      LiveCamDispatch.encode('@basic-live-cam/add-writer', { key: b4a.isBuffer(key) ? key : b4a.from(key) })
    )
  }

  async getVideos ({ limit = 100 } = {}) {
    const videos = await this.view.find('@basic-live-cam/videos', { limit }).toArray()
    for (const item of videos) {
      if (!this.blobsCores[item.blob.key]) {
        const blobsCore = this.store.get({ key: idEnc.decode(item.blob.key) })
        this.blobsCores[item.blob.key] = blobsCore
        await blobsCore.ready()
        this.swarm.join(blobsCore.discoveryKey)
      }
    }
    return videos.map(item => {
      const link = this.blobServer.getLink(item.blob.key, { blob: item.blob })
      return { ...item, info: { ...item.info, link } }
    }).sort((a, b) => a.info.fragIdx - b.info.fragIdx)
  }

  async getMessages ({ reverse = true, limit = 100 } = {}) {
    return await this.view.find('@basic-live-cam/messages', { reverse, limit }).toArray()
  }

  async addMessage (text, info) {
    const id = Math.random().toString(16).slice(2)
    await this.base.append(
      LiveCamDispatch.encode('@basic-live-cam/add-message', { id, text, info })
    )
  }

  async _startLiveCam () {
    const FF_INPUT = [
      '-f', 'avfoundation', // adjust based on your platform
      '-framerate', '30',
      '-i', '0'
    ]
    const FF_OUTPUT = [
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-tune', 'zerolatency',
      '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
      '-g', '60',
      '-f', 'mp4',
      'pipe:1'
    ]
    const FF_ARGS = [...FF_INPUT, ...FF_OUTPUT]

    let ffmpegProc, ffmpegStdout
    try {
      const res = await _runBareFFmpeg()
      ffmpegProc = res.ffmpegProc
      ffmpegStdout = res.ffmpegStdout
    } catch (err) {
      console.error('Failed to run with bare-ffmpeg, fallback to spawn ffmpeg', err)
      ffmpegProc = spawn('ffmpeg', FF_ARGS, { stdio: ['ignore', 'pipe', 'inherit'] })
      ffmpegStdout = ffmpegProc.stdout
      this.ffmpeg = ffmpegProc
    }

    let buffer = Buffer.alloc(0)
    ffmpegStdout.on('data', async (chunk) => {
      buffer = Buffer.concat([buffer, chunk])
      let idx
      while ((idx = buffer.indexOf('moof', 4)) !== -1) {
        if (idx !== 0) {
          const frag = buffer.subarray(0, idx)
          buffer = buffer.subarray(idx)
          await this._onNewFragment(frag)
        }
      }
    })
    ffmpegStdout.on('end', async () => {
      if (buffer.length) await this._onNewFragment(buffer)
    })
  }

  async _runBareFFmpeg () {
    throw new Error('TODO')
  }

  async _onNewFragment (frag) {
    const ws = this.blobs.createWriteStream()
    ws.write(frag)
    ws.end()
    await new Promise((resolve) => ws.on('close', resolve))

    const blob = { key: idEnc.normalize(this.blobs.core.key), ...ws.id }

    const id = Math.random().toString(16).slice(2)
    await this.base.append(
      LiveCamDispatch.encode('@basic-live-cam/add-video', { id, blob, info: { fragIdx: this.fragIdx } })
    )
    this.fragIdx += 1
  }
}
