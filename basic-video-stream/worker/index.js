import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'
import NewlineDecoder from 'newline-decoder'
import { command, flag } from 'paparam'
import ReadyResource from 'ready-resource'

import VideoStreamRoom from './video-stream-room'

const cmd = command('basic-video-stream',
  flag('--invite|-i <invite>', 'Room invite'),
  flag('--name|-n <name>', 'Your name')
)

export default class Worker extends ReadyResource {
  constructor (pipe, storage, args) {
    super()

    this.pipe = pipe
    this.storage = storage
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

    this.store = new Corestore(this.storage)
    await this.store.ready()

    this.swarm = new Hyperswarm()
    this.swarm.on('connection', (conn) => this.store.replicate(conn))

    this.room = new VideoStreamRoom(this.store, this.swarm, invite)
    this.room.on('update', async () => {
      await this._getMessages()
      await this._getVideos()
    })

    await this.room.ready()
    this._write('invite', await this.room.getInvite())
    await this._getMessages()
    await this._getVideos()

    const lineDecoder = new NewlineDecoder()
    this.pipe.on('data', async (data) => {
      const str = Buffer.from(data).toString()
      for (const line of lineDecoder.push(str)) {
        try {
          const obj = JSON.parse(line)
          if (obj.tag === 'add-message') {
            await this.room.addMessage(obj.data.text, { ...obj.data.info, name, at: Date.now() })
          } else if (obj.tag === 'add-video') {
            await this.room.addVideo(obj.data, { name, at: Date.now() })
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

  async _getVideos () {
    const videos = await this.room.getVideos()
    videos.sort((a, b) => a.info.at - b.info.at)
    this._write('videos', videos)
  }

  _write (tag, data) {
    this.pipe.write(JSON.stringify({ tag, data }) + '\n')
  }
}
