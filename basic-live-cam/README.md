# Basic Live Cam

- P2P basic live cam app running in desktop environment

- Stack: holepunch, bare, pear, corestore, hyperswarm, blind-pairing, hyperdb, hrpc, autobase, hyperblobs, hypercore-blob-server, bare-ffmpeg

## Usage

```shell
npm i
npm run build

# user1: create room + print invite
pear run --store /tmp/user1 . --name user1

# user2: join room
pear run --store /tmp/user2 . --name user2 --invite <invite>
```

## Build Pear app
```shell
npm i
npm run build

pear stage <channel>
pear seed <channel>

# user1: create room + print invite
pear run --store /tmp/user1 <pear-link> --name user1

# user2: join room
pear run --store /tmp/user2 <pear-link> --name user2 --invite <invite>
```

## Troubleshoot
Use `--reset` to reset everything, e.g.
```shell
pear run --store /tmp/user1 . --name user1 --reset
```
