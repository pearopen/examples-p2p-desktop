# pear-updates

> Pear platform and application update notifications

## Usage

```js
import updates from 'pear-updates'
```

```js
const stream = updates()
stream.on('data', (update) => {
  const { app, version, info, updating, updated } = update
  //...
})
```

```js
updates((update) => {
  const { app, version, info, updating, updated } = update
  //...
})
```

Pattern match against `update` properties to listen for specific kinds of updates:

```js
const appUpdates = updates({ app: true })

appUpdates.on('data', (update) => {
  const { app, version, info, updating, updated } = update
  //...
})

const pearUpdates = updates({ app: false })

pearUpdates.on('data', (update) => {
  const { app, version, info, updating, updated } = update
  //...
})

const appUpdating = updates({ app: true, updating: true })

appUpdating.on('data', (update) => {
  const { app, version, info, updating, updated } = update
  //...
})

const pearUpdated = updates({ app: false, updated: true })

pearUpdated.on('data', (update) => {
  const { app, version, info, updating, updated } = update
  //...
})
```

## License

Apache-2.0