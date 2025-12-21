const b4a = require('b4a')
const blake2b = require('blake2b')
module.exports = function pipeId(s) {
  const buf = b4a.allocUnsafe(32)
  blake2b(buf.length).update(b4a.from(s)).final(buf)
  return b4a.toString(buf, 'hex')
}
