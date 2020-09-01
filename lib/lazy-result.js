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

function toStack (node) {
  let events
  if (node[isClean]) {
    events = node.append ? ['children'] : []
  } else {
    node[isComplete] = true
    node[isClean] = true
    let key = false
    let type = TYPE_TO_CLASS_NAME[node.type]
    if (node.type === 'decl') {
      key = node.prop.toLowerCase()
    } else if (node.type === 'atrule') {
      key = node.name.toLowerCase()
    }

    if (key && node.append) {
      events = [
        type,
        type + '-' + key,
        'children',
        type + 'Exit',
        type + 'Exit-' + key
      ]
    } else if (key) {
      events = [type, type + '-' + key, type + 'Exit', type + 'Exit-' + key]
    } else if (node.append) {
      events = [type, 'children', type + 'Exit']
    } else {
      events = [type, type + 'Exit']
    }
  }

  return {
    node,
    events,
    eventIndex: 0,
    visitors: [],
    visitorIndex: 0,
    iterator: 0
  }
}

let postcss = {}

function syncWalk (node, callback) {
  node.each(child => {
    if (child[isComplete]) return
    child[isComplete] = true

    if (child[isClean]) {
      if (child.nodes) syncWalk(child, callback)
    } else {
      child[isClean] = true
      let key = false
      if (child.type === 'decl') key = child.prop.toLowerCase()
      if (child.type === 'atrule') key = child.name.toLowerCase()

      callback(child, '')
      if (key) callback(child, '-' + key)
      if (child.nodes) syncWalk(child, callback)
      callback(child, 'Exit')
      if (key) callback(child, 'Exit-' + key)
    }
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
    this.helpers = { ...postcss, result: this.result, postcss }
    this.plugins = this.processor.plugins.map(plugin => {
      if (typeof plugin === 'object' && plugin.prepare) {
        return { ...plugin, ...plugin.prepare(this.result) }
      } else {
        return plugin
      }
    })
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
    if (this.plugin >= this.plugins.length) {
      resolve()
      return
    }

    try {
      let plugin = this.plugins[this.plugin]
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
    })
      .then(() => this.visitAsync())
      .then(() => {
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

    for (let plugin of this.plugins) {
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
      if (!this.listeners[type]) this.listeners[type] = []
      this.listeners[type].push((...args) => {
        this.result.lastPlugin = plugin
        return cb(...args)
      })
    }
    for (let plugin of this.plugins) {
      if (typeof plugin === 'object') {
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
                add(
                  plugin,
                  type + '-' + filter.toLowerCase(),
                  plugin[type][filter]
                )
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

    while (!root[isComplete]) {
      root[isComplete] = true
      syncWalk(root, (node, phase) => {
        let type = TYPE_TO_CLASS_NAME[node.type] + phase
        let visitors = this.listeners[type]
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
      })
    }

    if (this.listeners.RootExit) {
      for (let visitor of this.listeners.RootExit) {
        let promise
        try {
          promise = visitor(root, this.helpers)
        } catch (e) {
          this.handleError(e, this.result.lastPlugin)
          throw e
        }
        if (isPromise(promise)) {
          throw useAsyncError()
        }
      }
    }
  }

  visitTick (stack) {
    let visit = stack[stack.length - 1]
    let { node, iterator, events, visitors } = visit

    if (visitors.length > 0 && visit.visitorIndex < visitors.length) {
      let visitor = visitors[visit.visitorIndex]
      visit.visitorIndex += 1
      if (visit.visitorIndex === visitors.length) {
        visit.visitors = []
        visit.visitorIndex = 0
      }
      try {
        return visitor(node.toProxy(), this.helpers)
      } catch (e) {
        this.handleError(e, this.result.lastPlugin)
        throw node.addToError(e)
      }
    }

    if (iterator !== 0) {
      let child
      while ((child = node.nodes[node.indexes[iterator]])) {
        node.indexes[iterator] += 1
        if (!child[isComplete]) {
          stack.push(toStack(child))
          return
        }
      }
      visit.iterator = 0
    }

    while (visit.eventIndex < events.length) {
      let event = events[visit.eventIndex]
      visit.eventIndex += 1
      if (event === 'children') {
        if (node.nodes && node.nodes.length) {
          node[isComplete] = true
          visit.iterator = node.getIterator()
        }
        return
      } else if (this.listeners[event]) {
        visit.visitors = this.listeners[event]
        return
      }
    }
    stack.pop()
  }

  async visitAsync () {
    this.prepareVisitors()
    if (!this.hasListener) return

    let root = this.result.root

    while (!root[isComplete]) {
      root[isComplete] = true
      root[isClean] = true
      let stack = [toStack(root)]
      while (stack.length > 0) {
        let promise = this.visitTick(stack)
        if (isPromise(promise)) {
          try {
            await promise
          } catch (e) {
            this.handleError(e, this.result.lastPlugin)
            let node = stack[stack.length - 1].node
            throw node.addToError(e)
          }
        }
      }
    }

    if (this.listeners.RootExit) {
      for (let visitor of this.listeners.RootExit) {
        try {
          await visitor(root, this.helpers)
        } catch (e) {
          this.handleError(e, this.result.lastPlugin)
          throw e
        }
      }
    }
  }
}

LazyResult.registerPostcss = dependant => {
  postcss = dependant
}

module.exports = LazyResult

Root.registerLazyResult(LazyResult)
