Rule = require('../lib/postcss/rule')

describe 'Rule', ->

  it 'initializes with properties', ->
    rule = new Rule(selector: 'a')
    rule.selector.should.eql('a')
