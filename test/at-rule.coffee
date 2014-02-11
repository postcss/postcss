Declaration = require('../lib/declaration')
AtRule      = require('../lib/at-rule')
parse       = require('../lib/parse')
Rule        = require('../lib/rule')

describe 'AtRule', ->

  it 'includes mixin by first child type', ->
    for name in ['append', 'prepend']
      rule = new AtRule()
      rule[name]( new Rule() )
      rule.rules.should.be.instanceOf(Array)
      rule.rules.length.should.eql(1)

      rule = new AtRule()
      rule[name]( new AtRule() )
      rule.rules.should.be.instanceOf(Array)
      rule.rules.length.should.eql(1)

      rule = new AtRule()
      rule[name]( new Declaration() )
      rule.decls.should.be.instanceOf(Array)
      rule.decls.length.should.eql(1)

  it 'initializes with properties', ->
    rule = new AtRule(name: 'encoding', params: '"utf-8"')

    rule.name.should.eql('encoding')
    rule.params.should.eql('"utf-8"')

    rule.toString().should.eql('@encoding "utf-8";')

  describe 'clone()', ->

    it 'clones with mixin', ->
      rule = new AtRule(name: 'page', after: '')
      rule.append(new Rule(selector: 'a'))

      rule.clone().toString().should.eql('@page {a {}}')

  describe 'toString()', ->

    it 'inserts default spaces', ->
      rule = new AtRule(name: 'page', params: 1, decls: [])
      rule.toString().should.eql('@page 1 {}')

    it 'clone spaces from another comment', ->
      root = parse('@page{}')
      rule = new AtRule(name: 'keyframes', params: 'anim', rules: [])
      root.append(rule)

      rule.toString().should.eql('@keyframes anim{}')
