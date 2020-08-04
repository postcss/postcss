let { isComplete, isClean } = require('./symbols')
let MapGenerator = require('./map-generator')
let stringify = require('./stringify')
let warnOnce = require('./warn-once')
let Result = require('./result')
let parse = require('./parse')
let Root = require('./root')

function isPromise (obj) {
  return typeof obj === 'object' && typeof obj.then === 'function'
}

function syncWalk (node, callback) {
  return node.each((child, i) => {
    if (child[isClean]) return
    child[isClean] = true

    callback(child, i, 'enter')
    if (child.nodes) syncWalk(child, callback)
    callback(child, i, 'exit')

    if (!child[isClean]) return 'start-again'
    child[isComplete] = true
  })
}

async function asyncWalk (node, callback) {
  return node.eachAsync(async (child, i) => {
    if (child[isClean]) return
    child[isClean] = true

    await callback(child, i, 'enter')
    if (child.nodes) await asyncWalk(child, callback)
    await callback(child, i, 'exit')

    if (!child[isClean]) return 'start-again'
    child[isComplete] = true
  })
}

function useAsyncError () {
  return new Error('Use process(css).then(cb) to work with async plugins')
}

class LazyResult {
  constructor (processor, css, opts) {
    this.stringified = false
    this.processed = false

    let root
    if (typeof css === 'object' && css !== null && css.type === 'root') {
      root = css
    } else if (css instanceof LazyResult || css instanceof Result) {
      root = css.root
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

      try {
        root = parser(css, opts)
      } catch (error) {
        this.error = error
      }
    }

    this.result = new Result(processor, root, opts)
  }

  get processor () {
    return this.result.processor
  }

  get opts () {
    return this.result.opts
  }

  get css () {
    return this.stringify().css
  }

  get content () {
    return this.stringify().content
  }

  get map () {
    return this.stringify().map
  }

  get root () {
    return this.sync().root
  }

  get messages () {
    return this.sync().messages
  }

  warnings () {
    return this.sync().warnings()
  }

  toString () {
    return this.css
  }

  then (onFulfilled, onRejected) {
    if (process.env.NODE_ENV !== 'production') {
      if (!('from' in this.opts)) {
        warnOnce(
          'Without `from` option PostCSS could generate wrong source map ' +
            'and will not find Browserslist config. Set it to CSS file path ' +
            'or to `undefined` to prevent this warning.'
        )
      }
    }
    return this.async().then(onFulfilled, onRejected)
  }

  catch (onRejected) {
    return this.async().catch(onRejected)
  }

  finally (onFinally) {
    return this.async().then(onFinally, onFinally)
  }

  handleError (error, plugin) {
    try {
      this.error = error
      if (error.name === 'CssSyntaxError' && !error.plugin) {
        error.plugin = plugin.postcssPlugin
        error.setMessage()
      } else if (plugin.postcssVersion) {
        if (process.env.NODE_ENV !== 'production') {
          let pluginName = plugin.postcssPlugin
          let pluginVer = plugin.postcssVersion
          let runtimeVer = this.result.processor.version
          let a = pluginVer.split('.')
          let b = runtimeVer.split('.')

          if (a[0] !== b[0] || parseInt(a[1]) > parseInt(b[1])) {
            console.error(
              'Unknown error from PostCSS plugin. Your current PostCSS ' +
                'version is ' +
                runtimeVer +
                ', but ' +
                pluginName +
                ' uses ' +
                pluginVer +
                '. Perhaps this is the source of the error below.'
            )
          }
        }
      }
    } catch (err) {
      if (console && console.error) console.error(err)
    }
  }

  asyncTick (resolve, reject) {
    if (this.plugin >= this.processor.plugins.length) {
      return this.visitAsync()
        .then(() => {
          this.processed = true
          return resolve()
        })
        .catch(error => {
          this.processed = true
          reject(error)
        })
    }

    try {
      let plugin = this.processor.plugins[this.plugin]
      let promise = this.run(plugin)
      this.plugin += 1

      if (isPromise(promise)) {
        promise
          .then(() => {
            this.asyncTick(resolve, reject)
          })
          .catch(error => {
            this.handleError(error, plugin)
            this.processed = true
            reject(error)
          })
      } else {
        this.asyncTick(resolve, reject)
      }
    } catch (error) {
      this.processed = true
      reject(error)
    }
  }

  async () {
    if (this.processed) {
      return new Promise((resolve, reject) => {
        if (this.error) {
          reject(this.error)
        } else {
          resolve(this.stringify())
        }
      })
    }
    if (this.processing) {
      return this.processing
    }

    this.processing = new Promise((resolve, reject) => {
      if (this.error) return reject(this.error)
      this.plugin = 0
      this.asyncTick(resolve, reject)
    }).then(() => {
      this.processed = true
      return this.stringify()
    })

    return this.processing
  }

  sync () {
    if (this.processed) return this.result
    this.processed = true

    if (this.processing) {
      throw useAsyncError()
    }

    if (this.error) throw this.error

    for (let plugin of this.result.processor.plugins) {
      let promise = this.run(plugin)
      if (isPromise(promise)) {
        throw useAsyncError()
      }
    }

    this.visitSync()
    return this.result
  }

  run (plugin) {
    this.result.lastPlugin = plugin

    try {
      return plugin(this.result.root, this.result)
    } catch (error) {
      this.handleError(error, plugin)
      throw error
    }
  }

  stringify () {
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

  visitSync () {
    let root = this.result.root
    if (!root.listeners) return

    while (!root[isClean]) {
      root[isClean] = true
      syncWalk(root, (node, index, phase) => {
        let visitors = root.listeners[node.type + '.' + phase]
        if (!visitors) return
        let proxy = node.toProxy()
        for (let visitor of visitors) {
          let promise
          try {
            promise = visitor(proxy, index)
          } catch (e) {
            throw node.addToError(e)
          }
          if (isPromise(promise)) {
            throw useAsyncError()
          }
        }
      })
    }

    root[isComplete] = true
  }

  async visitAsync () {
    let root = this.result.root
    if (!root.listeners) return

    while (!root[isClean]) {
      root[isClean] = true
      await asyncWalk(root, async (node, index, phase) => {
        let visitors = root.listeners[node.type + '.' + phase]
        if (!visitors) return
        let proxy = node.toProxy()
        for (let visitor of visitors) {
          try {
            await visitor(proxy, index)
          } catch (e) {
            throw node.addToError(e)
          }
        }
      })
    }

    root[isComplete] = true
  }
}

module.exports = LazyResult

Root.registerLazyResult(LazyResult)
