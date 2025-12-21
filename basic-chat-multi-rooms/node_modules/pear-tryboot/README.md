# pear-tryboot

> Pear sidecar tryboot for pear-ipc connect function

## Usage

Designed to be passed to `pear-ipc` so the client can start Pear sidecar if it's not already started in order to connect.

```js
const IPC = require('pear-ipc')
const tryboot = require('pear-tryboot')
const client = new IPC.Client({
  socketPath: ...,
  connect: tryboot
})
//...
```

## License

Apache-2.0