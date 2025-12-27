import Hyperschema from 'hyperschema'
import HyperdbBuilder from 'hyperdb/builder'
import Hyperdispatch from 'hyperdispatch'
import HRPC from 'hrpc'

const SCHEMA_DIR = './spec/schema'
const DB_DIR = './spec/db'
const DISPATCH_DIR = './spec/dispatch'
const HRPC_DIR = './spec/hrpc'

const hyperSchema = Hyperschema.from(SCHEMA_DIR)
const schema = hyperSchema.namespace('basic-live-cam')
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
  name: 'video',
  fields: [
    { name: 'id', type: 'string', required: true },
    { name: 'blob', type: 'json', required: true },
    { name: 'info', type: 'json' }
  ]
})
schema.register({
  name: 'videos',
  array: true,
  type: '@basic-live-cam/video'
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
  type: '@basic-live-cam/message'
})
Hyperschema.toDisk(hyperSchema)

const hyperdb = HyperdbBuilder.from(SCHEMA_DIR, DB_DIR)
const db = hyperdb.namespace('basic-live-cam')
db.collections.register({
  name: 'invites',
  schema: '@basic-live-cam/invite',
  key: ['id']
})
db.collections.register({
  name: 'videos',
  schema: '@basic-live-cam/video',
  key: ['id']
})
db.collections.register({
  name: 'messages',
  schema: '@basic-live-cam/message',
  key: ['id']
})
HyperdbBuilder.toDisk(hyperdb)

const hyperdispatch = Hyperdispatch.from(SCHEMA_DIR, DISPATCH_DIR, { offset: 0 })
const dispatch = hyperdispatch.namespace('basic-live-cam')
dispatch.register({ name: 'add-writer', requestType: '@basic-live-cam/writer' })
dispatch.register({ name: 'add-invite', requestType: '@basic-live-cam/invite' })
dispatch.register({ name: 'add-video', requestType: '@basic-live-cam/video' })
dispatch.register({ name: 'add-message', requestType: '@basic-live-cam/message' })
Hyperdispatch.toDisk(hyperdispatch)

const hrpc = HRPC.from(SCHEMA_DIR, HRPC_DIR)
const rpc = hrpc.namespace('basic-live-cam')
rpc.register({
  name: 'invite',
  request: { name: 'string', send: true }
})
rpc.register({
  name: 'videos',
  request: { name: '@basic-live-cam/videos', send: true }
})
rpc.register({
  name: 'messages',
  request: { name: '@basic-live-cam/messages', send: true }
})
rpc.register({
  name: 'add-message',
  request: { name: 'string', send: true }
})
HRPC.toDisk(hrpc)
