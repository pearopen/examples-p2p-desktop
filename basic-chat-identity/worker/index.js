/* global Pear */
import FramedStream from 'framed-stream'
import fs from 'fs'
import Identity from 'keet-identity-key'
import { command, flag } from 'paparam'
import path from 'path'

import HRPC from '../spec/hrpc'
import WorkerTask from './worker-task'

const cmd = command('basic-chat-identity',
  flag('--invite|-i <invite>', 'Room invite'),
  flag('--name|-n <name>', 'Your name'),
  flag('--mnemonic|-m <mnemonic>', 'Identity mnemonic (24 words)'),
  flag('--reset', 'Reset')
)

export default async function runWorker (pipe) {
  const stream = new FramedStream(pipe)
  const rpc = new HRPC(stream)
  stream.pause()

  const storage = path.join(Pear.app.storage, 'corestore')
  cmd.parse(Pear.app.args)
  if (cmd.flags.reset) {
    await fs.promises.rm(storage, { recursive: true, force: true })
  }

  let mnemonic = cmd.flags.mnemonic
  const mnemonicPath = path.join(Pear.app.storage, 'identity-mnemonic.txt')
  if (!mnemonic) {
    mnemonic = await fs.promises.readFile(mnemonicPath, 'utf-8').catch((err) => {
      if (err.code !== 'ENOENT') throw err
    })
    mnemonic = mnemonic || Identity.generateMnemonic()
  }
  await fs.promises.writeFile(mnemonicPath, mnemonic)

  const workerTask = new WorkerTask(rpc, storage, mnemonic, cmd.flags)
  Pear.teardown(() => workerTask.close())
  await workerTask.ready()
  stream.resume()

  console.log(`Storage: ${storage}`)
  console.log(`Name: ${workerTask.name}`)
  console.log(`Mnemonic (24 words): ${workerTask.mnemonic}`)
  console.log(`Invite: ${await workerTask.room.getInvite()}`)

  return workerTask
}
