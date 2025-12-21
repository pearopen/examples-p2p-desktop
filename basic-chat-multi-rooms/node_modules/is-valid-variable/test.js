const test = require('brittle')
const isValidVariable = require('./')

test('basic', function (t) {
  t.not(isValidVariable('const'))
  t.ok(isValidVariable('constantine'))
  t.not(isValidVariable('64'))
  t.ok(isValidVariable('x64'))
  t.ok(isValidVariable('$'))
  t.ok(isValidVariable('FoobarBaz'))
  t.not(isValidVariable('Foo bar Baz'))
  t.ok(isValidVariable('_'))
  t.not(isValidVariable('+'))
})
