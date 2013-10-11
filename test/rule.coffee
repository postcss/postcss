Rule = require('../lib/postcss/rule')

describe 'Rule', ->

  it 'fast sets properties', ->
    rule = new Rule(selector: 'a')
    rule.selector.should.eql('a')
