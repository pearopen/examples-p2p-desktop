/* global Bare */
const signals = require('#signals')
const safetyCatch = require('safety-catch')
const program = global.Bare ? global.Bare : global.process
const handlers = []

let exiting = false

const sigint = (signum) => {
  program.exitCode = 130
  onexit(() => {
    signals.kill(program.pid, signum)
  })
}

const sigterm = (signum) => {
  program.exitCode = 143
  onexit(() => {
    signals.kill(program.pid, signum)
  })
}

signals.once('SIGINT', sigint)
signals.once('SIGTERM', sigterm)

function onexit(ondone) {
  if (exiting) return
  exiting = true

  program.removeListener('beforeExit', onexit)

  const order = []

  for (const h of handlers.sort((a, b) => b.position - a.position)) {
    if (!order.length || order[order.length - 1][0].position !== h.position)
      order.push([])
    order[order.length - 1].push(h)
  }

  const loopdown = loop()

  if (ondone) loopdown.finally(ondone)

  function loop() {
    if (!order.length) return Promise.resolve()
    return Promise.allSettled(order.pop().map(run)).then(loop, loop)
  }
}

async function run(h) {
  try {
    await h.fn()
  } catch (e) {
    safetyCatch(e)
  }
}

function setup() {
  program.prependListener('beforeExit', onexit)
}

function cleanup() {
  program.removeListener('beforeExit', onexit)
  signals.removeListener('SIGINT', sigint)
  signals.removeListener('SIGTERM', sigterm)
}

function gracedown(fn, position = 0) {
  if (handlers.length === 0) setup()
  const handler = { position, fn }
  handlers.push(handler)

  return function unregister(unlisten = true) {
    const i = handlers.indexOf(handler)
    if (i > -1) handlers.splice(i, 1)
    if (unlisten && handlers.length === 0) cleanup()
  }
}

module.exports = gracedown
