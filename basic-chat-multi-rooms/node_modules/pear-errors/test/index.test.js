'use strict'
const test = require('brittle')
const PearError = require('..')

test('exports shape', (t) => {
  t.is(typeof PearError, 'function')
  t.is(typeof PearError.known, 'function')
  const statics = Object.getOwnPropertyNames(PearError).filter(n => n.startsWith('ERR_'))
  t.ok(statics.length > 0)
})

test('known() lists all ERR_* statics', (t) => {
  const statics = Object.getOwnPropertyNames(PearError).filter(n => n.startsWith('ERR_'))
  const listed = PearError.known()
  t.alike(new Set(listed), new Set(statics))
})

test('construct via helper sets name/code/message and instanceof', (t) => {
  const err = PearError.ERR_INVALID_INPUT('bad input')
  t.ok(err instanceof Error)
  t.ok(err instanceof PearError)
  t.is(err.name, 'ERR_INVALID_INPUT')
  t.is(err.code, 'ERR_INVALID_INPUT')
  t.is(err.message, 'bad input')
})

test('info is propagated (object)', (t) => {
  const info = { foo: 1 }
  const err = PearError.ERR_INVALID_CONFIG('cfg', info)
  t.is(err.info, info)
})

test('info default behaviors', (t) => {
  const a = PearError.ERR_INVALID_INPUT('x')
  t.is(a.info, null)

  const b = PearError.ERR_PERMISSION_REQUIRED('need perm')
  t.alike(b.info, {})
})

test('stack vs stackless', (t) => {
  const normal = PearError.ERR_UNKNOWN('oops')
  t.is(typeof normal.stack, 'string')
  t.not(normal.stack, normal.message)

  const legacy = PearError.ERR_LEGACY('old')
  t.is(legacy.stack, 'old')
})

test('all helpers return PearError instances with matching names', (t) => {
  const names = Object.getOwnPropertyNames(PearError).filter(n => n.startsWith('ERR_'))
  for (const n of names) {
    const fn = PearError[n]
    t.is(typeof fn, 'function')
    const e = fn('msg')
    t.ok(e instanceof PearError)
    t.is(e.name, n)
    t.is(e.code, n)
  }
})

test('known() with extra prefixes does not break', (t) => {
  const list = PearError.known('ERR_', 'NOPE_')
  t.ok(Array.isArray(list))
  t.ok(list.every(n => n.startsWith('ERR_')))
})

test('known function with default prefix', async function (t) {
  t.plan(1)

  const knownErrors = PearError.known()
  t.ok(Array.isArray(knownErrors) && knownErrors.length > 0)
})

test('known function with custom prefix', async function (t) {
  t.plan(1)

  const knownErrors = PearError.known('ERR_INVALID')
  t.ok(Array.isArray(knownErrors) && knownErrors.length > 0)
})

test('known function with multiple prefixes', async function (t) {
  t.plan(1)

  const knownErrors = PearError.known('ERR_INVALID', 'ERR_PERMISSION')
  t.ok(Array.isArray(knownErrors) && knownErrors.length > 0)
})

test('known function with more than two prefixes', async function (t) {
  t.plan(1)

  const knownErrors = PearError.known('ERR_INVALID', 'ERR_PERMISSION', 'ERR_INTERNAL')
  t.ok(Array.isArray(knownErrors) && knownErrors.length > 0)
})

test('known function with no matching prefix', async function (t) {
  t.plan(2)

  const knownErrors = PearError.known('ERR_NON_EXISTENT')
  t.ok(Array.isArray(knownErrors))
  t.is(knownErrors.length, 0)
})

test('captureStackTrace filters out PearError frame', async function (t) {
  t.plan(2)

  const pearErr = PearError.ERR_INVALID_INPUT('invalid input')

  t.is(pearErr.stack.includes('PearError'), false)

  function ERR_CUSTOM (msg) {
    return new Error(msg, ERR_CUSTOM)
  }
  const customErr = ERR_CUSTOM('custom error')
  t.is(customErr.stack.includes('ERR_CUSTOM'), true)
})
