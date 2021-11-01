'use strict'

let { isClean, my } = require('./symbols')
let MapGenerator = require('./map-generator')
let stringify = require('./stringify')
let Container = require('./container')
let Document = require('./document')
let Result = require('./result')
let parse = require('./parse')
let Root = require('./root')
let LazyResult = require('./lazy-result')

function cleanMarks(node) {
  node[isClean] = false
  if (node.nodes) node.nodes.forEach(i => cleanMarks(i))
  return node
}

// @FIXME: Not sure why eslint is complaining about this. Temporary disable.
// eslint-disable-next-line
let postcss = {}

// @TODO: Add more tests (we need 100% coverage for this class)
class NoWork {
  constructor(processor, css, opts) {
    this.stringified = false
    this.processed = false
    this._processor = processor
    this._css = css
    this._opts = opts
    this.result = undefined
  }

  get [Symbol.toStringTag]() {
    return 'NoWork'
  }

  get processor() {
    return this._processor
  }

  get opts() {
    return this._opts
  }

  get css() {
    return this._css
  }

  get content() {
    return this._css
  }

  get map() {
    return this.stringify().map
  }
  
  get root() {
    return this.sync().root
  }

  get messages() {
    return []
  }

  prepareResult(processor, css, opts) {
    let root
    if (
      typeof css === 'object' &&
      css !== null &&
      (css.type === 'root' || css.type === 'document')
    ) {
      root = cleanMarks(css)
    } else if (css instanceof LazyResult || css instanceof Result) {
      root = cleanMarks(css.root)
      if (css.map) {
        if (typeof opts.map === 'undefined') opts.map = {}
        if (!opts.map.inline) opts.map.inline = false
        opts.map.prev = css.map
      }
    } else {
      let parser = parse
      if (opts.syntax) parser = opts.syntax.parse
      if (opts.parser) parser = opts.parser
      if (parser.parse) parser = parser.parse

      root = parser(css, opts)

      if (root && !root[my]) {
        // istanbul ignore next
        Container.rebuild(root)
      }
    }

    this.result = new Result(processor, root, opts)

    return this.result

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
    return this._css
  }

  then(onFulfilled, onRejected) {
    if (process.env.NODE_ENV !== 'production') {
      if (!('from' in this._opts)) {
        warnOnce(
          'Without `from` option PostCSS could generate wrong source map ' +
            'and will not find Browserslist config. Set it to CSS file path ' +
            'or to `undefined` to prevent this warning.'
        )
      }
    }

    return this.async().then(onFulfilled, onRejected)
  }

  catch(onRejected) {
    return this.async().catch(onRejected)
  }

  finally(onFinally) {
    return this.async().then(onFinally, onFinally)
  }

  async() {
    if (this.error) return Promise.reject(this.error)
    if (this.processed) return Promise.resolve(this.result)
    if (!this.result) {
      this.prepareResult(this._processor, this._css, this._opts)
    }
    return Promise.resolve(this.stringify())
  }

  sync() {
    if (this.error) throw this.error
    if (this.processed) return this.result
    this.processed = true

    if (this.processing) {
      throw this.getAsyncError()
    }

    if (!this.result) {
      this.prepareResult(this._processor, this._css, this._opts)
    }
    return this.result
  }

  // @TODO: what to do with maps?
  stringify() {
    if (this.error) throw this.error
    if (this.stringified) return this.result
    this.stringified = true

    this.sync()

    let opts = this.result.opts
    let str = stringify
    if (opts.syntax) str = opts.syntax.stringify
    if (opts.stringifier) str = opts.stringifier
    if (str.stringify) str = str.stringify

    let map = new MapGenerator(str, this.result.root, this.result.opts)
    let data = map.generate()
    this.result.css = data[0]
    this.result.map = data[1]

    return this.result
  }

  getAsyncError() {
    throw new Error('Use process(css).then(cb) to work with async plugins')
  }
}

NoWork.registerPostcss = dependant => {
  postcss = dependant
}

module.exports = NoWork
NoWork.default = NoWork

Root.registerNoWork(NoWork)
Document.registerNoWork(NoWork)
