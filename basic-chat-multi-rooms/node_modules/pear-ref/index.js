'use strict'
const EventEmitter = require('events')

class Ref extends EventEmitter {
  refs = 0 // read-only

  constructor () {
    if (!global.Pear) throw new Error('pear-ref is designed for use with Pear')
    const REF = global.Pear?.[global.Pear?.constructor.REF]
    if (REF) return REF // all apps use the same ref counter
    super()
  }

  ref () {
    this.refs++
    this.emit('ref', this.refs)
  }

  async track (promise) {
    this.ref()
    try {
      return await promise
    } finally {
      this.unref()
    }
  }

  unref () {
    this.refs--
    this.emit('unref', this.refs)
  }
}

module.exports = new Ref()
