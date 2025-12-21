'use strict'
const CHECKOUT = global.Pear?.constructor.RTI.checkout

if (!CHECKOUT) {
  throw new Error('pear-rti: missing bootstrap runtime information. Pear.constructor.RTI.checkout must be set.')
}

let mount = global.Pear?.constructor.RTI.mount ? toURL(global.Pear?.constructor.RTI.mount + '/', 'file:') : null
if (!mount) {
  let url = require.main?.url
  if (url?.href.endsWith('/boot.bundle')) url.href += '/'
  else url = new URL('.', url)
  if (url && url.protocol === 'pear:') url = toURL(global.Pear.config.swapDir + '/', 'file:')
  mount = url
}

exports.CHECKOUT = CHECKOUT
exports.MOUNT = mount

function toURL (s) {
  if (s[1] === ':' && s[0] !== '/') return new URL('file:' + s)
  if (s.startsWith('file:')) return new URL(s)
  return new URL(s, 'file:')
}
