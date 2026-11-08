'use strict'

let MapGenerator = require('./map-generator')
let parse = require('./parse')
let Result = require('./result')
let stringify = require('./stringify')
let { isClean } = require('./symbols')
let warnOnce = require('./warn-once')

function cleanMarks(node) {
  let stack = [node]
  while (stack.length > 0) {
    let next = stack.pop()
    next[isClean] = false
    if (next.nodes) {
      for (let i of next.nodes) stack.push(i)
    }
  }
  return node
}

class NoWorkResult {
  get content() {
    return this.result.css
  }

  get css() {
    return this.result.css
  }

  get map() {
    return this.result.map
  }

  get messages() {
    return []
  }

  get opts() {
    return this.result.opts
  }

  get processor() {
    return this.result.processor
  }

  get root() {
    if (this._root) {
      return this._root
    }

    let root
    let parser = parse

    try {
      root = parser(this._css, this._opts)
    } catch (error) {
      this.error = error
    }

    if (this.error) {
      throw this.error
    } else {
      this._root = root
      return root
    }
  }

  get [Symbol.toStringTag]() {
    return 'NoWorkResult'
  }

  constructor(processor, css, opts) {
    let root
    if (
      typeof css === 'object' &&
      css !== null &&
      (css.type === 'root' || css.type === 'document')
    ) {
      root = cleanMarks(css)
    } else if (
      css &&
      typeof css === 'object' &&
      (css instanceof Result ||
        Boolean(
          css.root &&
            (css.root.type === 'root' || css.root.type === 'document')
        ))
    ) {
      root = cleanMarks(css.root)
      if (css.map) {
        if (typeof opts.map === 'undefined') opts.map = {}
        if (!opts.map.inline) opts.map.inline = false
        opts.map.prev = css.map
      }
    }

    let cssString
    if (root) {
      cssString = root.toString()
    } else {
      cssString = css.toString()
    }

    this.stringified = false

    this._processor = processor
    this._css = cssString
    this._opts = opts
    this._map = undefined
    this._root = root

    let str = stringify
    this.result = new Result(this._processor, undefined, this._opts)
    this.result.css = cssString

    let self = this
    Object.defineProperty(this.result, 'root', {
      get() {
        return self.root
      }
    })

    let map = new MapGenerator(str, this._root, this._opts, cssString)
    if (map.isMap()) {
      let [generatedCSS, generatedMap] = map.generate()
      if (generatedCSS) {
        this.result.css = generatedCSS
      }
      if (generatedMap) {
        this.result.map = generatedMap
      }
    } else {
      map.clearAnnotation()
      this.result.css = map.css
    }
  }

  async() {
    if (this.error) return Promise.reject(this.error)
    return Promise.resolve(this.result)
  }

  catch(onRejected) {
    return this.async().catch(onRejected)
  }

  finally(onFinally) {
    return this.async().finally(onFinally)
  }

  sync() {
    if (this.error) throw this.error
    return this.result
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

  toString() {
    return this._css
  }

  warnings() {
    return []
  }
}

module.exports = NoWorkResult
NoWorkResult.default = NoWorkResult
