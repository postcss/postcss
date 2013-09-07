postcss = require('../lib/postcss')

describe 'postcss()', ->

  it 'creates processors list', ->
    postcss().should.eql { processors: [] }

  it 'saves processors list', ->
    a = -> 1
    b = -> 2
    postcss(a, b).should.eql { processors: [a, b] }

describe 'PostCSS', ->

  describe '#use()', ->

    it 'adds new processors', ->
      a = -> 1
      processor = postcss()
      processor.use(a)
      processor.should.eql { processors: [a] }

    it 'returns itself', ->
      a = ->
      b = ->
      postcss().use(a).use(b).should.eql { processors: [a, b] }

  describe '#process()', ->

    it 'calls all processors', ->
      calls = []
      a = -> calls.push('a')
      b = -> calls.push('b')

      postcss(a, b).process('')
      calls.should.eql ['a', 'b']
