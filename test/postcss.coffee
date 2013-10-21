postcss = require('../lib/postcss')

Stylesheet = require('../lib/postcss/stylesheet')

describe 'postcss()', ->

  it 'creates processors list', ->
    postcss().should.eql { processors: [] }

  it 'saves processors list', ->
    a = -> 1
    b = -> 2
    postcss(a, b).should.eql { processors: [a, b] }

  describe 'parse()', ->

    it 'parses CSS', ->
      stylesheet = postcss.parse('a { }')
      stylesheet.should.be.an.instanceof(Stylesheet)

    it 'throws with file name', ->
      error = null
      try
        postcss.parse('a {', file: 'a.css')
      catch e
        error = e

      e.file.should.eql    'a.css'
      e.message.should.eql 'Unclosed block at line 1:1 in a.css'

describe 'PostCSS', ->

  describe 'use()', ->

    it 'adds new processors', ->
      a = -> 1
      processor = postcss()
      processor.use(a)
      processor.should.eql { processors: [a] }

    it 'returns itself', ->
      a = ->
      b = ->
      postcss().use(a).use(b).should.eql { processors: [a, b] }

  describe 'process()', ->

    it 'calls all processors', ->
      calls = ''
      a = -> calls += 'a'
      b = -> calls += 'b'

      postcss(a, b).process('')
      calls.should.eql 'ab'

    it 'parses, convert and stringify CSS', ->
      a = (css) -> css.should.be.an.instanceof(Stylesheet)
      postcss(a).process('a { }').should.have.type('string')
