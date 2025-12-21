module.exports = class HTTPParserError extends Error {
  constructor(msg, fn = HTTPParserError, code = fn.name) {
    super(`${code}: ${msg}`)

    this.code = code

    if (Error.captureStackTrace) Error.captureStackTrace(this, fn)
  }

  get name() {
    return 'HTTPParserError'
  }

  static INVALID_MESSAGE(msg = 'Invalid HTTP message') {
    return new HTTPParserError(msg, HTTPParserError.INVALID_MESSAGE)
  }

  static INVALID_HEADER(msg = 'Invalid HTTP header') {
    return new HTTPParserError(msg, HTTPParserError.INVALID_HEADER)
  }

  static INVALID_CONTENT_LENGTH(msg = 'Invalid HTTP Content-Length') {
    return new HTTPParserError(msg, HTTPParserError.INVALID_CONTENT_LENGTH)
  }

  static INVALID_CHUNK_LENGTH(msg = 'Invalid HTTP chunk length') {
    return new HTTPParserError(msg, HTTPParserError.INVALID_CHUNK_LENGTH)
  }
}
