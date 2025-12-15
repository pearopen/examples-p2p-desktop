import Hyperschema from 'hyperschema'
import HyperdbBuilder from 'hyperdb/builder'
import Hyperdispatch from 'hyperdispatch'
import HRPC from 'hrpc'

const SCHEMA_DIR = './spec/schema'
const DB_DIR = './spec/db'
const DISPATCH_DIR = './spec/dispatch'
const HRPC_DIR = './spec/hrpc'

const hyperSchema = Hyperschema.from(SCHEMA_DIR)
const schema = hyperSchema.namespace('basic-file-sharing')
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
  name: 'drive',
  fields: [
    { name: 'key', type: 'buffer', required: true },
    { name: 'info', type: 'json' }
  ]
})
schema.register({
  name: 'drives',
  array: true,
  type: '@basic-file-sharing/drive'
})
schema.register({
  name: 'file',
  fields: [
    { name: 'name', type: 'string', required: true },
    { name: 'uri', type: 'string', required: true },
    { name: 'info', type: 'json' }
  ]
})
Hyperschema.toDisk(hyperSchema)

const hyperdb = HyperdbBuilder.from(SCHEMA_DIR, DB_DIR)
const db = hyperdb.namespace('basic-file-sharing')
db.collections.register({
  name: 'invites',
  schema: '@basic-file-sharing/invite',
  key: ['id']
})
db.collections.register({
  name: 'drives',
  schema: '@basic-file-sharing/drive',
  key: ['key']
})
HyperdbBuilder.toDisk(hyperdb)

const hyperdispatch = Hyperdispatch.from(SCHEMA_DIR, DISPATCH_DIR, { offset: 0 })
const dispatch = hyperdispatch.namespace('basic-file-sharing')
dispatch.register({ name: 'add-writer', requestType: '@basic-file-sharing/writer' })
dispatch.register({ name: 'add-invite', requestType: '@basic-file-sharing/invite' })
dispatch.register({ name: 'add-drive', requestType: '@basic-file-sharing/drive' })
Hyperdispatch.toDisk(hyperdispatch)

const hrpc = HRPC.from(SCHEMA_DIR, HRPC_DIR)
const rpc = hrpc.namespace('basic-file-sharing')
rpc.register({
  name: 'drives',
  request: { name: '@basic-file-sharing/drives', send: true }
})
rpc.register({
  name: 'add-file',
  request: { name: '@basic-file-sharing/file', send: true }
})
HRPC.toDisk(hrpc)
