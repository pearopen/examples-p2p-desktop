# pear-opwait

> Pear operation stream promise wrapper

## API

### `opwait(stream[, onstatus])`

Waits for a stream that emits status objects `{ tag, data }`.
Resolves with the `final` payload, forwards errors while allowing observation of intermediate statuses.

Returns `Promise<any>` of the `final` data.

**Arguments**

* `stream`: `Readable` emitting `{ tag, data }`
* `onstatus`: `(status) => void|Promise<void>` optional observer for each status

**Behavior**

* Listens to `data`, `end`, `error`
* `tag === 'final'` → stores `data` as resolution value
* `tag === 'error'` → destroys stream with `ERR_OPERATION_FAILED(message, data)`
* `onstatus` may be async; rejection throws into the stream via `destroy(err)`
* Promise **resolves** on `end` with last seen `final` (or `null` if none)
* Promise **rejects** on `error` from the stream (including wrapped operation errors)


## License

Apache-2.0