'use strict'
const ref = require('pear-ref')
function message (msg) {
  const ipc = global.Pear?.[global.Pear?.constructor.IPC]
  if (!ipc) throw new Error('pear-message is designed for Pear - IPC missing')
  return ref.track(ipc.message(msg))
}
module.exports = message
