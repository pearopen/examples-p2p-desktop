const b4a = require('b4a')
const sodium = require('sodium-native')
module.exports = function pipeId(s) {
  const buf = b4a.allocUnsafe(32)
  sodium.crypto_generichash(buf, b4a.from(s))
  return b4a.toString(buf, 'hex')
}
