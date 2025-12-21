# pear-message

> Send object messages between a Pear application's processes/threads, pattern matching them with pear-messages

## Usage

```js
import message from 'pear-message'

await message({ some: 'props', to: {pattern: ['match', 'against'] }})
```

Elsewhere in app use [`pear-messages`](https://github.com/holepunchto/pear-messages):

```js
import messages from 'pear-messages'

const stream = messages({ some: 'props' })

stream.once('data', console.log)
```

Should log: `{ some: 'props', to: {pattern: ['match', 'against'] }}`

## License

Apache-2.0