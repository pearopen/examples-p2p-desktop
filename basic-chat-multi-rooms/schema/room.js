import Hyperschema from 'hyperschema'
import HyperdbBuilder from 'hyperdb/builder'
import Hyperdispatch from 'hyperdispatch'
import HRPC from 'hrpc'

const SCHEMA_DIR = './spec/room/schema'
const DB_DIR = './spec/room/db'
const DISPATCH_DIR = './spec/room/dispatch'
const HRPC_DIR = './spec/room/hrpc'

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
  name: 'message',
  fields: [
    { name: 'id', type: 'string', required: true },
    { name: 'text', type: 'string', required: true },
    { name: 'info', type: 'json' }
  ]
})
schema.register({
  name: 'messages',
  array: true,
  type: '@basic-chat-multi-rooms/message'
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
  name: 'messages',
  schema: '@basic-chat-multi-rooms/message',
  key: ['id']
})
HyperdbBuilder.toDisk(hyperdb)

const hyperdispatch = Hyperdispatch.from(SCHEMA_DIR, DISPATCH_DIR, { offset: 0 })
const dispatch = hyperdispatch.namespace('basic-chat-multi-rooms')
dispatch.register({ name: 'add-writer', requestType: '@basic-chat-multi-rooms/writer' })
dispatch.register({ name: 'add-invite', requestType: '@basic-chat-multi-rooms/invite' })
dispatch.register({ name: 'add-message', requestType: '@basic-chat-multi-rooms/message' })
Hyperdispatch.toDisk(hyperdispatch)

const hrpc = HRPC.from(SCHEMA_DIR, HRPC_DIR)
const rpc = hrpc.namespace('basic-chat-multi-rooms')
rpc.register({
  name: 'messages',
  request: { name: '@basic-chat-multi-rooms/messages', send: true }
})
rpc.register({
  name: 'add-message',
  request: { name: 'string', send: true }
})
HRPC.toDisk(hrpc)
