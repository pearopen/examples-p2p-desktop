# Basic Chat Blind Peering

- P2P basic chat app with blind peering running in desktop environment

- Stack: holepunch, bare, pear, corestore, hyperswarm, blind-pairing, hyperdb, hrpc, autobase, blind-peering

## Usage

```shell
npm i
npm run build

# run a blind peer + print listening-key
npm i -g blind-peer-cli@latest
npx blind-peer -s /tmp/blind1

# user1: create room + print invite
pear run --store /tmp/user1 . --name user1 --blind-peer-key <listening-key>

# user2: join room
pear run --store /tmp/user2 . --name user2 --blind-peer-key <listening-key> --invite <invite>
```

## Build Pear app
```shell
npm i
npm run build

pear stage <channel>
pear seed <channel>

# user1: create room + print invite
pear run --store /tmp/user1 <pear-link> --name user1 --blind-peer-key <key>

# user2: join room
pear run --store /tmp/user2 <pear-link> --name user2 --blind-peer-key <key> --invite <invite>
```
