# pear-pipe

> Pear parent app connected bare-pipe

## Usage

```js
const pipe = require('pear-pipe')()
if (pipe === null) {
  console.log('Not a child app')
} else {
  pipe.on('data', console.log)
  pipe.write(Buffer.from('some data))
}
```

## API

### `const pipe = require('pear-pipe')` | `import pipe from 'pear-pipe'` `pipe() -> PearPipe|null`

Returns `null` if the app doesn't have a parent app.

If an app has been run with `pear-run`, returns `PearPipe` instance.

`PearPipe` inherits from `bare-pipe` (which inherits from `Duplex`) and extends it with a couple of methods and properties.

### `pipe.autoexit = true`

Whether to automatically exit when `pipe` emits the `end` event.

Default to `true` for common usage, which is creating a worker and expecting it to exit once the parent ends the pipe. Set to `false` to opt-in to graceful close strategy where all handles are closed before process exits. If using `pipe.autoexit = false` be sure to close the writable side of the pipe when the readable side is closed by the parent: `pipe.on('end', () => pipe.end())`.

## License

Apache-2.0
