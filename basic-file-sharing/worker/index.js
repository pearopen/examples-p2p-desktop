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

    cmd.parse(args)
    this.invite = cmd.flags.invite
    this.name = cmd.flags.name || `User ${Date.now()}`

    this.store = new Corestore(storage)
    this.swarm = new Hyperswarm()
    this.swarm.on('connection', (conn) => this.store.replicate(conn))

    this.myDrivePath = path.join(this.storage, 'my-drive')
    this.sharedDrivesPath = path.join(this.storage, 'shared-drives')
    this.room = new DriveRoom(
      this.myDrivePath,
      this.sharedDrivesPath,
      this.store,
      this.swarm,
      this.invite,
      { name: this.name }
    )

    this.intervalFiles = null
  }

  async _open () {
    await this.store.ready()

    console.log(`My drive: ${this.myDrivePath}`)
    console.log(`Shared drives: ${this.sharedDrivesPath}`)
    await fs.promises.mkdir(this.myDrivePath, { recursive: true })
    await fs.promises.mkdir(this.sharedDrivesPath, { recursive: true })

    await this.room.ready()
    this._write('invite', await this.room.getInvite())

    this.intervalFiles = setInterval(async () => {
      const myDriveFiles = {
        key: 'my-drive (add your files here)',
        dir: `file://${this.myDrivePath}`,
        files: (await fs.promises.readdir(this.myDrivePath)).map((name) => ({
          name,
          url: `file://${path.join(this.myDrivePath, name)}`
        }))
      }

      const drives = await this.room.getDrives()
      const driveFiles = await Promise.all(drives.map(async (drive) => {
        const key = idEnc.normalize(drive.key)
        const dir = path.join(this.sharedDrivesPath, key)
        await fs.promises.mkdir(dir, { recursive: true })
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
      this._write('files', [myDriveFiles, ...driveFiles])
    }, 2000)
  }

  _close () {
    clearInterval(this.intervalFiles)
    this.room.close()
    this.swarm.destroy()
    this.store.close()
  }

  _write (tag, data) {
    this.pipe.write(JSON.stringify({ tag, data }) + '\n')
  }
}
