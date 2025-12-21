'use strict'
const path = require('path')
const { ERR_INVALID_LINK } = require('pear-errors')
const { ALIASES } = require('pear-aliases')
const hid = require('hypercore-id-encoding')
const FILE = 'file:'
const PEAR = 'pear:'
const DOUB = '//'

function decode(v, info = {}) {
  try {
    return hid.decode(v)
  } catch (err) {
    if (typeof v === 'string')
      throw ERR_INVALID_LINK('alias not found: "' + v + '"', { ...info, err })
    throw err
  }
}

class PearLink {
  normalize(link) {
    // if link has link format, separator is always '/' even in Windows
    if (link.startsWith(FILE + DOUB))
      return link.endsWith('/') ? link.slice(0, -1) : link
    else return link.endsWith(path.sep) ? link.slice(0, -1) : link
  }

  serialize(o) {
    o = hid.isValid(o) ? { drive: { key: o } } : o
    let { protocol, pathname = '', search = '', hash = '', drive } = o
    if (protocol === FILE) return `${protocol}//${pathname}${search}${hash}`
    if (!protocol && drive) protocol = PEAR
    if (protocol === PEAR) {
      const key = drive.alias || hid.normalize(drive.key)
      const base = [
        drive.fork,
        drive.length,
        key,
        drive.hash && hid.encode(drive.hash)
      ]
        .filter((p) => (p ?? '') + '')
        .join('.')
      return `${protocol}//${base}${pathname}${search}${hash}`
    }
    throw ERR_INVALID_LINK('Unsupported protocol', {
      protocol,
      pathname,
      search,
      hash,
      drive
    })
  }

  parse(link) {
    if (!link) throw ERR_INVALID_LINK('No link specified', { link })
    const isPath =
      link.startsWith(PEAR + DOUB) === false &&
      link.startsWith(FILE + DOUB) === false
    const isRelativePath = isPath && link[0] !== '/' && link[1] !== ':'
    const keys = Object.fromEntries(
      Object.entries(ALIASES).map(([k, v]) => [hid.encode(v), k])
    )
    const { protocol, pathname, hostname, search, hash } = isRelativePath
      ? new URL(link, FILE + DOUB + path.resolve('.') + '/')
      : new URL(isPath ? FILE + DOUB + link : link)
    const info = { link, protocol, hostname, pathname, search, hash }
    if (protocol === FILE) {
      // file:///some/path/to/a/file.js
      const startsWithRoot = hostname === ''
      if (!pathname) throw ERR_INVALID_LINK('Path is missing', info)
      if (!startsWithRoot)
        throw ERR_INVALID_LINK('Path needs to start from the root, "/"', info)
      return {
        protocol,
        pathname,
        search,
        hash,
        origin: this.normalize(`${protocol}//${hostname}${pathname}`),
        drive: {
          key: null,
          length: null,
          fork: null,
          hash: null
        }
      }
    } else if (protocol === PEAR) {
      const [fork, length, keyOrAlias, apphash] = hostname.split('.')
      const parts = hostname.split('.').length

      if (parts === 1) {
        // pear://keyOrAlias[/some/path]
        const key = ALIASES[hostname] || decode(hostname, info)
        const origin = keys[hid.encode(key)]
          ? `${protocol}//${keys[hid.encode(key)]}`
          : `${protocol}//${hostname}`
        const alias = ALIASES[hostname] ? hostname : null
        return {
          protocol,
          pathname,
          search,
          hash,
          origin,
          drive: {
            key,
            length: null,
            fork: null,
            hash: null,
            alias
          }
        }
      }

      if (parts === 2) {
        // pear://fork.length[/some/path]
        throw ERR_INVALID_LINK('Incorrect hostname', info)
      }

      const alias = ALIASES[keyOrAlias] ? keyOrAlias : null
      const key = ALIASES[keyOrAlias] || decode(keyOrAlias, info)
      const origin = keys[hid.encode(key)]
        ? `${protocol}//${keys[hid.encode(key)]}`
        : `${protocol}//${keyOrAlias}`

      if (parts === 3) {
        // pear://fork.length.keyOrAlias[/some/path]
        if (!Number.isInteger(+fork) || !Number.isInteger(+length))
          throw ERR_INVALID_LINK('Incorrect hostname', info)
        return {
          protocol,
          pathname,
          search,
          hash,
          origin,
          drive: {
            key,
            length: Number(length),
            fork: Number(fork),
            hash: null,
            alias
          }
        }
      }

      if (parts === 4) {
        // pear://fork.length.keyOrAlias.dhash[/some/path]
        if (!Number.isInteger(+fork) || !Number.isInteger(+length))
          throw ERR_INVALID_LINK('Incorrect hostname', info)

        return {
          protocol,
          pathname,
          search,
          hash,
          origin,
          drive: {
            key,
            length: Number(length),
            fork: Number(fork),
            hash: hid.decode(apphash),
            alias
          }
        }
      }

      throw ERR_INVALID_LINK('Incorrect hostname', info)
    }

    throw ERR_INVALID_LINK('Protocol is not supported', info)
  }
}

module.exports = new PearLink()
