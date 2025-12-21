'use strict'
const ref = require('pear-ref')
function messages(pattern, listener) {
  const ipc = global.Pear?.[global.Pear?.constructor.IPC]
  if (!ipc) throw new Error('pear-messages is designed for Pear - IPC missing')
  if (typeof pattern === 'function') {
    listener = pattern
    pattern = {}
  }
  ref.ref()
  const subscriber = ipc.messages(pattern)
  subscriber.on('close', () => ref.unref())
  global.Pear.teardown(() => { subscriber.end() })
  if (typeof listener === 'function') subscriber.on('data', listener)
  return subscriber
}
module.exports = messages
