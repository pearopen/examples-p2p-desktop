# pear-appdrive

> Pear application drive class, minimal hyperdrive compat, read-only

## Usage

```js
import AppDrive from 'pear-appdrive'

const drive = new AppDrive()

await drive.ready()

const file = await drive.get('/file/from/app')

console.log(file.toString())

await drive.close()
```

## License

Apache-2.0