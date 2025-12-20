import Hyperschema from 'hyperschema'
import HyperdbBuilder from 'hyperdb/builder'
import Hyperdispatch from 'hyperdispatch'
import HRPC from 'hrpc'

const SCHEMA_DIR = './spec/account/schema'
const DB_DIR = './spec/account/db'
const DISPATCH_DIR = './spec/account/dispatch'
const HRPC_DIR = './spec/account/hrpc'

const hyperSchema = Hyperschema.from(SCHEMA_DIR)
const schema = hyperSchema.namespace('basic-chat-multi-rooms')
schema.register({
  name: 'writer',
  fields: [
    { name: 'key', type: 'buffer', required: true }
  ]
})
schema.register({
  name: 'invite',
  fields: [
    { name: 'id', type: 'buffer', required: true },
    { name: 'invite', type: 'buffer', required: true },
    { name: 'publicKey', type: 'buffer', required: true },
    { name: 'expires', type: 'int', required: true }
  ]
})
schema.register({
  name: 'room',
  fields: [
    { name: 'id', type: 'string', required: true },
    { name: 'name', type: 'string', required: true },
  ]
})
schema.register({
  name: 'rooms',
  array: true,
  type: '@basic-chat-multi-rooms/room'
})
Hyperschema.toDisk(hyperSchema)

const hyperdb = HyperdbBuilder.from(SCHEMA_DIR, DB_DIR)
const db = hyperdb.namespace('basic-chat-multi-rooms')
db.collections.register({
  name: 'invites',
  schema: '@basic-chat-multi-rooms/invite',
  key: ['id']
})
db.collections.register({
  name: 'rooms',
  schema: '@basic-chat-multi-rooms/room',
  key: ['id']
})
HyperdbBuilder.toDisk(hyperdb)

const hyperdispatch = Hyperdispatch.from(SCHEMA_DIR, DISPATCH_DIR, { offset: 0 })
const dispatch = hyperdispatch.namespace('basic-chat-multi-rooms')
dispatch.register({ name: 'add-writer', requestType: '@basic-chat-multi-rooms/writer' })
dispatch.register({ name: 'add-invite', requestType: '@basic-chat-multi-rooms/invite' })
dispatch.register({ name: 'add-room', requestType: '@basic-chat-multi-rooms/room' })
Hyperdispatch.toDisk(hyperdispatch)

const hrpc = HRPC.from(SCHEMA_DIR, HRPC_DIR)
const rpc = hrpc.namespace('basic-chat-multi-rooms')
rpc.register({
  name: 'rooms',
  request: { name: '@basic-chat-multi-rooms/rooms', send: true }
})
rpc.register({
  name: 'add-room',
  request: { name: 'string', send: true }
})
HRPC.toDisk(hrpc)
