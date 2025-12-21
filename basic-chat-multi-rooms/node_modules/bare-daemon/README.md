# bare-daemon

Create and manage daemon processes in JavaScript.

```
npm i bare-daemon
```

## Usage

```js
const { spawn } = require('bare-daemon')

const daemon = spawn('/usr/bin/python3', ['-m', 'http.server', '9000'])
```

## License

Apache-2.0
