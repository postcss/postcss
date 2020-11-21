import { resolve as pathResolve } from 'path'

import postcss, { Plugin, Result, Node, Root, parse } from '../lib/postcss.js'
import LazyResult from '../lib/lazy-result.js'
import Processor from '../lib/processor.js'

afterEach(() => {
  jest.resetAllMocks()
})

function prs () {
  return new Root({ raws: { after: 'ok' } })
}

function str (node: Node, builder: (s: string) => void) {
  builder(`${node.raws.after}!`)
}

function getCalls (func: any) {
  return func.mock.calls
}

let beforeFix = new Processor([
  (root: Root) => {
    root.walkRules(rule => {
      if (!rule.selector.match(/::(before|after)/)) return
      if (!rule.some(i => i.type === 'decl' && i.prop === 'content')) {
        rule.prepend({ prop: 'content', value: '""' })
      }
    })
  }
])

it('adds new plugins', () => {
  let a = () => {}
  let processor = new Processor()
  processor.use(a)
  expect(processor.plugins).toEqual([a])
})

it('adds new plugin by object', () => {
  let a = () => {}
  let processor = new Processor()
  processor.use({ postcss: a })
  expect(processor.plugins).toEqual([a])
})

it('adds new plugin by object-function', () => {
  let a = () => {}
  let obj: any = () => {}
  obj.postcss = a
  let processor = new Processor()
  processor.use(obj)
  expect(processor.plugins).toEqual([a])
})

it('adds new processors of another postcss instance', () => {
  let a = () => {}
  let processor = new Processor()
  let other = new Processor([a])
  processor.use(other)
  expect(processor.plugins).toEqual([a])
})

it('adds new processors from object', () => {
  let a = () => {}
  let processor = new Processor()
  let other = new Processor([a])
  processor.use({ postcss: other })
  expect(processor.plugins).toEqual([a])
})

it('returns itself', () => {
  let a = () => {}
  let b = () => {}
  let processor = new Processor()
  expect(processor.use(a).use(b).plugins).toEqual([a, b])
})

it('throws on wrong format', () => {
  let pr = new Processor()
  expect(() => {
    // @ts-expect-error
    pr.use(1)
  }).toThrow(/1 is not a PostCSS plugin/)
})

it('processes CSS', () => {
  let result = beforeFix.process('a::before{top:0}')
  expect(result.css).toEqual('a::before{content:"";top:0}')
})

it('processes parsed AST', () => {
  let root = parse('a::before{top:0}')
  let result = beforeFix.process(root)
  expect(result.css).toEqual('a::before{content:"";top:0}')
})

it('processes previous result', () => {
  let result = new Processor([() => {}]).process('a::before{top:0}')
  result = beforeFix.process(result)
  expect(result.css).toEqual('a::before{content:"";top:0}')
})

it('takes maps from previous result', () => {
  let one = new Processor([() => {}]).process('a{}', {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })
  let two = new Processor([() => {}]).process(one, { to: 'c.css' })
  expect(two.map.toJSON().sources).toEqual(['a.css'])
})

it('inlines maps from previous result', () => {
  let one = new Processor([() => {}]).process('a{}', {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })
  let two = new Processor([() => {}]).process(one, {
    to: 'c.css',
    map: { inline: true }
  })
  expect(two.map).not.toBeDefined()
})

it('throws with file name', () => {
  let error
  try {
    new Processor([() => {}]).process('a {', { from: 'a.css' }).css
  } catch (e) {
    if (e.name === 'CssSyntaxError') {
      error = e
    } else {
      throw e
    }
  }

  expect(error.file).toEqual(pathResolve('a.css'))
  expect(error.message).toMatch(/a.css:1:1: Unclosed block$/)
})

it('allows to replace Root', () => {
  let processor = new Processor([
    (css, result) => {
      result.root = new Root()
    }
  ])
  expect(processor.process('a {}').css).toEqual('')
})

it('returns LazyResult object', () => {
  let result = new Processor([() => {}]).process('a{}')
  expect(result instanceof LazyResult).toBe(true)
  expect(result.css).toEqual('a{}')
  expect(result.toString()).toEqual('a{}')
})

it('calls all plugins once', async () => {
  expect.assertions(1)

  let calls = ''
  let a = () => {
    calls += 'a'
  }
  let b = () => {
    calls += 'b'
  }

  let result = new Processor([a, b]).process('', { from: undefined })
  result.css
  result.map
  result.root
  await result
  expect(calls).toEqual('ab')
})

