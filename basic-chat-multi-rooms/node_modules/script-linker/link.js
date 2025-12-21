const unixresolve = require('unix-path-resolve')

exports.stringify = function stringify (o) {
  const p = o.protocol ? o.protocol + '://' + o.transform : ''
  if (!o.resolve && !o.dirname && !o.filename) return p
  if (o.resolve) return p + o.dirname + '/~' + o.resolve
  return p + o.filename
}

exports.parse = function parse (l) {
  const extra = l.lastIndexOf('?')

  let refresh = false
  if (extra > -1) {
    refresh = /[&?]refresh($|=)/.test(l.slice(extra))
    l = l.slice(0, extra)
  }

  l = decodeURI(l)

  let protocol = null
  let transform = null

  if (l.startsWith('~')) {
    return {
      protocol,
      transform,
      resolve: l.slice(1),
      dirname: '/',
      filename: null,
      refresh
    }
  }

  if (!l.startsWith('/')) {
    const i = l.indexOf(':')
    if (i === -1) throw new Error('Invalid identifier')
    protocol = l.slice(0, i)
    l = l.slice(i).replace(/^:\/?\/?/, '')
    const j = l.indexOf('/')
    if (j === -1) {
      transform = l
      return {
        protocol,
        transform,
        resolve: null,
        dirname: null,
        filename: null,
        refresh
      }
    }
    transform = l.slice(0, j)
    l = l.slice(j)
  }

  const i = l.indexOf('/~')

  if (i > -1) {
    return {
      protocol,
      transform,
      resolve: l.slice(i + 2),
      dirname: i === 0 ? '/' : unixresolve(l.slice(0, i)),
      filename: null,
      refresh
    }
  }

  return {
    protocol,
    transform,
    resolve: null,
    dirname: null,
    filename: unixresolve(l),
    refresh
  }
}
