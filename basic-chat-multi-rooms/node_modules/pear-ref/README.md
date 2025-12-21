# pear-ref

> Pear core ref counter

## Usage

```js
const ref = require('pear-ref')

ref.on('ref', (refs) => console.log('ref', 'count', refs))
ref.on('unref', (refs) => console.log('unref', 'count', refs))

ref.ref()
handleCreatingCb(function callback () { ref.unref() })

ref.track(handleCreatingPromise())
```

## License

Apache-2.0