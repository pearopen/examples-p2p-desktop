let builtinModules = null

exports.compile = require('./lib/compile')

exports.map = defaultMap

exports.mapImport = defaultMapImport

exports.mapPath = defaultMapPath

exports.type = 'commonjs'

exports.symbol = 'scriptlinker'

exports.protocol = 'app'

exports.linkSourceMaps = true

exports.cacheSize = 512

exports.builtins = {
  has (req) {
    try {
      if (builtinModules === null) builtinModules = require('module').builtinModules || []
    } catch {
      builtinModules = []
    }
    return builtinModules.includes(req)
  },
  get (req) {
    // in case someone injects a different builtin require (ie boot-drive), support that
    return (require.builtinRequire || require)(req)
  },
  keys () {
    try {
      if (builtinModules === null) builtinModules = require('module').builtinModules || []
    } catch {
      builtinModules = []
    }
    return builtinModules
  }
}

function defaultMap (id, { protocol, isImport, isBuiltin, isSourceMap, isConsole }) {
  const type = isConsole ? protocol : (isSourceMap ? 'map' : isImport ? 'esm' : 'cjs')
  return protocol + '://' + type + (isBuiltin ? '/~' : '') + encodeURI(id)
}

function defaultMapImport (link, dirname) {
  return link
}

function defaultMapPath (path) {
  return path
}
