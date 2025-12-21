# listen-async

Easily listen on a http/net server async

```
npm install listen-async
```

## Usage

``` js
const listen = require('listen-async')

try {
  await listen(server, 8080)
} catch {
  await listen(server, 0)
}
```

## License

Apache-2.0
