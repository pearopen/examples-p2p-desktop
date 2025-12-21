# pear-terminal

> Pear Terminal User Interface library

## API

### `usage`

Strings for CLI banners & footers.

Returns `{ header, version, banner, footer }`.

### `permit(ipc, info, cmd)`

Ask user to trust or unlock an app/template.

Returns `Promise<void>`.

* `ipc`: `{ permit({ key, password? }), close() }`
* `info`: `{ key: Buffer|string, encrypted: boolean }`
* `cmd`: `'run'|'init'|'stage'|'seed'|'dump'|'info'`


### `confirm(dialog, ask, delim, validation, msg)`

One-shot confirmation prompt.

Returns `Promise<void>`.

* `dialog`: `string` preface text
* `ask`: `string` prompt label
* `delim`: `string` delimiter (e.g. `':'` or '?'`)
* `validation`: `(value:string) => boolean|Promise<boolean>`
* `msg`: `string` error message on invalid input

### `const interact = new Interact(header, params[, opts])`

Interactive prompt runner.

* `header`: `string` shown once before prompts
* `params`: `Array<{ name, prompt, default?, delim?, validation?, msg?, shave? }>`
* `opts.masked`: `boolean` mask user input (passwords)
* `opts.defaults`: `{ [name:string]: any }` fallback values

#### `interact.run([opts])`

Process prompts and return answers.

Returns `Promise<{ fields, shave }>`.

* `opts.autosubmit`: `boolean` fill with defaults without prompting

### `stdio`

Thin stdio wrapper with Bare/TTY streams.

Returns object with:

* `in`, `out`, `err`: lazy streams
* `size() -> { width, height }`
* `raw(bool) -> void` set raw mode
* `drained(stream) -> Promise<void>`
* `inAttached`: `boolean`

### `ansi`

ANSI styling helpers (no-op on Windows).

Returns object with:

* text: `bold, dim, italic, underline, inverse, red, green, yellow, gray`
* cursor: `upHome(n)`, `hideCursor()`, `showCursor()`
* links: `link(url, text?)`
* glyphs: `sep, tick, cross, warning, pear, dot, key, down, up`

### `indicator(value[, type])`

Status glyph helper.

Returns `string`.

* `value`: `true|false|null|number` (`>0` success, `<0` fail, `0|null` neutral)
* `type`: `'success'|'diff'` (`diff`: `+ | - | ~`)

### `status(message[, success])`

Live status line (TTY-aware).

Returns `void`.

* `message`: `string`
* `success`: `boolean|null|number` (see `indicator`)

### `print(message[, success])`

Plain line print with optional status glyph.

Returns `void`.

* `message`: `string`
* `success`: `boolean|null|number`

### `byteDiff({ type, sizes, message })`

Pretty-print byte deltas.

Returns `void`.

* `type`: any value passed to `indicator(..., 'diff')`
* `sizes`: `number[]` byte changes (signed)
* `message`: `string`

### `outputter(cmd[, taggers])`

Create a stream consumer that routes tagged events to `print/status` (TTY) or JSON.

Returns `(opts, stream, info?, ipc?) -> Promise<void>`.

* `cmd`: `string` command name
* `taggers`: `{ [tag]: (data, info, ipc) => string|{ output, message, success }|false|Promise<...> }`
  * `output`: `'print'|'status'`
  * `message`: `string|string[]`
  * `success`: `boolean`
* `opts`: `{ json?: boolean, log?: (msg, { output, success? }) => void, ctrlTTY?: boolean }`
* `stream`: `Readable|Array` of `{ tag, data }` events
* `info`: any extra context
* `ipc`: optional IPC handle

Behavior:
- `opts.json === true` → emits JSON lines: `{ cmd, tag, data }`
- `tagger` result `false`:
  - for `tag==='final'` prints default success/failure
  - otherwise suppressed
- TTY: hides/shows cursor, handles Ctrl+C cleanup

### `isTTY`

`boolean` indicating stdin TTY status.

### `byteSize(bytes)`

Format bytes into human-friendly string.

Returns `string`.

## License

Apache-2.0