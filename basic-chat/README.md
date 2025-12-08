# Basic Chat

- P2P basic chat app running in desktop environment

- Stack: holepunch, bare, pear, autobase, hyperdb, blind-pairing, hyperswarm, corestore

## Usage

```shell
npm i
npm run build

# user1: create room + print invite
pear run . --name user1

# user2: join room
pear run --tmp-store . --name user2 --invite <invite>
```

## Build Pear app
```shell
npm i
npm run build

pear stage <channel>
pear seed <channel>

# user1: create room + print invite
pear run <pear-link> --name user1

# user2: join room
pear run --tmp-store <pear-link> --name user2 --invite <invite>
```
