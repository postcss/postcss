'use strict'

let { fileURLToPath, pathToFileURL } = require('url')
let { resolve, isAbsolute } = require('path')
let { nanoid } = require('nanoid/non-secure')
let lineColumn = require('line-column')

let terminalHighlight = require('./terminal-highlight')
let CssSyntaxError = require('./css-syntax-error')
let PreviousMap = require('./previous-map')

class Input {
  constructor (css, opts = {}) {
    if (
      css === null ||
      typeof css === 'undefined' ||
      (typeof css === 'object' && !css.toString)
    ) {
      throw new Error(`PostCSS received ${css} instead of CSS string`)
    }

    this.css = css.toString()

    if (this.css[0] === '\uFEFF' || this.css[0] === '\uFFFE') {
      this.hasBOM = true
      this.css = this.css.slice(1)
    } else {
      this.hasBOM = false
    }

    if (opts.from) {
      if (/^\w+:\/\//.test(opts.from) || isAbsolute(opts.from)) {
        this.file = opts.from
      } else {
        this.file = resolve(opts.from)
      }
    }

    let map = new PreviousMap(this.css, opts)
    if (map.text) {
      this.map = map
      let file = map.consumer().file
      if (!this.file && file) this.file = this.mapResolve(file)
    }

    if (!this.file) {
      this.id = '<input css ' + nanoid(6) + '>'
    }
    if (this.map) this.map.file = this.from
  }

  fromOffset (offset) {
    let finder = lineColumn(this.css)
    this.fromOffset = i => finder.fromIndex(i)
    return this.fromOffset(offset)
  }

  error (message, line, column, opts = {}) {
    let result
    if (!column) {
      let pos = this.fromOffset(line)
      line = pos.line
      column = pos.col
    }
    let origin = this.origin(line, column)
    if (origin) {
      result = new CssSyntaxError(
        message,
        origin.line,
        origin.column,
        origin.source,
        origin.file,
        opts.plugin
      )
    } else {
      result = new CssSyntaxError(
        message,
        line,
        column,
        this.css,
        this.file,
        opts.plugin
      )
    }

    result.input = { line, column, source: this.css }
    if (this.file) {
      result.input.url = pathToFileURL(this.file).toString()
      result.input.file = this.file
    }

    return result
  }

  origin (line, column) {
    if (!this.map) return false
    let consumer = this.map.consumer()

    let from = consumer.originalPositionFor({ line, column })
    if (!from.source) return false

    let fromUrl

    if (isAbsolute(from.source)) {
      fromUrl = pathToFileURL(from.source)
    } else {
      fromUrl = new URL(
        from.source,
        this.map.consumer().sourceRoot || pathToFileURL(this.map.mapFile)
      )
    }

    let result = {
      url: fromUrl.toString(),
      line: from.line,
      column: from.column
    }

    if (fromUrl.protocol === 'file:') {
      result.file = fileURLToPath(fromUrl)
    }

    let source = consumer.sourceContentFor(from.source)
    if (source) result.source = source

    return result
  }

  mapResolve (file) {
    if (/^\w+:\/\//.test(file)) {
      return file
    }
    return resolve(this.map.consumer().sourceRoot || this.map.root || '.', file)
  }

  get from () {
    return this.file || this.id
  }
}

module.exports = Input
Input.default = Input

if (terminalHighlight && terminalHighlight.registerInput) {
  terminalHighlight.registerInput(Input)
}
