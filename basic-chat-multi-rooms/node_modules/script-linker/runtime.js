const d = require('./defaults')
const unixresolve = require('unix-path-resolve')

module.exports = function runtime ({
  map = d.map,
  mapImport = d.mapImport,
  builtins = d.builtins,
  compile = d.compile,
  symbol = d.symbol,
  protocol = d.protocol,
  getSync,
  resolveSync
}) {
  const SLModule = defineModule()

  const sl = global[Symbol.for(symbol)] = {
    Module: SLModule,
    sources: new Map(),
    require: null,
    createImport (filename, doImport) {
      const dirname = filename === '/' ? '/' : unixresolve(filename, '..')
      return (req) => {
        req = mapImport(req, dirname)
        try {
          if (isCustomScheme(req)) return doImport(req)
          const r = resolveImport(dirname, req)
          return doImport(r)
        } catch {
          return Promise.reject(new Error(`Cannot find package '${req}' imported from ${filename}`))
        }
      }
    },
    createRequire (filename, parent = null, map = undefined) {
      if (!parent) {
        parent = new SLModule(filename, null)
        parent.filename = filename
      }

      require.resolve = resolve
      require.cache = SLModule._cache
      require.extensions = SLModule._extensions
      require.main = undefined

      return require

      function resolve (request) {
        return SLModule._resolveFilename(request, parent, false, { map })
      }

      function require (request, opts) {
        const resolved = !!(opts && opts.resolved)
        return parent.require(request, { resolved, map })
      }
    },
    requireFromSource (filename, source) {
      const parent = new SLModule(filename, null)
      return parent.require(filename, { source, resolved: true })
    },
    bootstrap (entrypoint, { type } = {}) {
      if (!entrypoint) throw new Error('Must pass entrypoint')
      if (!type) throw new Error('Must pass type')
      const loader = (type === 'commonjs')
        ? sl.createRequire(entrypoint)
        : sl.createImport(entrypoint, (p) => import(p))
      return loader(entrypoint)
    }
  }

  sl.require = sl.createRequire('/')

  return sl

  function resolveImport (dirname, req) {
    const isBuiltin = builtins.has(req)
    return map(isBuiltin ? req : resolveSync(req, dirname, { isImport: true }), {
      protocol,
      isImport: true,
      isBuiltin,
      isSourceMap: false,
      isConsole: false
    })
  }

  function getExtension (filename) {
    const i = filename.lastIndexOf('.')
    return i > -1 ? filename.slice(i) : filename
  }

  function defineModule () {
    function Module (id = '', parent) {
      this.id = id
      this.path = id === '/' ? id : unixresolve(id, '..')
      this.exports = {}
      this.filename = null
      this.loaded = false
      this.children = [] // TODO: not updated atm
      this.paths = []
      this.parent = parent
    }

    Module._cache = Object.create(null)
    Module._pathCache = Object.create(null) // only there in case someone inspects it
    Module.Module = Module
    Module.syncBuiltinESMExports = () => {} // noop for now
    Module.globalPaths = []
    Module.builtinModules = [...builtins.keys()]

    Module.createRequire = function (filename) {
      return sl.createRequire(unixresolve(pathname(filename)), null)
    }

    Module._resolveFilename = function (request, parent, isMain, opts) {
      if (request === 'module') return request // special case for this module
      if (opts && opts.resolved) return request

      try {
        if (opts && opts.map && Object.prototype.hasOwnProperty.call(opts.map, request)) {
          const r = opts.map[request]
          if (r) return r
        } else {
          return builtins.has(request) ? request : resolveSync(request, parent.path, { isImport: false })
        }
      } catch {}

      throw new Error(`Cannot find module '${request}' required from ${parent.id}`)
    }

    Module._load = function (request, parent, isMain, opts) {
      const filename = Module._resolveFilename(request, parent, isMain, opts)
      const cached = Module._cache[filename]
      if (cached) return cached.exports
      if (filename === 'module') return Module
      if (builtins.has(filename)) return builtins.get(filename)
      const mod = new Module(filename, parent)
      Module._cache[filename] = mod
      let threw = true
      try {
        mod.load(filename, opts)
        threw = false
      } finally {
        if (threw) {
          delete Module._cache[filename]
        }
      }
      return mod.exports
    }

    Module._extensions = {
      '.js': function (mod, filename, opts) {
        mod._compile(Module._getSource(filename, opts), filename)
      },
      '.json': function (mod, filename, opts) {
        mod.exports = JSON.parse(Module._getSource(filename, opts))
      }
    }

    Module._getSource = function (filename, opts) {
      if (typeof (opts && opts.source) === 'string') return opts.source
      if (sl.sources.has(filename)) return sl.sources.get(filename)

      return getSync(map(filename, {
        protocol,
        isImport: false,
        isBuiltin: false,
        isSourceMap: false,
        isConsole: false
      }))
    }

    Module.prototype._compile = function (source, filename) {
      let map = null

      if (source.startsWith('/* @scriptlinker-resolutions ')) {
        const e = source.indexOf('*/\n')
        if (e > -1) {
          map = JSON.parse(source.slice('/* @scriptlinker-resolutions '.length, e))
          source = source.slice(e + 3)
        }
      }

      compile(this, this.exports, this.path, filename, sl.createRequire(this.path, this, map), source)
    }

    Module.prototype.require = function (request, opts) {
      return Module._load(request, this, false, opts)
    }

    Module.prototype.load = function (filename, opts) {
      this.filename = filename
      const ext = Module._extensions[getExtension(filename)] || Module._extensions['.js']
      ext(this, filename, opts)
      this.loaded = true
    }

    return Module
  }
}

function isCustomScheme (str) {
  return /^[a-z][a-z0-9]+:/i.test(str)
}

function pathname (u) {
  const m = u.match(/^\w+:\/\/[^/]*(\/[^?]*)/)
  if (m) return decodeURI(m[1])
  return u
}
