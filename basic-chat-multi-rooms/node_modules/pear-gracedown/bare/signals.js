const Signal = require('bare-signals')
const SignalEmitter = require('bare-signals/emitter')
const signals = new SignalEmitter()
signals.unref()
signals.kill = (pid, signum) => Signal.send(signum, pid)
module.exports = signals
