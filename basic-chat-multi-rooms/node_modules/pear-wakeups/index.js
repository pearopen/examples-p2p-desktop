'use strict'
const messages = require('pear-messages')
module.exports = function wakeups (listener) {
  const ipc = global.Pear?.[global.Pear?.constructor.IPC]
  if (!ipc) throw new Error('pear-wakeups is designed for Pear - IPC missing')
  return messages({ type: 'pear/wakeup' }, listener)
}
