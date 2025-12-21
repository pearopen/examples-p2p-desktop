# pear-link

Parse Pear Links. This includes URLs with `pear:` & `file:` protocols.

```
npm install pear-link
```

## Pear Link Format

The `pear:` protocol supports the following syntax:

```
pear://[<fork>.][<length>.]<keyOrAlias>[.<dhash>]<path>[?<search>][#<lochash>]
```

- `fork` is the [fork id](https://github.com/holepunchto/hypercore#corefork) for the underlying hypercore.
- `length` is the [length](https://github.com/holepunchto/hypercore#corelength) of the underlying hypercore.
- `keyOrAlias` is the z32 or hex encoded key or an alias for the key.
- `path` is zero or more path segments separated by a `/`.
- `search` is a query string of non-hierarchical data proceeded by a question
  mark (`?`).
- `lochash` is the fragment proceeded by a hash (`#`).

## API

### `const plink = require('pear-link')`

Exports a singleton with methods `parse`, `serialize` and `normalize`.

Supports aliases per [`pear-aliases`](https://github.com/holepunchto/pear-aliases).

#### `const { protocol, pathname, search, hash, origin, drive } = plink.parse(url)`

Parses the provided `url` string returning an object describing the URL's
properties.

The returned object contains the following:

```
{
  protocol, // The url's protocol. Supported protocols include `pear:` & `file:`
  pathname, // The `some/path` in `pear://key/some/path`. Same as the standard URL pathname
  search,   // The query string in the URL, aka anything after a `?` including the `?`
  hash,     // The fragment part of the URL, eg `#fragment` in `pear://key/path#fragment`. Includes the `#`.
  origin: this.normalize(`${protocol}//${hostname}${pathname}`),
  drive: {
    key,    // The key for the hyperdrive. Usually the `key` part of a pear link.
    length, // The hyperdrive length defined in the URL.
    fork,   // The hyperdrive fork defined in the URL.
    hash,   // The dhash in the URL.
  }
}
```

#### `const normalizedLink = plink.normalize(link)`

Normalizes the link by removing trailing path separators (`/`).

#### `const link = plink.serialize({ protocol, pathname, search, hash, drive })` | `const link = plink.serialize(key)`

Expects either

- a parsed object as returned by plink.parse
- a `hypercore-id-encoding` key, eg `drive.key` - the key in `pear://<key>` - `key` may be buffer or string.

Returns a `pear://` link as a string.

## License

Apache-2.0
