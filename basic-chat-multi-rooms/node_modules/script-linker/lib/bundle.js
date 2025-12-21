module.exports = async function bundle (s, filename, { require = true, builtins, header = '', footer = '' } = {}) {
  if (!s.bare) throw new Error('Bundling only works in bare mode')

  let cjs = []
  let esm = ''
  let main = null
  let out = '{\n'

  for await (const { isImport, module } of s.dependencies(filename)) {
    if (main === null) main = module
    if (isImport === false || module.builtin || module.type === 'commonjs') {
      cjs.push(module)
    }
    if (isImport) {
      if (esm) esm += ',\n'
      esm += '    ' + JSON.stringify('bundle:' + s.mapPath(module.filename)) + ': '
      esm += JSON.stringify('data:application/javascript;base64,' + Buffer.from(module.toESM()).toString('base64'))
    }
  }

  if (esm) esm += '\n'

  if (esm) {
    out += '{\n  const im = document.createElement(\'script\')\n'
    out += '  im.type = \'importmap\'\n'
    out += '  im.textContent = JSON.stringify({ imports: {\n'
    out += esm
    out += '  }})\n'
    out += '  document.currentScript.before(im)\n}\n'
  }

  if (cjs.length) {
    cjs = [...new Set(cjs)] // no dups
    out += 'globalRequire.cache = {\n'
    for (let i = cjs.length - 1; i >= 0; i--) {
      const isBuiltin = !!(cjs[i].builtin && (builtins || require))
      const e = isBuiltin ? getBuiltin(s.mapPath(cjs[i].filename)) : '{}'
      out += '  ' + JSON.stringify(s.mapPath(cjs[i].filename)) + ': { exports: ' + e + ', bootstrap: null, require: null, filename: null, dirname: null }' + (i === 0 ? '' : ',') + '\n'
    }
    out += '}\n'
    out += 'globalRequire.define = function (filename, dirname, map, fn) {\n'
    out += '  scopedRequire.cache = globalRequire.cache\n'
    out += '  scopedRequire.addon = scopedAddon\n'
    out += '  const mod = globalRequire.cache[filename]\n'
    out += '  mod.filename = filename\n'
    out += '  mod.dirname = dirname\n'
    out += '  mod.require = scopedRequire\n'
    out += '  mod.bootstrap = fn\n'
    out += '  function scopedRequire (req) {\n'
    out += '    if (globalRequire.cache.hasOwnProperty(req)) return globalRequire(req)\n'
    out += '    if (!map.hasOwnProperty(req)) throw new Error("Cannot require \'" + req + "\'")\n'
    out += '    return globalRequire(map[req])\n'
    out += '  }\n'
    out += '  function scopedAddon (req = dirname) {\n'
    out += '    if (typeof require !== "function" || !require.addon) throw new Error("Addons not supported")\n'
    out += '    return require.addon(req)\n'
    out += '  }\n'
    out += '}\n'
    for (let i = cjs.length - 1; i >= 0; i--) {
      const mod = cjs[i]
      if (mod.builtin) continue
      const map = mod.requireMap() || {}
      out += 'globalRequire.define(' + JSON.stringify(s.mapPath(mod.filename)) + ', ' + JSON.stringify(s.mapPath(mod.dirname)) + ', ' + JSON.stringify(map) + ', function '
      out += '(require, module, exports, __filename, __dirname) {\n'
      out += mod.type === 'json' ? 'module.exports = ' + mod.source : mod.toCJS()
      out += '})\n'
    }
    out += 'function globalRequire (req) {\n'
    out += '  if (!globalRequire.cache.hasOwnProperty(req)) throw new Error("Cannot require \'" + req + "\'")\n'
    out += '  const mod = globalRequire.cache[req]\n'
    out += '  if (mod.bootstrap !== null) {\n'
    out += '    const bootstrap = mod.bootstrap\n'
    out += '    mod.bootstrap = null\n'
    out += '    bootstrap(mod.require, mod, mod.exports, mod.filename, mod.dirname)\n'
    out += '  }\n'
    out += '  return mod.exports\n'
    out += '}\n'
  }

  if (main.type === 'module') {
    out += 'import(' + JSON.stringify('bundle:' + s.mapPath(main.filename)) + ')\n'
  } else {
    out += 'globalRequire(' + JSON.stringify(s.mapPath(main.filename)) + ')\n'
  }

  out += '}\n'

  return header + out + footer

  function getBuiltin (name) {
    return require ? 'require(' + JSON.stringify(name) + ')' : builtins + '.get(' + JSON.stringify(name) + ')'
  }
}
