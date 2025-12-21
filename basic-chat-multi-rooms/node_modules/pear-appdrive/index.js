'use strict'
const ReadyResource = require('ready-resource')
const ref = require('pear-ref')

module.exports = class AppDrive extends ReadyResource {
  #ipc = global.Pear?.[global.Pear?.constructor.IPC]
  constructor () {
    super()
    if (!this.#ipc) throw new Error('pear-appdrive is designed for Pear - IPC missing')
  }

  _open () {
    ref.ref()
  }

  _close () {
    ref.unref()
  }

  batch () { return this }

  checkout () { return this }

  get = (key, opts = {}) => ref.track(this.#ipc.get({ key, ...opts }))

  exists = (key) => ref.track(this.#ipc.exists({ key }))

  entry = (key) => ref.track(this.#ipc.entry({ key }))

  compare = (keyA, keyB) => ref.track(this.#ipc.compare({ keyA, keyB }))

  list = (key, opts = {}) => ref.track(this.#ipc.list({ key, ...opts }))

  put () { throw Error('not implemented') }

  del () { throw Error('not implemented') }

  symlink () { throw Error('not implemented') }

  readdir () { throw Error('not implemented') }

  mirror () { throw Error('not implemented') }

  createReadStream () { throw Error('not implemented') }

  createWriteStream () { throw Error('not implemented') }
}
