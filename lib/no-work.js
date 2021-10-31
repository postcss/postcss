'use strict'

let { isClean, my } = require('./symbols')
let MapGenerator = require('./map-generator')
let stringify = require('./stringify')
let Container = require('./container')
let Document = require('./document')
let Result = require('./result')
let parse = require('./parse')
let Root = require('./root')

function cleanMarks(node) {
  node[isClean] = false
  if (node.nodes) node.nodes.forEach(i => cleanMarks(i))
  return node
}

let postcss = {}

class NoWork {
  constructor(processor, css, opts) {
    this.stringified = false
    this.processed = false

    let root
    if (
      typeof css === 'object' &&
      css !== null &&
      (css.type === 'root' || css.type === 'document')
    ) {
      root = cleanMarks(css)
    } else {
      let parser = parse
      if (parser.parse) parser = parser.parse

      root = parser(css, opts)

      if (root && !root[my]) {
        // istanbul ignore next
        Container.rebuild(root)
      }
    }

    this.result = new Result(processor, root, opts)
    this.helpers = { ...postcss, result: this.result, postcss }
  }

  get [Symbol.toStringTag]() {
    return 'NoWork'
  }

  get opts() {
    return this.result.opts
  }

  get css() {
    return this.stringify().css
  }

  get content() {
    return this.stringify().content
  }

  get map() {
    return this.stringify().map
  }

  get root() {
    return this.sync().root
  }

  get messages() {
    return this.sync().messages
  }

  warnings() {
    return this.sync().warnings()
  }

  toString() {
    return this.css
  }

  sync() {
    if (this.error) throw this.error
    if (this.processed) return this.result
    this.processed = true

    return this.result
  }

  stringify() {
    if (this.error) throw this.error
    if (this.stringified) return this.result
    this.stringified = true

    let str = stringify
    if (str.stringify) str = str.stringify

    let map = new MapGenerator(str, this.result.root, this.result.opts)
    let data = map.generate()
    this.result.css = data[0]
    this.result.map = data[1]

    return this.result
  }
}

NoWork.registerPostcss = dependant => {
  postcss = dependant
}

module.exports = NoWork
NoWork.default = NoWork

Root.registerNoWork(NoWork)
Document.registerNoWork(NoWork)
