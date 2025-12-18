/* global Pear */
import FramedStream from 'framed-stream'
import { command, flag } from 'paparam'
import path from 'path'

import HRPC from '../spec/hrpc'
import WorkerTask from './worker-task'

const cmd = command('basic-video-stream',
  flag('--invite|-i <invite>', 'Room invite'),
  flag('--name|-n <name>', 'Your name')
)

export default async function runWorker (pipe) {
  const stream = new FramedStream(pipe)
  const rpc = new HRPC(stream)
  stream.pause()

  const storage = path.join(Pear.app.storage, 'basic-video-stream')
  cmd.parse(Pear.app.args)

  const workerTask = new WorkerTask(rpc, storage, cmd.flags)
  Pear.teardown(() => workerTask.close())
  await workerTask.ready()
  stream.resume()

  console.log('Storage', storage)
  console.log('Name', workerTask.name)
  console.log('Invite', await workerTask.room.getInvite())

  return workerTask
}
