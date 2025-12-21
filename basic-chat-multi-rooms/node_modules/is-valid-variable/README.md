# is-valid-variable

Check if a token is a valid variable name

```
npm install is-valid-property
```

Doesn't try to follow the full spec, ie might say `false` when something should be `true`,
but will never say `true` when something should be `false`

## Usage

``` js
const isValidVariable = require('is-valid-variable')

console.log(isValidVariable('const')) // false
console.log(isValidVariable('constantin')) // true
console.log(isValidVariable('64')) // false
console.log(isValidVariable('x64')) // true
```

## License

MIT
