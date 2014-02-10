Comment = require('../lib/comment')
parse   = require('../lib/parse')

describe 'Comment', ->

  describe 'toString()', ->

    it 'inserts default spaces', ->
      comment = new Comment(text: 'hi')
      comment.toString().should.eql('/* hi */')

    it 'clone spaces from another comment', ->
      root    = parse('/*hello*/')
      comment = new Comment(text: 'world')
      root.append(comment)

      comment.toString().should.eql('/*world*/')
