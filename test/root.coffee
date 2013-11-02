Root  = require('../lib/root')
Rule  = require('../lib/rule')
parse = require('../lib/parse')

fs = require('fs')

describe 'Root', ->

  describe 'toString()', ->

    fs.readdirSync(__dirname + '/cases/parse/').forEach (file) ->
      return unless file.match(/\.css$/)

      it "stringify #{ file }", ->
        css = fs.readFileSync(__dirname + '/cases/parse/' + file).toString()
        parse(css).toString().should.eql(css)

    it 'saves one line on insert', ->
      css = parse("a {}")
      css.prepend(new Rule(selector: 'em'))

      css.toString().should.eql("em {}a {}")

    it 'fixes spaces on insert before first', ->
      css = parse("a {}\nb {}")
      css.prepend(new Rule(selector: 'em'))

      css.toString().should.eql("em {}\na {}\nb {}")

    it 'fixes spaces on insert before only one fule', ->
      css = parse("a {}\n")
      css.insertBefore(css.rules[0], new Rule(selector: 'em'))

      css.toString().should.eql("em {}\na {}\n")
