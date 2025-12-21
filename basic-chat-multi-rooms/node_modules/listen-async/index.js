module.exports = function listen (server, port, address) {
  return new Promise((resolve, reject) => {
    server.on('listening', done)
    server.on('error', done)

    if (address) server.listen(port, address)
    else server.listen(port)

    function done (err) {
      server.off('listening', done)
      server.off('error', done)

      if (err) reject(err)
      else resolve()
    }
  })
}
