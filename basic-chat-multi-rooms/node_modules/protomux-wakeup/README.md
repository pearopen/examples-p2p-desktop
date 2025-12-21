# protomux-wakeup

Wakeup protocol over protomux

```
npm install protomux-wakeup
```

## Usage

```js
const Wakeup = require('protomux-wakeup')

const w = new Wakeup()

w.addStream(stream)

const s = w.session(capability, {
  onpeeradd (peer) {
    // peer added
  },
  onpeerremove (peer) {
    // peer removed
  },
  onlookup (req, peer) {
    // received a lookup request
  },
  onannounce (wakeup, peer) {
    // received an announce message
  }
})

// the peers
s.peers

// request wakeup
s.lookup(peer, { hash })
s.announce(peer, [{ key, length }])

// or by stream
s.lookupByStream(stream, ...)
s.announceByStream(stream, ...)

// mark session as inactive, you must call this when done
s.inactive()

// cancel an inactive call
s.active()
```

## API

#### `const w = new Wakeup([onwakeup])`

Create a new wakeup swarm with a `onwakeup` callback. `onwakeup` is called with the `id` and `stream` whenever a new peer connects. `id` is the wakeup topic (see `w.session()` for more info). `stream` is the Protomux instance.

#### `w.topics`

A map of all topics being tracked.

#### `const sessions = w.getSessions(capability, handlers = {})`

Return all sessions for the topic that matches the `capability` & `handlers`.

#### `const s = w.session(capability, handlers = {})`

Create a session to track the capability. Handlers includes hook callbacks for the life cycle of peers in the session.

```
const s = w.session(core.key, {
  onpeeradd: (peer, session) => {
    // Called when a peer is added to the session
  },
  onpeerremove: (peer, session) => {
    // Called when a peer is removed from the session
  },
  onpeeractive: (peer, session) => {
    // Called when a peer becomes active
  },
  onpeerinactive: (peer, session) => {
    // Called when a peer becomes inactive
  },
  onannounce: (wakeup, peer, session) => {
    // Called when a peer announces its available wake ups
  },
  onlookup: (req, peer, session) => {
    // Called when a peer requests available wake ups
  }
})
```

`handlers` can also includes:

```
{
  active: true, // Whether the session is currently active / replicating
  discoveryKey: crypto.discoveryKey(capability) // The buffer to use as the `id` for the wake up topic. If not provide a discoveryKey hash of the capability will be used.
}
```

#### `s.peers`

Peers on the session's topic.

#### `s.topic`

The session's topic.

#### `s.isActive`

Whether the session is active.

#### `s.addStream(stream)`

Add the `stream` to the current session. If `stream` doesn't have a Protomux instance, one will added.

#### `const peer = s.getPeer(stream)`

Get the peer for the given `stream`.

#### `s.lookup(peer, req = { hash: null })`

Send a lookup request to a `peer`. `req` can be of the form `{ hash }`.

Usually used to prompt the peer for any available wake ups.

#### `s.broadcastLookup(req)`

Call `s.lookup()` on all peers.

#### `s.lookupByStream(stream, req)`

A shortcut for calling `s.lookup()` on the peer for a given `stream`.

#### `s.announce(peer, wakeup)`

Announce to the peer an array of wake up messages. Wake up messages have the form `{ key: Buffer, length: Number }`. The `key` buffer is 32 bytes long.

#### `s.announceByStream(stream, wakeup)`

A shortcut for calling `s.announce()` on the peer for a given `stream`.

#### `s.active()`

Set the session as active. Sessions are active by default.

#### `s.inactive()`

Set the session as inactive. This must be called when the session is done.

## License

Apache-2.0
