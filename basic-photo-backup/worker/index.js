import Corestore from 'corestore'
import debounce from 'debounceify'
import FramedStream from 'framed-stream'
import Hyperswarm from 'hyperswarm'
import { command, flag } from 'paparam'
import ReadyResource from 'ready-resource'

import VideoRoom from './video-room'
import HRPC from '../spec/hrpc'

const cmd = command('basic-photo-backup',
  flag('--invite|-i <invite>', 'Room invite'),
  flag('--name|-n <name>', 'Your name')
)

export default class Worker extends ReadyResource {
  constructor (pipe, storage, args) {
    super()

    this.pipe = pipe
    this.stream = new FramedStream(pipe)
    this.rpc = new HRPC(this.stream)
    this.stream.pause()

    this.storage = storage

    cmd.parse(args)
    this.invite = cmd.flags.invite
    this.name = cmd.flags.name || `User ${Date.now()}`

    this.store = new Corestore(storage)
    this.swarm = new Hyperswarm()
    this.swarm.on('connection', (conn) => this.store.replicate(conn))

    this.room = new VideoRoom(this.store, this.swarm, this.invite)

    this.debounceVideos = debounce(() => this._videos())
    this.debounceMessages = debounce(() => this._messages())
    this.room.on('update', async () => {
      await this.debounceVideos()
      await this.debounceMessages()
    })
  }

  async _open () {
    await this.store.ready()
    await this.room.ready()

    console.log('Invite:', await this.room.getInvite())

    this.rpc.onAddVideo(async (data) => {
      await this.room.addVideo(data, { name: this.name, at: Date.now() })
    })
    this.rpc.onAddMessage(async (data) => {
      await this.room.addMessage(data.text, { ...data.info, name: this.name, at: Date.now() })
    })
    this.stream.resume()
    await this.debounceVideos()
    await this.debounceMessages()
  }

  async _close () {
    await this.room.close()
    await this.swarm.destroy()
    await this.store.close()
  }

  async _videos () {
    const videos = await this.room.getVideos()
    videos.sort((a, b) => a.info.at - b.info.at)
    this.rpc.videos(videos)
  }

  async _messages () {
    const messages = await this.room.getMessages()
    messages.sort((a, b) => a.info.at - b.info.at)
    this.rpc.messages(messages)
  }
}
