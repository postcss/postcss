SourceMap = require('source-map')
postcss   = require('../lib/postcss')
Result    = require('../lib/result')

describe 'postcss.Root', ->

  it 'allows to build own CSS', ->
    root = new postcss.Root()
    rule = new postcss.Rule(selector: 'a')
    rule.append( new postcss.Declaration(prop: 'color', value: 'black') )
    root.append( rule )

    root.toString().should.eql 'a {color: black}'

describe 'postcss()', ->

  it 'creates processors list', ->
    postcss().should.eql { processors: [] }

  it 'saves processors list', ->
    a = -> 1
    b = -> 2
    postcss(a, b).should.eql { processors: [a, b] }

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

    it 'processes CSS', ->
      processor = postcss (css) ->
        css.eachRule (rule) ->
          return unless rule.selector.match(/::(before|after)/)
          unless rule.some( (i) -> i.prop == 'content' )
            rule.prepend(prop: 'content', value: '""')

      processor.process('a::before{}').css.should.eql('a::before{content: ""}')

    it 'throws with file name', ->
      error = null
      try
        postcss().process('a {', from: 'A')
      catch e
        error = e

      e.file.should.eql    'A'
      e.message.should.eql 'Can\'t parse CSS: Unclosed block at line 1:1 in A'

    it 'allows to replace Root', ->
      processor = postcss -> new postcss.Root()
      processor.process('a {}').css.should.eql('')

    it 'returns Result object', ->
      result = postcss().process('a{}')
      result.should.be.an.instanceOf(Result)
      result.css.should.eql        'a{}'
      result.toString().should.eql 'a{}'

    it 'calls all processors', ->
      calls = ''
      a = -> calls += 'a'
      b = -> calls += 'b'

      postcss(a, b).process('')
      calls.should.eql 'ab'

    it 'parses, convert and stringify CSS', ->
      a = (css) -> css.should.be.an.instanceof(postcss.Root)
      postcss(a).process('a {}').css.should.have.type('string')

    it 'adds map field only on request', ->
      postcss().process('a {}').should.not.have.property('map')

    it 'generate right source map', ->
      css       = "a {\n  color: black;\n  }"
      processor = postcss (css) ->
        css.eachRule (rule) ->
          rule.selector = 'strong'
        css.eachDecl (decl) ->
          changed = decl.clone(prop: 'background')
          decl.parent.prepend(changed)

      result = processor.process(css, from: 'a.css', to: 'b.css', map: true)
      map    = new SourceMap.SourceMapConsumer(result.map)

      map.file.should.eql('b.css')

      map.originalPositionFor(line: 1, column: 0).should.eql
        source: 'a.css'
        line:   1
        column: 0
        name:   null
      map.originalPositionFor(line: 2, column: 2).should.eql
        source: 'a.css'
        line:   2
        column: 2
        name:   null
      map.originalPositionFor(line: 3, column: 2).should.eql
        source: 'a.css'
        line:   2
        column: 2
        name:   null

    it 'changes previous source map', ->
      css = 'a { color: black }'

      doubler = postcss (css) ->
        css.eachDecl (decl) -> decl.parent.prepend(decl.clone())
      doubled = doubler.process css,
        from: 'a.css'
        to:   'b.css'
        map:  true

      lighter = postcss (css) ->
        css.eachDecl (decl) -> decl.value = 'white'
      lighted = lighter.process doubled.css,
        from: 'b.css'
        to:   'c.css'
        map:  doubled.map

      map = new SourceMap.SourceMapConsumer(lighted.map)

      map.originalPositionFor(line: 1, column: 18).should.eql
        source: 'a.css'
        line:   1
        column: 4
        name:   null
