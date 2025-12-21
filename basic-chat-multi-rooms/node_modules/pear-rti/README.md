# pear-rti

> Pear Core Runtime Information

End-of-bootstrap essential steady-state.

# Usage

```js
class API {
  static RTI = { checkout: require('./checkout') }
}
global.Pear = new API()
const { MOUNT, CHECKOUT } = require('pear-rti')
```

# License

Apache-2.0