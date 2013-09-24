AtRule = require('../lib/postcss/at_rule')

describe 'AtRule', ->

  describe 'push()', ->

    it 'changes content type', ->
      @rule = new AtRule()
      @rule.content.should.eql('empty')

      @rule.push({ type: 'decl' })
      @rule.content.should.eql('decls')
      @rule.decls.should.eql [{ type: 'decl' }]
