/** @typedef {import('pear-interface')} */
/* global Pear */
import Bridge from 'pear-bridge'
import Runtime from 'pear-electron'

import runWorker from './worker'

const bridge = new Bridge()
await bridge.ready()

const runtime = new Runtime()
const pipe = await runtime.start({ bridge })
const workerTask = await runWorker(pipe)
pipe.on('close', async () => {
  await workerTask.close()
  Pear.exit()
})
