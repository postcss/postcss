SyntaxError = require('../lib/syntax-error')

describe 'SyntaxError', ->

  it 'contain information about syntax error', ->
    error = new SyntaxError('LOL', 'w00t', line: 42, column: 11)

    error.line.should.eql 42
    error.column.should.eql 11
    error.message.should.eql "Can't parse CSS: LOL at line 42:11"

  it 'when file name is given it adds information about it to message property', ->
    error = new SyntaxError('LOL', 'w00t', {line: 42, column: 11}, 'test.coffee')

    error.message.should.eql "Can't parse CSS: LOL at line 42:11 in test.coffee"
