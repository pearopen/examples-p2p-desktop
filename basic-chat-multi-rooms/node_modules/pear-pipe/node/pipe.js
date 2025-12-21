module.exports = class Pipe extends require('net').Socket {
  constructor(fd) {
    super({ fd })
  }
}
