# pear-logger

> Pear logger

## API

```js
import Logger from 'pear-logger'
```

```js
const Logger = require('pear-logger')
```

### `const logger = new Logger([options])`

**Options:**

* `labels` `string` comma-separated label allowlist
* `fields` `string` comma-separated: `date,time,level,label,delta`  
  Prefix with `h:` to hide (e.g. `h:label`)
* `stacks` `boolean` include stack traces
* `level` `number|string` one of `0..3 | 'OFF'|'ERR'|'INF'|'TRC'|'ERROR'|'INFO'|'TRACE'`
* `pretty` `boolean` hint to hide redundant fields in non-verbose, non-max

### `logger.OFF` `boolean`

True if log level is 0 (OFF)

### `logger.ERR` `boolean`

True if log level is 1 (ERR)

### `logger.INF` `boolean`

True if log level is 2 (INF) (default)

### `logger.TRC` `boolean`

True if log level is 3 (TRC)

### `logger.error(label, ...args)`

Logs when `level >= ERR` and `label` is allowed

### `logger.info(label, ...args)`

Logs when `level >= INF` and `label` is allowed

### `logger.trace(label, ...args)`

Logs when `level >= TRC` and `label` is allowed

### `logger.format(level, label, ...args) -> string | ''`  

Returns a formatted string; respects thresholds, labels, fields, stacks, and TTY color support.

### `Logger.switches`  

Defaults from `pear` top-level flags:
  * `--log` - `log`
  * `--log-level` - `logLevel`
  * `--log-labels` - `logLabels`
  * `--log-fields` - `logFields`
  * `--log-stacks` - `logStacks`
  * `--log-verbose` - `logVerbose`
  * `--log-max` - `logMax`

See `pear -h` for flag descriptions.

### `Logger.OFF = 0` | `Logger[0] === 'OFF'`

### `Logger.ERR = 1` | `Logger[1] === 'ERR'`

### `Logger.INF = 2` | `Logger[2] === 'INF'`

### `Logger.TRC = 3` | `Logger[3] === 'TRC'`

## License

Apache-2.0