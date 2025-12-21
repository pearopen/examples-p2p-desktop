'use strict'
const messages = require('pear-messages')
module.exports = function updates (pattern, listener) {
  const ipc = global.Pear?.[global.Pear?.constructor.IPC]
  if (typeof pattern === 'function') {
    const opts = listener ?? {}
    listener = pattern
    pattern = opts
  }
  if (!ipc) throw new Error('pear-updates is designed for Pear - IPC missing')
  return messages({ ...pattern, type: 'pear/updates' }, listener)
}
