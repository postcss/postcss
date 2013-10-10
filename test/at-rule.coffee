AtRule = require('../lib/postcss/at-rule')

describe 'AtRule', ->

  it 'includes mixin by first child type', ->
    rule = new AtRule()
    rule.append({ type: 'rule' })
    rule.rules.should.be.instanceOf(Array)

    rule = new AtRule()
    rule.append({ type: 'decl' })
    rule.decls.should.be.instanceOf(Array)
