Rule = require('../lib/rule')

describe 'Rule', ->

  it 'initializes with properties', ->
    rule = new Rule(selector: 'a')
    rule.selector.should.eql('a')

  describe 'toString()', ->

    it 'inserts default spaces', ->
      rule = new Rule(selector: 'a')
      rule.toString().should.eql('a {}')
