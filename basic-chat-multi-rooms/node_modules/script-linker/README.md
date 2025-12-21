# script-linker

CJS/MJS source loader that can preresolve imports/requires so linking them on runtime runs much faster.

Features include:

* Simple transforms (ie all contained on the same line)
* Source Maps for all transforms so debugging code is easy
* IO agnostic, bring your own IO
* Similar CJS/ESM interop like Node.js
* Cross platform
* Very fast. More than 100x faster than detective used in browserify.

## Usage

``` js
const ScriptLinker = require('@holepunchto/script-linker')
const Localdrive = require('localdrive')

const drive = new Localdrive('./root-folder')
const s = new ScriptLinker(drive)

const mod = await s.load('/some/module.js')

console.log(mod.toESM()) // transform to esm with imports preresolved
```

In the process executing the module, you need to include the ScriptLinker runtime dep.
Currently that's done by running

```js
// Run this in the render/module process.
// Sets up a global object, global[Symbol.for('scriptlinker')], that is used to make modules run.
// Has no nodejs/native deps so can be bundled if preferred.

const r = ScriptLinker.runtime({
  getSync (url) {
    // resolve this url synchronously (ie xhr sync or equi), see below for more
  },
  resolveSync (req, dirname, { isImport }) {
    // resolve the import/require request ie "./foo.js" or "fs" from the directory passed
  }
})
```

## Links

Per default the map function in ScriptLinker produces URLs per the following spec

```
app://[raw|esm|cjs|map|app]/(filename)|(dirname~module)
```

The links can be parsed (and generated) with the the links submodule

```js
const { links } = ScriptLinker // can also be loaded using require('script-linker/links')

// returns { protocol: 'app', transform: 'esm', resolve: 'module', dirname: '/', filename: null }
const l = links.parse('app://esm/~module')
```

## Runtime

For ScriptLinker to resolve dynamic imports or commonjs modules it needs a small runtime defined, with some helper functions.
In your execution context (ie the frontend), load this using the runtime submodule

```js
const { runtime } = ScriptLinker // can also be loaded using require('script-linker/runtime')

const r = runtime({
  map, // same as below
  mapImport, // same as below
  builtins, // same as below
  getSync (url) {
    // synchronously load this url and return the content as a string
    // per default this is an url produced by the links spec above expressing what it wants to load
    // you can make your own url scheme using the map function (see below)
  },
  resolveSync (req, dirname, { isImport }) {
    // synchronously resolve this url into the absolute path it represents
    // per default this is an url produced by the links spec above expressing what it wants to resolve
    // you can make your own url scheme using the map function (see below)
  }
})
```

## API

#### `s = new ScriptLinker(drive, options)`

Make a new ScriptLinker instance. Accepts a Localdrive or Hyperdrive.

Options include:

```js
{
  // (optional) key/value object where you can map filenames to source code
  sourceOverwrites: null,
  // (optional) additional "imports" map to apply to all specifiers
  imports,
  // (optional) provide the set of builtins you want to expose
  builtins: {
    has (name) { },
    async get (name) { },
    keys () { } // return an array of all builtins
  },
  // (optional) do not link any runtime - only needed for static bundling
  bare: false,
  // (optional) link in source maps for the generated code?
  linkSourceMaps: true,
  // (optional) symbol name to use for the scriptlinker runtime global
  symbol: 'scriptlinker',
  // (optional) protocol name that is passed to map
  protocol: 'app',
  // (optional) if no type is declared, and .js is used assume this type
  defaultType: 'commonjs',
  // (optional) per default maps to the link spec above
  map (id, { protocol, isImport, isConsole, isSourceMap, isBuiltin }) {
    return // url that is passed to import that should load the above
    // note that isConsole means that this is the url used by a source map
  },
  // (optional) map an import BEFORE it is passed to resolve
  mapImport (id, dirname) { }
  // (optional) support named exports in cjs imported from esm and
  // also speed up cjs require in general
}
```

#### `filename = await s.resolve(request, dirname, [options])`

Resolve a request (ie `./foo.js` or `module`) into an absolute filename from the context of a directory.
Options include:

```js
{
  // Should this be resolved as an import or a require?
  isImport: true,
  // Same as above, but added as a convenience as links contain the transform
  transform: 'esm'
}
```

#### `module = await s.load(filename)`

Load a module. `filename` should be an absolute path.

#### `string = module.source`

The raw source of the module

#### `string = module.toESM()`

Transform this module to be ESM.

#### `string = module.toCJS()`

Transform this module to be CJS.

#### `string = module.generateSourceMap()`

Generate a source map for this module.

#### `string = module.filename`

The filename (and id) for this module.

### `cache = module.cache()`

The data to cache if you want to make reloading the script linker faster.

#### `module.resolutions`

An array of the imports/requires this module has, and what they resolve to.
Note that the requires might be wrong (very likely not!), but is merely there as a caching optimisation.

The main work of ScriptLinker is to produce this array. When produced, you can cache it and pass it using the stat
function so transforms run faster on reboots.

#### `module.type`

Is this an esm module or commonjs?

Similarly to resolutions, you can cache this and pass it using stat.

#### `string = await s.transform(options)`

Helper for easily transforming a module based on a set of options.

Options include:

```js
{
  filename: '/path/to/file.js', // if set transform this file
  resolve: './module', // otherwise module is expressed by this request,
  dirname: '/', // resolve from the context of this dir
  transform: 'esm' || 'cjs' || 'map', // toESM(), toCJS() or generateSourceMap()?
}
```

Optionally instead of the transform you can pass the following flags instead for convenience

```js
{
  isSourceMap: true // same as transform: 'map'
  isImport: true // true means transform: 'esm', false means transform: 'cjs'
}
```

Note that the options to transform match what is returned from the url parser meaning the following works

```js
const l = ScriptLinker.links.parse(defaultUrl)
const source = await s.transform(l)
```

#### `string = await s.bundle(filename, { builtins: 'builtinsObjectName' })`

A simple static bundler that compiles the module specified by filename and it's dependencies into a single script without dependencies.

Builtins should be the string name of the global variable containing the builtins provided.

#### `for await (const { isImport, module } of s.dependencies(filename))`

Walk the dependencies of a module. Each pair of isImport, module is only yielded once.

#### `const modMap = await s.warmup(entryPoints)`

Warmup a single or multiple entrypoints. Doing this will help the CJS export parser find more exports.
Returns a Map of modules that were visited.

You can iterate this map and send to the runtime the filename and cjs of commonjs modules

```js
const cjs = []
for (const [filename, mod] of modMap) {
  if (mod.type !== 'commonjs') continue
  cjs.push({ filename, source: mod.toCJS() })
}
```

In the runtime, use this info to populate `runtime.sources` with the cjs source.

```js
const runtime = ScriptLinker.runtime(...)

// recv batch somehow...
for (const { filename, source } of batch) {
  runtime.sources.set(filename, source)
}
```

This will result in close to no runtime requests for cjs when running your code.

## License

Apache-2.0
