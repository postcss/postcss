Stylesheet = require('../lib/postcss/stylesheet')
parse      = require('../lib/postcss/parse')

fs   = require('fs')
read = (file) -> fs.readFileSync(__dirname + '/cases/parse/' + file)

describe 'postcss.parse()', ->

  it 'works with file reads', ->
    file = fs.readFileSync(__dirname + '/cases/parse/atrule-empty.css')
    parse(file).should.be.instanceOf(Stylesheet)

  describe 'empty file', ->

    it 'parses empty file', ->
      parse('').should.eql { after: '', rules: [] }

    it 'parses spaces', ->
      parse(" \n ").should.eql { after: " \n ", rules: [] }

    it 'parses comment', ->
      parse("/* a */").should.eql { after: "/* a */", rules: [] }

  fs.readdirSync(__dirname + '/cases/parse/').forEach (file) ->
    return unless file.match(/\.css$/)

    it "parses #{ file }", ->
      css  = parse(read(file))
      json = read(file.replace(/\.css$/, '.json')).toString().trim()
      JSON.stringify(css, null, 4).should.eql(json)

  describe 'errors', ->

    it 'throws on unclosed blocks', ->
      ( -> parse("\na {\n") ).should.throw('Unclosed block at line 2:1')

    it 'throws on unclosed blocks', ->
      ( -> parse("a {{}}") ).should.throw(/^Unexpected \{/)

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
      ( -> parse('@page { a { } }') ).should.throw(/^Unexpected \{/)

    it 'adds properties to error', ->
      error = null
      try
        parse('a {')
      catch e
        error = e

      error.line.should   == 1
      error.column.should == 1
      error.source.should == 'a {'
