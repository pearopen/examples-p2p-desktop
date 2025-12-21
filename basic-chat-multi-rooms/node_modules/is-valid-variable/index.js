module.exports = isValidExport

function isValidExport (name) {
  switch (name) {
    case 'break':
    case 'case':
    case 'catch':
    case 'class':
    case 'const':
    case 'continue':
    case 'debugger':
    case 'default':
    case 'delete':
    case 'do':
    case 'else':
    case 'enum':
    case 'export':
    case 'extends':
    case 'false':
    case 'finally':
    case 'for':
    case 'function':
    case 'if':
    case 'import':
    case 'in':
    case 'instanceof':
    case 'let':
    case 'new':
    case 'null':
    case 'return':
    case 'super':
    case 'switch':
    case 'this':
    case 'throw':
    case 'true':
    case 'try':
    case 'typeof':
    case 'var':
    case 'void':
    case 'while':
    case 'with':
    case 'yield':
      return false
  }

  return /^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(name)
}
