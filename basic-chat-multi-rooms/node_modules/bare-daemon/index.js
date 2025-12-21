const runtime = require('#runtime')
const binding = require('#binding')

exports.Daemon = class Daemon {
  constructor(pid) {
    this.pid = pid
  }
}

exports.spawn = function spawn(file, args, opts) {
  if (Array.isArray(args)) {
    args = [...args]
  } else if (args === null) {
    args = []
  } else {
    opts = args
    args = []
  }

  if (!opts) opts = {}

  args = args.map(String)

  const { cwd = runtime.cwd(), env = runtime.env } = opts

  const pairs = []

  for (const [key, value] of Object.entries(env)) {
    pairs.push(`${key}=${value}`)
  }

  const pid = binding.spawn(file, args, pairs, cwd)

  return new exports.Daemon(pid)
}
