parse = require('../lib/parse')
Rule  = require('../lib/rule')

describe 'Rule', ->

  it 'initializes with properties', ->
    rule = new Rule(selector: 'a')
    rule.selector.should.eql('a')

  describe 'selectors', ->

    it 'returns array', ->
      rule = new Rule(selector: 'a,b')
      rule.selectors.should.eql ['a', 'b']

    it 'trims selectors', ->
      rule = new Rule(selector: ".a\n, .b  , .c")
      rule.selectors.should.eql ['.a', '.b', '.c']

    it 'receive array', ->
      rule = new Rule(selector: 'a,b')
      rule.selectors = ['em', 'strong']
      rule.selector.should == 'em, strong'

  describe 'toString()', ->

    it 'inserts default spaces', ->
      rule = new Rule(selector: 'a')
      rule.toString().should.eql('a {}')

    it 'clone spaces from another rule', ->
      root = parse('a{}')
      rule = new Rule(selector: 'b')
      root.append(rule)

      rule.toString().should.eql('b{}')
