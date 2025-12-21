# pear-run

> Run Pear app from app p2p with pear:// link

## API

```js
import run from 'pear-run'
```

### `run(link[, args]) -> pipe`

Launch a Pear application in a subprocess peer-to-peer or from disk by link.

Returns [`bare-pipe`](https://github.com/holepunchto/bare-pipe) instance.

The `pipe` has an additional `crash` event that passes `{ exitCode }`.

#### `link <string>`

A `pear://` link, `file://` link or relative path.

#### `args <string[]> (optional)`

Additional arguments to append to the runtime invocation after the link.

# License

Apache-2.0
