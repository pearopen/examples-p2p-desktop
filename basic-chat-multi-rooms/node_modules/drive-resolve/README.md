# drive-resolve

Asynchronous require resolution in [Hyperdrive](https://github.com/holepunchto/hyperdrive).

```
npm install drive-resolve
```

## Usage

```js
const resolve = require('drive-resolve')

const resolved = await resolve(drive, 'bar')
// => /path/to/bar/index.js
```

## API

#### `const resolved = async resolve(drive, specifier[, options])`

`options` include:

```js
{
  basedir: string, // directory to begin resolving from
  extensions: [],   // array of extensions to search
  conditions: [], // array of import conditions
  sourceOverwrites: {} // source overwrites key-value map (file -> source)
  imports: // An additional "imports" map to apply to all specifiers. Follows the same syntax and rules as the "imports" property defined in `package.json`.
}
```

#### `const prebuilds = async resolve.prebuilds(drive, basedir)`

Returns closest bare/node prebuilds from basedir.

## License

Apache-2.0
