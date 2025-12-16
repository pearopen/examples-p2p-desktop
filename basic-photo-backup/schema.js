import Hyperschema from 'hyperschema'
import HyperdbBuilder from 'hyperdb/builder'
import Hyperdispatch from 'hyperdispatch'
import HRPC from 'hrpc'

const SCHEMA_DIR = './spec/schema'
const DB_DIR = './spec/db'
const DISPATCH_DIR = './spec/dispatch'
const HRPC_DIR = './spec/hrpc'

const hyperSchema = Hyperschema.from(SCHEMA_DIR)
const schema = hyperSchema.namespace('basic-photo-backup')
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
    { name: 'name', type: 'string', required: true },
    { name: 'type', type: 'string', required: true },
    { name: 'blob', type: 'json', required: true },
    { name: 'info', type: 'json' }
  ]
})
schema.register({
  name: 'videos',
  array: true,
  type: '@basic-photo-backup/video'
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
  type: '@basic-photo-backup/message'
})
schema.register({
  name: 'add-message',
  fields: [
    { name: 'text', type: 'string', required: true },
    { name: 'info', type: 'json' }
  ]
})
Hyperschema.toDisk(hyperSchema)

const hyperdb = HyperdbBuilder.from(SCHEMA_DIR, DB_DIR)
const db = hyperdb.namespace('basic-photo-backup')
db.collections.register({
  name: 'invites',
  schema: '@basic-photo-backup/invite',
  key: ['id']
})
db.collections.register({
  name: 'videos',
  schema: '@basic-photo-backup/video',
  key: ['id']
})
db.collections.register({
  name: 'messages',
  schema: '@basic-photo-backup/message',
  key: ['id']
})
HyperdbBuilder.toDisk(hyperdb)

const hyperdispatch = Hyperdispatch.from(SCHEMA_DIR, DISPATCH_DIR, { offset: 0 })
const dispatch = hyperdispatch.namespace('basic-photo-backup')
dispatch.register({ name: 'add-writer', requestType: '@basic-photo-backup/writer' })
dispatch.register({ name: 'add-invite', requestType: '@basic-photo-backup/invite' })
dispatch.register({ name: 'add-video', requestType: '@basic-photo-backup/video' })
dispatch.register({ name: 'add-message', requestType: '@basic-photo-backup/message' })
Hyperdispatch.toDisk(hyperdispatch)

const hrpc = HRPC.from(SCHEMA_DIR, HRPC_DIR)
const rpc = hrpc.namespace('basic-photo-backup')
rpc.register({
  name: 'videos',
  request: { name: '@basic-photo-backup/videos', send: true }
})
rpc.register({
  name: 'add-video',
  request: { name: 'string', send: true }
})
rpc.register({
  name: 'messages',
  request: { name: '@basic-photo-backup/messages', send: true }
})
rpc.register({
  name: 'add-message',
  request: { name: '@basic-photo-backup/add-message', send: true }
})
HRPC.toDisk(hrpc)
