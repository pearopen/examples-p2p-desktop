/** @typedef {import('pear-interface')} */
/* global Pear */
import Bridge from 'pear-bridge'
import Runtime from 'pear-electron'

import Worker from './worker'

const bridge = new Bridge()
await bridge.ready()

const runtime = new Runtime()
const pipe = await runtime.start({ bridge })
const worker = new Worker(pipe, Pear.app.args)

pipe.on('close', async () => {
  await worker.close()
  Pear.exit()
})
Pear.teardown(() => worker.close())

await worker.ready()
