# pear-crasher

> Pear uncaught crash handler

## API

### `crasher(name, dir, write)`

Sets up unhandled rejection and unhandled exception crash handlers. 


* `name` `<string>` is entered into logs and determines name of log file.
* `dir` `<string>` path to store log files. Typically the [`pear-constants`](https://github.com/holepunchto/pear-constants) `SWAP`. 
* `write` `<boolean>` - default `false`. Logs are always printed, if `write` is true logs are also saved to `dir`. 

## License

Apache-2.0