mozilla = require('source-map')
postcss = require('../lib/postcss')
fs      = require('fs-extra')

consumer = (map) -> new mozilla.SourceMapConsumer.fromSourceMap(map)

describe 'source maps', ->
  before ->
    @dir = __dirname + '/fixtures'

    @doubler = postcss (css) ->
      css.eachDecl (decl) -> decl.parent.prepend(decl.clone())
    @lighter = postcss (css) ->
      css.eachDecl (decl) -> decl.value = 'white'

  afterEach ->
    fs.removeSync(@dir) if fs.existsSync(@dir)

  it 'adds map field only on request', ->
    (postcss().process('a {}').map == undefined).should.be.true

  it 'return map generator', ->
    postcss().process('a {}', map: true).map
      .should.be.instanceOf(mozilla.SourceMapGenerator)

  it 'generate right source map', ->
    css       = "a {\n  color: black;\n  }"
    processor = postcss (css) ->
      css.eachRule (rule) ->
        rule.selector = 'strong'
      css.eachDecl (decl) ->
        changed = decl.clone(prop: 'background')
        decl.parent.prepend(changed)

    result = processor.process(css, from: 'a.css', to: 'b.css', map: true)
    map    = consumer(result.map)

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

    doubled = @doubler.process css,
      from: 'a.css'
      to:   'b.css'
      map:  true

    lighted = @lighter.process doubled.css,
      from: 'b.css'
      to:   'c.css'
      map:
        prev: doubled.map

    consumer(lighted.map)
      .originalPositionFor(line: 1, column: 18).should.eql
        source: 'a.css'
        line:   1
        column: 4
        name:   null

  it 'adds source map annotation', ->
    css    = 'a { }/*# sourceMappingURL=a.css.map */'
    result = postcss().process css,
      from: 'a.css'
      to:   'b.css'
      map:  true

    result.css.should.eql "a { }\n/*# sourceMappingURL=b.css.map */"

  it 'misses source map annotation, if user ask', ->
    css    = 'a { }'
    result = postcss().process css,
      from: 'a.css'
      to:   'b.css'
      map:
        annotation: false

    result.css.should.eql(css)

  it 'misses source map annotation, if previous map missed it', ->
    css = 'a { }'

    step1 = postcss().process css,
      from: 'a.css'
      to:   'b.css'
      map:
        annotation: false

    step2 = postcss().process step1.css,
      from: 'b.css'
      to:   'c.css'
      map:
        prev: step1.map

    step2.css.should.eql(css)

  it 'uses user path in annotation, relative to `options.to`', ->
    # source/
    #   a.css
    # build/
    #   b.css
    #   maps/
    #     b.map
    #
    result = postcss().process 'a { }',
      from: 'source/a.css'
      to:   'build/b.css'
      map:
        annotation: 'maps/b.map'

    result.css.should.eql "a { }\n/*# sourceMappingURL=maps/b.map */"

    map = consumer(result.map)
    map.file.should.eql('../b.css')
    map.originalPositionFor(line: 1, column: 0).source.should.eql '../../source/a.css'

  it 'generates inline map', ->
    css = 'a { }'

    common = postcss().process css,
      from: 'a.css'
      to:   'b.css'
      map:   true

    inline = postcss().process css,
      from: 'a.css'
      to:   'b.css'
      map:
        inline: true

    (inline.map == undefined).should.be.true
    inline.css.should.match(/# sourceMappingURL=data:/)

    base64 = new Buffer(common.map).toString('base64')
    inline.css.should.endWith(base64 + ' */')

  it 'generates inline map by shortcut', ->
    inline = postcss().process 'a { }',
      from: 'a.css'
      to:   'b.css'
      map:  'inline'

    inline.css.should.match(/# sourceMappingURL=data:/)

  it 'generates inline map if previous map was inline', ->
    css = 'a { color: black }'

    common1 = @doubler.process css,
      from: 'a.css'
      to:   'b.css'
      map:   true
    common2 = @lighter.process common1.css,
      from: 'b.css'
      to:   'c.css'
      map:
        prev: common1.map

    inline1 = @doubler.process css,
      from: 'a.css'
      to:   'b.css'
      map:
        inline: true
    inline2 = @lighter.process inline1.css,
      from: 'b.css'
      to:   'c.css'

    base64 = new Buffer(common2.map).toString('base64')
    inline2.css.should.endWith(base64 + ' */')

  it 'allows change map type', ->
    css = 'a { }'

    step1 = postcss().process css,
      from: 'a.css'
      to:   'b.css'
      map:
        inline: true

    step2 = postcss().process step1.css,
      from: 'b.css'
      to:   'c.css'
      map:
        inline: false

    step2.should.have.property('map')
    step2.css.should.not.match(/# sourceMappingURL=data:/)

  it 'miss check files on requires', ->
    step1 = @doubler.process 'a { }',
      from: 'a.css'
      to:    @dir + '/a.css'
      map:   true

    fs.outputFileSync(@dir + '/a.css.map', step1.map)
    step2 = @lighter.process step1.css,
      from: @dir + '/a.css'
      to:  'b.css'
      map:  false

    (step2.map == undefined).should.be.true

  it 'works in subdirs', ->
    result = @doubler.process 'a { }',
      from: 'from/a.css'
      to:   'out/b.css'
      map:   true

    result.css.should.match(/sourceMappingURL=b.css.map/)

    map = consumer(result.map)
    map.file.should.eql 'b.css'
    map.sources.should.eql ['../from/a.css']

  it 'uses map from subdir', ->
    step1 = @doubler.process 'a { }',
      from: 'a.css'
      to:   'out/b.css'
      map:   true

    step2 = @doubler.process step1.css,
      from: 'out/b.css'
      to:   'out/two/c.css'
      map:
        prev: step1.map

    consumer(step2.map)
      .originalPositionFor(line: 1, column: 0).source.should.eql '../../a.css'

    step3 = @doubler.process step2.css,
      from: 'c.css'
      to:   'd.css'
      map:
        prev: step2.map

    consumer(step3.map)
      .originalPositionFor(line: 1, column: 0).source.should.eql '../../a.css'

  it 'uses map from subdir - inlined', ->
    step1 = @doubler.process 'a { }',
      from: 'a.css'
      to:   'out/b.css'
      map:
        inline: true

    step2 = @doubler.process step1.css,
      from: 'out/b.css'
      to:   'out/two/c.css'
      map:
        inline: false

    consumer(step2.map)
      .originalPositionFor(line: 1, column: 0).source.should.eql '../../a.css'

  it 'uses map from subdir - written as a file', ->
    step1 = @doubler.process 'a { }',
      from: 'source/a.css'
      to:   'one/b.css'
      map:
        annotation: 'maps/b.css.map'

    consumer(step1.map)
      .originalPositionFor(line: 1, column: 0).source.should.eql '../../source/a.css'

    fs.outputFileSync(@dir + '/one/maps/b.css.map', step1.map)

    step2 = @doubler.process step1.css,
      from: @dir + '/one/b.css'
      to:   @dir + '/two/c.css'
      map:  true

    consumer(step2.map)
      .originalPositionFor(line: 1, column: 0).source.should.eql '../source/a.css'

  it 'works with different types of maps', ->
    step1 = @doubler.process('a { }', from: 'a.css', to: 'b.css', map: true)

    map  = step1.map
    maps = [map, consumer(map), map.toJSON(), map.toString()]

    for map in maps
      step2 = @doubler.process step1.css,
        from: 'b.css'
        to: 'c.css'
        map:
          prev: map
      consumer(step2.map)
        .originalPositionFor(line: 1, column: 0).source.should.eql 'a.css'

  it 'sets source content on request', ->
    result = @doubler.process 'a { }',
      from: 'a.css'
      to:   'out/b.css'
      map:
        sourcesContent: true

    consumer(result.map).sourceContentFor('../a.css').should.eql('a { }')

  it 'sets source content if previous have', ->
    step1 = @doubler.process 'a { }',
      from: 'a.css'
      to:   'out/a.css'
      map:
        sourcesContent: true

    file1 = postcss.parse(step1.css, from: 'a.css', map: { prev: step1.map })
    file2 = postcss.parse('b { }',   from: 'b.css')

    file2.append(file1.rules[0].clone())
    step2 = file2.toResult(to: 'c.css')

    consumer(step2.map).sourceContentFor('b.css').should.eql('b { }')

  it 'miss source content on request', ->
    step1 = @doubler.process 'a { }',
      from: 'a.css'
      to:   'out/a.css'
      map:
        sourcesContent: true

    file1 = postcss.parse(step1.css, from: 'a.css', map: { prev: step1.map })
    file2 = postcss.parse('b { }',   from: 'b.css')

    file2.append(file1.rules[0].clone())
    step2 = file2.toResult(to: 'c.css', map: { sourcesContent: false })

    map = consumer(step2.map)
    (!!map.sourceContentFor('b.css')).should.be.false
    (!!map.sourceContentFor('../a.css')).should.be.false
