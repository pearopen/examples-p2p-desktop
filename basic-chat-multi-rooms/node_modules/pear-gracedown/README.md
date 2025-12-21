# pear-gracedown

> Pear graceful closer

## API

Graceful shutdown is where the process exits because it has no more work to do, no I/O handles are open OR SIGINT/SIGTERM handling.

This library runs handlers once on first graceful shutdown signal:

- `'beforeExit'` event
- `SIGINT` → sets `Bare.exitCode = 130`, re-sends `SIGINT` to `Bare.pid` after handlers
- `SIGTERM` → sets `Bare.exitCode = 143`, re-sends `SIGTERM` to `Bare.pid` after handlers

### `gracedown(fn[, position])`

Registers a graceful shutdown handler.

Returns `unregister([unlisten])`.

**Arguments**

- `fn`: `() => void|Promise<void>` handler to run on graceful shutdown
- `position`: `number` priority (default `0`). Higher values run earlier. Handlers with the same position run in parallel; positions run high→low in batches.

Calling `unregister(true)` removes the handler; if no handlers remain and `unlisten` true listeners are removed. First registration sets up listeners (`bare-signals`, `beforeExit`); last unregister cleans them up. Handler errors are caught via [`safety-catch`](https://github.com/mafintosh/safety-catch)

## License

Apache-2.0