it('parses, converts and stringifies CSS', () => {
  expect(
    typeof new Processor([
      (css: Root) => expect(css instanceof Root).toBe(true)
    ]).process('a {}').css
  ).toEqual('string')
})

it('send result to plugins', () => {
  expect.assertions(4)
  let processor = new Processor([() => {}])
  return processor
    .use((css, result) => {
      expect(result instanceof Result).toBe(true)
      expect(result.processor).toEqual(processor)
      expect(result.opts).toEqual({ map: true })
      expect(result.root).toEqual(css)
    })
    .process('a {}', { map: true, from: undefined })
})

it('accepts source map from PostCSS', () => {
  let one = new Processor([() => {}]).process('a{}', {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })
  let two = new Processor([() => {}]).process(one.css, {
    from: 'b.css',
    to: 'c.css',
    map: { prev: one.map, inline: false }
  })
  expect(two.map.toJSON().sources).toEqual(['a.css'])
})

it('supports async plugins', async () => {
  let starts = 0
  let finish = 0
  let async1 = (css: Root) =>
    new Promise<void>(resolve => {
      starts += 1
      setTimeout(() => {
        expect(starts).toEqual(1)

        css.append('a {}')
        finish += 1
        resolve()
      }, 1)
    })
  let async2 = (css: Root) =>
    new Promise<void>(resolve => {
      expect(starts).toEqual(1)
      expect(finish).toEqual(1)

      starts += 1
      setTimeout(() => {
        css.append('b {}')
        finish += 1
        resolve()
      }, 1)
    })
  let r = await new Processor([async1, async2]).process('', { from: 'a' })
  expect(starts).toEqual(2)
  expect(finish).toEqual(2)
  expect(r.css).toEqual('a {}b {}')
})

it('works async without plugins', async () => {
  let r = await new Processor([() => {}]).process('a {}', { from: 'a' })
  expect(r.css).toEqual('a {}')
})

it('runs async plugin only once', async () => {
  expect.assertions(1)

  let calls = 0
  let async = () => {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        calls += 1
        resolve()
      }, 1)
    })
  }

  let result = new Processor([async]).process('a {}', { from: undefined })
  result.then(() => {})
  await result
  await result
  expect(calls).toEqual(1)
})

it('supports async errors', () => {
  let error = new Error('Async')
  let async = () => {
    return new Promise<void>((resolve, reject) => {
      reject(error)
    })
  }
  return new Promise<void>((resolve, reject) => {
    let result = new Processor([async]).process('', { from: undefined })
    result
      .then(() => {
        reject(new Error('Called .then in failed processing'))
      })
      .catch(err => {
        expect(err).toEqual(error)
        return result.catch(err2 => {
          expect(err2).toEqual(error)
          resolve()
        })
      })
  })
})

it('supports sync errors in async mode', () => {
  let error = new Error('Async')
  let async = () => {
    throw error
  }
  return new Promise<void>((resolve, reject) => {
    new Processor([async])
      .process('', { from: undefined })
      .then(() => {
        reject(new Error('Called .then in failed processing'))
      })
      .catch(err => {
        expect(err).toEqual(error)
        resolve()
      })
  })
})

it('throws parse error in async', async () => {
  let err
  try {
    await new Processor([() => {}]).process('a{', { from: undefined })
  } catch (e) {
    err = e
  }
  expect(err.message).toEqual('<css input>:1:1: Unclosed block')
})

it('throws error on sync method to async plugin', () => {
  let async = () => {
    return new Promise<void>(resolve => resolve())
  }
  expect(() => {
    new Processor([async]).process('a{}').css
  }).toThrow(/async/)
})

it('throws a sync call in async running', async () => {
  let async = () => new Promise<void>(resolve => setTimeout(resolve, 1))

  let processor = new Processor([async]).process('a{}', { from: 'a.css' })
  processor.async()

  expect(() => {
    processor.sync()
  }).toThrow(/then/)
})

it('remembers errors', async () => {
  let calls = 0
  let plugin: Plugin = {
    postcssPlugin: 'plugin',
    Once () {
      calls += 1
      throw new Error('test')
    }
  }

  let processing = postcss([plugin]).process('a{}', { from: undefined })

  expect(() => {
    processing.css
  }).toThrow('test')
  expect(() => {
    processing.css
  }).toThrow('test')
  expect(() => {
    processing.root
  }).toThrow('test')

  let asyncError
  try {
    await processing
  } catch (e) {
    asyncError = e
  }
  expect(asyncError.message).toEqual('test')

  expect(calls).toEqual(1)
})

