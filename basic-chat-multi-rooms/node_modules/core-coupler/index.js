const safetyCatch = require('safety-catch')

module.exports = class CoreCoupler {
  constructor (target, wakeup) {
    this.target = target
    this.wakeup = wakeup
    this.coupled = new Set()

    this._onpeeraddBound = this._onpeeradd.bind(this)
    this.target.on('peer-add', this._onpeeraddBound)
  }

  add (core) {
    const added = this.coupled.size
    this.coupled.add(core)
    if (added !== this.coupled.size) this._couple(core)
  }

  remove (core) {
    this.coupled.delete(core)
  }

  destroy () {
    this.target.off('peer-add', this._onpeeraddBound)
  }

  async update (stream) {
    const muxer = stream.userData
    if (!muxer) return

    try {
      if (!(await this._hasMuxer(this.target, muxer))) return

      let wakeup = null

      for (const core of this.coupled) {
        if (await this._hasMuxer(core, muxer)) continue
        if (wakeup === null) wakeup = []
        wakeup.push(core)
      }

      if (wakeup !== null) {
        this.wakeup(stream, wakeup)
      }
    } catch (err) {
      safetyCatch(err)
    }
  }

  async _couple (core) {
    try {
      let wakeup = null

      for (const peer of this.target.peers) {
        if (await this._hasPeer(core, peer)) continue
        if (wakeup === null) wakeup = []
        wakeup.push(peer)
      }

      if (wakeup !== null && this.coupled.has(core)) {
        for (const peer of wakeup) this.wakeup(peer.stream, [core])
      }
    } catch (err) {
      safetyCatch(err)
    }
  }

  async _onpeeradd (peer) {
    try {
      let wakeup = null

      for (const core of this.coupled) {
        if (await this._hasPeer(core, peer)) continue
        if (wakeup === null) wakeup = []
        wakeup.push(core)
      }

      if (wakeup !== null) {
        this.wakeup(peer.stream, wakeup)
      }
    } catch (err) {
      safetyCatch(err)
    }
  }

  _hasMuxer (core, muxer) {
    const ch = muxer.getLastChannel({ protocol: 'hypercore', id: core.discoveryKey })
    if (ch) return ch.fullyOpened()

    const cha = muxer.getLastChannel({ protocol: 'hypercore/alpha', id: core.discoveryKey })
    if (cha) return cha.fullyOpened()

    return Promise.resolve(false)
  }

  _hasPeer (core, peer) {
    return this._hasMuxer(core, peer.protomux)
  }
}
