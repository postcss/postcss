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
      root = parse("a{\n  }")
      rule = new Rule(selector: 'b')
      root.append(rule)

      rule.toString().should.eql("b{\n  }")

    it 'use different spaces for empty rules', ->
      root = parse("a { }\nb {\n  color: black\n  }")
      rule = new Rule(selector: 'em')
      root.append(rule)

      rule.toString().should.eql("\nem { }")

      rule.append(prop: 'top', value: '0')
      rule.toString().should.eql("\nem {\n  top: 0\n  }")

    it 'calculates after depends on childs', ->
      rule = new Rule(selector: 'a')
      rule.toString().should.eql 'a {}'

      rule.append(prop: 'color', value: 'black', before: ' ')
      rule.toString().should.eql 'a { color: black }'

      rule.first.before = "\n  "
      rule.toString().should.eql "a {\n  color: black\n}"
