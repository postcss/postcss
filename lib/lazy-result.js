let { isComplete, isClean } = require('./symbols')
let MapGenerator = require('./map-generator')
let stringify = require('./stringify')
let warnOnce = require('./warn-once')
let Result = require('./result')
let parse = require('./parse')
let Root = require('./root')

const TYPE_TO_CLASS_NAME = {
  root: 'Root',
  atrule: 'AtRule',
  rule: 'Rule',
  decl: 'Declaration',
  comment: 'Comment'
}

function isPromise (obj) {
  return typeof obj === 'object' && typeof obj.then === 'function'
}

let postcss = {}

function syncWalk (node, callback) {
  return node.each(child => {
    if (child[isClean]) return
    child[isClean] = true

    callback(child, '')
    if (child.type === 'decl') callback(child, '-' + child.prop)
    if (child.type === 'atrule') callback(child, '-' + child.name)
    if (child.nodes) syncWalk(child, callback)
    callback(child, 'Exit')
    if (child.type === 'decl') callback(child, 'Exit-' + child.prop)
    if (child.type === 'atrule') callback(child, 'Exit-' + child.name)

    if (!child[isClean]) return 'start-again'
    child[isComplete] = true
  })
}

async function eachAsync (node, callback) {
  if (!node.lastEach) node.lastEach = 0
  if (!node.indexes) node.indexes = {}

  node.lastEach += 1
  let id = node.lastEach
  node.indexes[id] = 0

  let index, result
  while (node.indexes[id] < node.nodes.length) {
    index = node.indexes[id]
    result = await callback(node.nodes[index])

    node.indexes[id] += 1

    if (result === 'start-again') {
      node.indexes[id] = 0
    }
  }

  delete node.indexes[id]

  return result
}

async function asyncWalk (node, callback) {
  return eachAsync(node, async child => {
    if (child[isClean]) return
    child[isClean] = true

    await callback(child, '')
    if (child.type === 'decl') await callback(child, '-' + child.prop)
    if (child.type === 'atrule') await callback(child, '-' + child.name)
    if (child.nodes) await asyncWalk(child, callback)
    await callback(child, 'Exit')
    if (child.type === 'decl') await callback(child, 'Exit-' + child.prop)
    if (child.type === 'atrule') await callback(child, 'Exit-' + child.name)

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
    this.helpers = { ...postcss, result: this.result }
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
      // istanbul ignore next
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
      if (typeof plugin === 'object' && plugin.Root) {
        return plugin.Root(this.result.root, this.helpers)
      } else if (typeof plugin === 'function') {
        return plugin(this.result.root, this.result)
      }
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

  prepareVisitors () {
    this.listeners = {}
    let add = (plugin, type, cb) => {
      let key = type.toLowerCase()
      if (!this.listeners[key]) this.listeners[key] = []
      this.listeners[key].push((...args) => {
        this.result.lastPlugin = plugin
        return cb(...args)
      })
    }
    for (let plugin of this.result.processor.plugins) {
      if (typeof plugin === 'object') {
        if (plugin.prepare) {
          plugin = { ...plugin, ...plugin.prepare(this.result) }
        }
        for (let type of [
          'Declaration',
          'Rule',
          'AtRule',
          'Comment',
          'DeclarationExit',
          'RuleExit',
          'AtRuleExit',
          'CommentExit',
          'RootExit'
        ]) {
          if (typeof plugin[type] === 'object') {
            for (let filter in plugin[type]) {
              if (filter === '*') {
                add(plugin, type, plugin[type][filter])
              } else {
                add(plugin, type + '-' + filter, plugin[type][filter])
              }
            }
          } else if (typeof plugin[type] === 'function') {
            add(plugin, type, plugin[type])
          }
        }
      }
    }
    this.hasListener = Object.keys(this.listeners).length > 0
  }

  visitSync () {
    this.prepareVisitors()
    let root = this.result.root
    if (!this.hasListener) return

    let run = (node, phase) => {
      let type = TYPE_TO_CLASS_NAME[node.type] + phase
      let visitors = this.listeners[type.toLowerCase()]
      if (!visitors) return
      let proxy = node.toProxy()
      for (let visitor of visitors) {
        let promise
        try {
          promise = visitor(proxy, this.helpers)
        } catch (e) {
          this.handleError(e, this.result.lastPlugin)
          throw node.addToError(e)
        }
        if (isPromise(promise)) {
          throw useAsyncError()
        }
      }
    }

    while (!root[isClean]) {
      root[isClean] = true
      syncWalk(root, run)
      run(root, 'Exit')
    }

    root[isComplete] = true
  }

  async visitAsync () {
    this.prepareVisitors()
    let root = this.result.root
    if (!this.hasListener) return

    let run = async (node, phase) => {
      let type = TYPE_TO_CLASS_NAME[node.type] + phase
      let visitors = this.listeners[type.toLowerCase()]
      if (!visitors) return
      let proxy = node.toProxy()
      for (let visitor of visitors) {
        try {
          await visitor(proxy, this.helpers)
        } catch (e) {
          this.handleError(e, this.result.lastPlugin)
          throw node.addToError(e)
        }
      }
    }

    while (!root[isClean]) {
      root[isClean] = true
      await asyncWalk(root, run)
      await run(root, 'Exit')
    }

    root[isComplete] = true
  }
}

LazyResult.registerPostcss = dependant => {
  postcss = dependant
}

module.exports = LazyResult

Root.registerLazyResult(LazyResult)
