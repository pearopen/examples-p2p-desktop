# pear-messages

> Receive object messages from a Pear application's processes/threads using object pattern-matching

## Usage

```js
import messages from 'pear-messages'

const stream = messages({ some: 'props' })

stream.once('data', console.log)
```

Elsewhere in app use [`pear-message`](https://github.com/holepunchto/pear-message):

```js
import message from 'pear-message'

await message({ some: 'props', to: { pattern: ['match', 'against'] } })
```

Should log: `{ some: 'props', to: {pattern: ['match', 'against'] }}`

## API

### `messages(pattern[, listener]) -> stream | messages(listener, pattern) -> stream`

Listen for application messages sent with [`pear-message`](https://github.com/holepunchto/pear-message) based on `pattern` which is an object whose properties match a subset of the properties for a given target message.

A function which accepts a pattern object and returns an [`Iambus`](https://github.com/holepunchto/iambus) subscriber (which inherits from [`streamx`](https://github.com/mafintosh/streamx) `Readable`) which emits message objects matching a provided pattern object.

If no pattern object or an empty pattern object is provided all messages will be emitted. A pattern object is an object (typically) containing a subset of matching values for a given target object. Message objects can be user generated or platform generated.

The subscriber stream has a `data` event which can be listened to, it can also be consumed with `for await` and an listener function can be passed in addition to pattern (`message(pattern, listener)`) or as a single argument (`messages(listener)`) (indicating a catch-all pattern).

A message object may have any properties. Platform-generated messages are given a `type` property.

The message stream is auto-ended during [`Pear.teardown`](https://docs.pears.com/api#pear-teardown).

#### Examples:

Listen for an internal platform message using a pattern object and listener function:

```js
import messages from 'pear-messages'

messages({ type: 'pear/wakeup' }, ({ data, link }) => {
  console.log('pear/wakeup', data, link)
})
```

Tiny utility module which logs all messages using `for await`:

```js
import messages from 'pear-messages'

for await (const message of messages()) {
  if (global.LOGBUS) console.log('BUS:', message)
}
```

Use `message` to create an application message:

```js
import message from 'pear-message'
import messages from 'pear-messages'

const ctaClicks = messages({ type: 'my-app/user-cta' })

ctaClicks.on('data', (msg) => {
  console.log('cta click', msg)
})

// elsewhere
onUserClickCta((event, data) => {
  message({ type: 'my-app/user-cta', event, data })
})
```

## License

Apache-2.0
