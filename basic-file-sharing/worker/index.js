import Corestore from 'corestore'
import fs from 'fs'
import idEnc from 'hypercore-id-encoding'
import Hyperswarm from 'hyperswarm'
import { command, flag } from 'paparam'
import path from 'path'
import ReadyResource from 'ready-resource'

import DriveRoom from './drive-room'

const cmd = command('basic-file-sharing',
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
    this.intervalFiles = null
  }

  async _open () {
    cmd.parse(this.args)
    const {
      invite,
      name = `User ${Date.now()}`
    } = cmd.flags

    this.store = new Corestore(path.join(this.storage, 'store'))
    await this.store.ready()

    this.swarm = new Hyperswarm()
    this.swarm.on('connection', (conn) => this.store.replicate(conn))

    const myDrivePath = path.join(this.storage, 'my-drive')
    const sharedDrivesPath = path.join(this.storage, 'shared-drives')
    console.log(`My drive: ${myDrivePath}`)
    console.log(`Shared drives: ${sharedDrivesPath}`)
    await fs.promises.mkdir(myDrivePath, { recursive: true })
    await fs.promises.mkdir(sharedDrivesPath, { recursive: true })

    this.room = new DriveRoom(myDrivePath, sharedDrivesPath, this.store, this.swarm, invite, { name })
    await this.room.ready()
    this._write('invite', await this.room.getInvite())

    this.intervalFiles = setInterval(async () => {
      const drives = await this.room.getDrives()
      const driveFiles = await Promise.all(drives.map(async (drive) => {
        const key = idEnc.normalize(drive.key)
        const dir = path.join(sharedDrivesPath, key)
        const files = await fs.promises.readdir(dir, { recursive: true }).catch((err) => {
          if (err.code === 'ENOENT') return []
          throw err
        })
        return {
          key,
          dir: `file://${dir}`,
          files: files.map((name) => ({ name, url: `file://${path.join(dir, name)}` }))
        }
      }))
      this._write('files', driveFiles)
    }, 2000)
  }

  _close () {
    clearInterval(this.intervalFiles)
    this.room?.close()
    this.swarm?.destroy()
    this.store?.close()
  }

  _write (tag, data) {
    this.pipe.write(JSON.stringify({ tag, data }) + '\n')
  }
}
