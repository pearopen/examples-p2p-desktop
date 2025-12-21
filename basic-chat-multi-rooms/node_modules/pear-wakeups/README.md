# pear-wakeups

> Pear platform and application update notifications

## Usage

```js
import wakeups from 'pear-wakeups'
```

```js
const stream = wakeups()
stream.on('data', (wakeup) => {
  const { link, applink, entrypoint, fragment, query, linkData } = wakeup
  //...
})
```

```js
wakeups((wakeup) => {
  const { link, applink, entrypoint, fragment, query, linkData } = wakeup
  //...
})
```


## License

Apache-2.0