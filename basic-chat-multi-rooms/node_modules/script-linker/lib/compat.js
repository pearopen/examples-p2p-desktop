// preact doesn't handle loading multiple version of the same package
// which happens if both the ESM and CJS export maps are used.
// preact in this case includes full impls of preact in each shim causing an issue
// for now we just work around that by sniffing for preact which isn't great.

exports.isPreact = function (req) {
  if (!req) return false
  return req === 'preact' || req === 'preact-compat' || req.startsWith('preact/') || req.startsWith('@preact/')
}
