exports.INVALID_PACKAGE_CONFIG = function (filename) {
  const err = new Error('INVALID_PACKAGE_CONFIG: Invalid package config while importing ' + filename)
  err.code = 'INVALID_PACKAGE_CONFIG'
  return err
}

exports.ENOENT = function (filename) {
  const err = new Error('ENOENT: ' + filename)
  err.code = 'ENOENT'
  return err
}
