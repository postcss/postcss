parse = require('../lib/postcss/parse')

fs = require('fs')

test = (name) ->
  file = __dirname + '/cases/' + name
  css  = fs.readFileSync(file + '.css').toString()
  json = fs.readFileSync(file + '.json').toString()
  parse(css).should.eql JSON.parse(json)

describe 'postcss.parse()', ->

  describe 'empty file', ->

    it 'parses empty file', ->
      parse('').should.eql { childs: [], after: '' }

    it 'parses spaces', ->
      parse(" \n ").should.eql { childs: [], after: " \n " }

    it 'parses comment', ->
      parse("/* a */").should.eql { childs: [], after: "/* a */" }

  describe 'at-rule', ->

    it 'parses',                     -> test('atrule-empty')
    it 'parses without semicolon',   -> test('atrule-no-semicolon')
    it 'saves raw params',           -> test('atrule-params')
    it 'parses without params',      -> test('atrule-no-params')
    it 'parses declarations inside', -> test('atrule-decls')
    it 'parses rules inside',        -> test('atrule-rules')

  describe 'rule', ->

    it 'parse selector',           -> test('selector')
    it 'parse declarations',       -> test('decls')
    it 'saves raw declaration',    -> test('raw-decl')
    it 'parses without semicolon', -> test('rule-no-semicolon')
    it 'ignores hacks',            -> test('prop-hacks')
    it 'parses many semicolons',   -> test('semicolons')
    it 'ignores quotes',           -> test('quotes')
    it 'parses comments',          -> test('comments')
    it 'parses importants',        -> test('important')

  describe 'errors', ->

    it 'throws on unclosed blocks', ->
      ( -> parse("\na {\n") ).should.throw('Unclosed block at line 2:1')

    it 'throws on unclosed blocks', ->
      ( -> parse("a {{}}") ).should.throw(/^Unexpected \{ in ruleset/)

    it 'throws on property without value', ->
      ( -> parse("a { b;}") ).should.throw(/^Missing property value/)
      ( -> parse("a { b }") ).should.throw(/^Missing property value/)

    it 'throws on unclosed comment', ->
      ( -> parse('\n/*\n\n ') ).should.throw('Unclosed comment at line 2:1')

    it 'throws on unclosed quote', ->
      ( -> parse('\n"\n\n ') ).should.throw('Unclosed quote at line 2:1')

    it 'throws on nameless at-rule', ->
      ( -> parse('@') ).should.throw(/^At-rule without name/)

    it 'throw on rules in declarations at-rule', ->
      ( -> parse('@page { a { } }') ).should.throw(/^Unexpected \{ in ruleset/)

    it 'adds properties to error', ->
      error = null
      try
        parse('a {')
      catch e
        error = e

      error.line.should   == 1
      error.column.should == 1
      error.source.should == 'a {'
