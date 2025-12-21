# pear-stamp

> Pear template transforms

## API

**Placeholder Syntax**: `__name__`, allowed: `[a-zA-Z/\\.:]*`.

## `stamp.sync(template, locals[, shave])`

Interleaves `template` parts with `locals[name]`. Expectes sanitized/escaped inputs. 

Returns `string`.

* `template`: `string` containing placeholders
* `locals`: `{ [name: string]: any }` interpolation values
* `shave` : `{ [name: string]: [before: number, after: number] }`

## `stamp.stream(template, locals[, shave])`

Interleaves `template` parts with value-expanded `locals[name]`. Value-expansion includes promise-resolving and streams. A promise local will have it's resolved value inlined into the the template where the local is declared. A stream local will like-wise render inline.

Returns `streamx.Readable` (`objectMode: true`).

* `template`: `string` containing placeholders
* `locals`: `{ [name: string]: any }` interpolation values. Includes Promise and stream rendering.
* `shave` : `{ [name: string]: [before: number, after: number] }` slices per before & after for a given local value

## License

Apache-2.0