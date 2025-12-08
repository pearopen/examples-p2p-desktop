import Hyperschema from 'hyperschema'
import HyperdbBuilder from 'hyperdb/builder'
import Hyperdispatch from 'hyperdispatch'

const NAMESPACE = 'basic-chat'

const SCHEMA_DIR = './spec/schema'
const DB_DIR = './spec/db'
const DISPATCH_DIR = './spec/dispatch'

const hyperSchema = Hyperschema.from(SCHEMA_DIR)
const schema = hyperSchema.namespace(NAMESPACE)
schema.register({
  name: 'writers',
  fields: [
    { name: 'key', type: 'buffer', required: true }
  ]
})
schema.register({
  name: 'invites',
  fields: [
    { name: 'id', type: 'buffer', required: true },
    { name: 'invite', type: 'buffer', required: true },
    { name: 'publicKey', type: 'buffer', required: true },
    { name: 'expires', type: 'int', required: true }
  ]
})
schema.register({
  name: 'messages',
  fields: [
    { name: 'id', type: 'string', required: true },
    { name: 'text', type: 'string', required: true },
    { name: 'info', type: 'json' }
  ]
})
Hyperschema.toDisk(hyperSchema)

const hyperdb = HyperdbBuilder.from(SCHEMA_DIR, DB_DIR)
const db = hyperdb.namespace(NAMESPACE)
db.collections.register({
  name: 'invites',
  schema: `@${NAMESPACE}/invites`,
  key: ['id']
})
db.collections.register({
  name: 'messages',
  schema: `@${NAMESPACE}/messages`,
  key: ['id']
})
HyperdbBuilder.toDisk(hyperdb)

const hyperdispatch = Hyperdispatch.from(SCHEMA_DIR, DISPATCH_DIR, { offset: 0 })
const dispatch = hyperdispatch.namespace(NAMESPACE)
dispatch.register({ name: 'add-writer', requestType: `@${NAMESPACE}/writers` })
dispatch.register({ name: 'add-invite', requestType: `@${NAMESPACE}/invites` })
dispatch.register({ name: 'add-message', requestType: `@${NAMESPACE}/messages` })
Hyperdispatch.toDisk(hyperdispatch)