it('checks plugin compatibility', () => {
  jest.spyOn(console, 'warn').mockImplementation(() => true)
  let plugin = (postcss as any).plugin('test', () => {
    return () => {
      throw new Error('Er')
    }
  })
  expect(console.warn).toHaveBeenCalledTimes(1)
  let func = plugin()
  func.postcssVersion = '2.1.5'

  function processBy (version: string) {
    let processor = new Processor([func])
    processor.version = version
    processor.process('a{}').css
  }

  jest.spyOn(console, 'error').mockImplementation(() => {})

  expect(() => {
    processBy('1.0.0')
  }).toThrow('Er')
  expect(getCalls(console.error)).toHaveLength(1)
  expect(getCalls(console.error)[0][0]).toEqual(
    'Unknown error from PostCSS plugin. ' +
      'Your current PostCSS version is 1.0.0, but test uses 2.1.5. ' +
      'Perhaps this is the source of the error below.'
  )

  expect(() => {
    processBy('3.0.0')
  }).toThrow('Er')
  expect(getCalls(console.error)).toHaveLength(2)

  expect(() => {
    processBy('2.0.0')
  }).toThrow('Er')
  expect(getCalls(console.error)).toHaveLength(3)

  expect(() => {
    processBy('2.1.0')
  }).toThrow('Er')
  expect(getCalls(console.error)).toHaveLength(3)
})

it('sets last plugin to result', async () => {
  let plugin1 = function (css: Root, result: Result) {
    expect(result.lastPlugin).toBe(plugin1)
  }
  let plugin2 = function (css: Root, result: Result) {
    expect(result.lastPlugin).toBe(plugin2)
  }

  let processor = new Processor([plugin1, plugin2])
  let result = await processor.process('a{}', { from: undefined })
  expect(result.lastPlugin).toBe(plugin2)
})

it('uses custom parsers', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  let processor = new Processor([])
  let result = await processor.process('a{}', { parser: prs, from: undefined })
  expect(console.warn).not.toHaveBeenCalled()
  expect(result.css).toEqual('ok')
})

it('uses custom parsers from object', async () => {
  let processor = new Processor([])
  let syntax = { parse: prs, stringify: str }
  let result = await processor.process('a{}', { parser: syntax, from: 'a' })
  expect(result.css).toEqual('ok')
})

it('uses custom stringifier', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  let processor = new Processor([])
  let result = await processor.process('a{}', { stringifier: str, from: 'a' })
  expect(console.warn).not.toHaveBeenCalled()
  expect(result.css).toEqual('!')
})

it('uses custom stringifier from object', async () => {
  let processor = new Processor([])
  let syntax = { parse: prs, stringify: str }
  let result = await processor.process('', { stringifier: syntax, from: 'a' })
  expect(result.css).toEqual('!')
})

it('uses custom stringifier with source maps', async () => {
  let processor = new Processor([])
  let result = await processor.process('a{}', {
    map: true,
    stringifier: str,
    from: undefined
  })
  expect(result.css).toMatch(/!\n\/\*# sourceMap/)
})

it('uses custom syntax', async () => {
  let processor = new Processor([() => {}])
  let result = await processor.process('a{}', {
    syntax: { parse: prs, stringify: str },
    from: undefined
  })
  expect(result.css).toEqual('ok!')
})

it('contains PostCSS version', () => {
  expect(new Processor().version).toMatch(/\d+.\d+.\d+/)
})

it('throws on syntax as plugin', () => {
  let processor = new Processor([() => {}])
  expect(() => {
    processor.use({
      // @ts-expect-error
      parse () {}
    })
  }).toThrow(/syntax/)
})

it('warns about missed from', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  let processor = new Processor([() => {}])

  processor.process('a{}').css
  expect(console.warn).not.toHaveBeenCalled()

  await processor.process('a{}')
  expect(console.warn).toHaveBeenCalledWith(
    'Without `from` option PostCSS could generate wrong source map ' +
      'and will not find Browserslist config. Set it to CSS file path ' +
      'or to `undefined` to prevent this warning.'
  )
})

it('warns about missed plugins', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  await new Processor().process('a{}')
  expect(console.warn).toHaveBeenCalledWith(
    'You did not set any plugins, parser, or stringifier. ' +
      'Right now, PostCSS does nothing. Pick plugins for your case ' +
      'on https://www.postcss.parts/ and use them in postcss.config.js.'
  )
})

it('supports plugins returning processors', () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  let a = () => {}
  let processor = new Processor()
  let other: any = (postcss as any).plugin('test', () => {
    return new Processor([a])
  })
  processor.use(other)
  expect(processor.plugins).toEqual([a])
})
