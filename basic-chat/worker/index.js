/* global Pear */
import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'
import NewlineDecoder from 'newline-decoder'
import { command, flag } from 'paparam'
import ReadyResource from 'ready-resource'

import ChatRoom from './chat-room'

const cmd = command('basic-chat',
  flag('--invite|-i <invite>', 'Room invite'),
  flag('--name|-n <name>', 'Your name')
)

export default class Worker extends ReadyResource {
  constructor (pipe, args) {
    super()

    this.pipe = pipe
    this.args = args

    this.store = null
    this.swarm = null
    this.room = null
  }

  async _open () {
    cmd.parse(this.args)
    const {
      invite,
      name = `User ${Date.now()}`
    } = cmd.flags

    this.store = new Corestore(Pear.app.storage)
    this.swarm = new Hyperswarm()
    this.swarm.on('connection', (conn) => this.store.replicate(conn))

    this.room = new ChatRoom(this.store, this.swarm, invite)
    this.room.on('update', () => this._getMessages())

    await this.room.ready()
    this._write('invite', await this.room.getInvite())
    await this._getMessages()

    const lineDecoder = new NewlineDecoder()
    this.pipe.on('data', async (data) => {
      const str = Buffer.from(data).toString()
      for (const line of lineDecoder.push(str)) {
        try {
          const obj = JSON.parse(line)
          if (obj.tag === 'add-message') {
            await this.room.addMessage(obj.data, { name, at: Date.now() })
          }
        } catch (err) {
          this._write('error', `${line} ~ ${err}`)
        }
      }
    })
  }

  _close () {
    this.room?.close()
    this.swarm?.destroy()
    this.store?.close()
  }

  async _getMessages () {
    const messages = await this.room.getMessages()
    messages.sort((a, b) => a.info.at - b.info.at)
    this._write('messages', messages)
  }

  _write (tag, data) {
    this.pipe.write(JSON.stringify({ tag, data }) + '\n')
  }
}
