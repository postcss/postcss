const LazyResult = require('../lib/lazy-result')
const Processor = require('../lib/processor')
const postcss = require('../lib/postcss')
const Result = require('../lib/result')
const parse = require('../lib/parse')
const Root = require('../lib/root')

const path = require('path')

function prs () {
  return new Root({ raws: { after: 'ok' } })
}

function str (node, builder) {
  builder(node.raws.after + '!')
}

const beforeFix = new Processor([css => {
  css.walkRules(rule => {
    if (!rule.selector.match(/::(before|after)/)) return
    if (!rule.some(i => i.prop === 'content')) {
      rule.prepend({ prop: 'content', value: '""' })
    }
  })
}])

const originWarn = console.warn
const originError = console.error
afterAll(() => {
  console.warn = originWarn
  console.error = originError
})

it('adds new plugins', () => {
  const a = () => 1
  const processor = new Processor()
  processor.use(a)
  expect(processor.plugins).toEqual([a])
})

it('adds new plugin by object', () => {
  const a = () => 1
  const processor = new Processor()
  processor.use({ postcss: a })
  expect(processor.plugins).toEqual([a])
})

it('adds new plugin by object-function', () => {
  const a = () => 1
  const obj = () => 2
  obj.postcss = a
  const processor = new Processor()
  processor.use(obj)
  expect(processor.plugins).toEqual([a])
})

it('adds new processors of another postcss instance', () => {
  const a = () => 1
  const processor = new Processor()
  const other = new Processor([a])
  processor.use(other)
  expect(processor.plugins).toEqual([a])
})

it('adds new processors from object', () => {
  const a = () => 1
  const processor = new Processor()
  const other = new Processor([a])
  processor.use({ postcss: other })
  expect(processor.plugins).toEqual([a])
})

it('returns itself', () => {
  const a = () => 1
  const b = () => 2
  const processor = new Processor()
  expect(processor.use(a).use(b).plugins).toEqual([a, b])
})

it('throws on wrong format', () => {
  const pr = new Processor()
  expect(() => {
    pr.use(1)
  }).toThrowError(/1 is not a PostCSS plugin/)
})

it('processes CSS', () => {
  const result = beforeFix.process('a::before{top:0}')
  expect(result.css).toEqual('a::before{content:"";top:0}')
})

it('processes parsed AST', () => {
  const root = parse('a::before{top:0}')
  const result = beforeFix.process(root)
  expect(result.css).toEqual('a::before{content:"";top:0}')
})

it('processes previous result', () => {
  let result = (new Processor()).process('a::before{top:0}')
  result = beforeFix.process(result)
  expect(result.css).toEqual('a::before{content:"";top:0}')
})

it('takes maps from previous result', () => {
  const one = (new Processor()).process('a{}', {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })
  const two = (new Processor()).process(one, { to: 'c.css' })
  expect(two.map.toJSON().sources).toEqual(['a.css'])
})

it('inlines maps from previous result', () => {
  const one = (new Processor()).process('a{}', {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })
  const two = (new Processor()).process(one, {
    to: 'c.css',
    map: { inline: true }
  })
  expect(two.map).not.toBeDefined()
})

it('throws with file name', () => {
  let error
  try {
    (new Processor()).process('a {', { from: 'a.css' }).css
  } catch (e) {
    if (e.name === 'CssSyntaxError') {
      error = e
    } else {
      throw e
    }
  }

  expect(error.file).toEqual(path.resolve('a.css'))
  expect(error.message).toMatch(/a.css:1:1: Unclosed block$/)
})

it('allows to replace Root', () => {
  const plugin = (css, result) => {
    result.root = new Root()
  }
  const processor = new Processor([plugin])
  expect(processor.process('a {}').css).toEqual('')
})

it('returns LazyResult object', () => {
  const result = (new Processor()).process('a{}')
  expect(result instanceof LazyResult).toBeTruthy()
  expect(result.css).toEqual('a{}')
  expect(result.toString()).toEqual('a{}')
})

it('calls all plugins once', () => {
  expect.assertions(1)

  let calls = ''
  const a = () => {
    calls += 'a'
  }
  const b = () => {
    calls += 'b'
  }

  const result = new Processor([a, b]).process('', { from: undefined })
  result.css
  result.map
  result.root
  return result.then(() => {
    expect(calls).toEqual('ab')
  })
})

it('parses, converts and stringifies CSS', () => {
  const a = css => expect(css instanceof Root).toBeTruthy()
  expect(typeof (new Processor([a])).process('a {}').css).toEqual('string')
})

it('send result to plugins', () => {
  expect.assertions(4)
  const processor = new Processor()
  const a = (css, result) => {
    expect(result instanceof Result).toBeTruthy()
    expect(result.processor).toEqual(processor)
    expect(result.opts).toEqual({ map: true })
    expect(result.root).toEqual(css)
  }
  return processor.use(a).process('a {}', { map: true, from: undefined })
})

it('accepts source map from PostCSS', () => {
  const one = (new Processor()).process('a{}', {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })
  const two = (new Processor()).process(one.css, {
    from: 'b.css',
    to: 'c.css',
    map: { prev: one.map, inline: false }
  })
  expect(two.map.toJSON().sources).toEqual(['a.css'])
})

it('supports async plugins', () => {
  let starts = 0
  let finish = 0
  const async1 = css => {
    return new Promise(resolve => {
      starts += 1
      setTimeout(() => {
        expect(starts).toEqual(1)

        css.append('a {}')
        finish += 1
        resolve()
      }, 1)
    })
  }
  const async2 = css => {
    return new Promise(resolve => {
      expect(starts).toEqual(1)
      expect(finish).toEqual(1)

      starts += 1
      setTimeout(() => {
        css.append('b {}')
        finish += 1
        resolve()
      }, 1)
    })
  }
  return (new Processor([async1, async2])).process('', { from: undefined })
    .then(result => {
      expect(starts).toEqual(2)
      expect(finish).toEqual(2)
      expect(result.css).toEqual('a {}b {}')
    })
})

it('works async without plugins', () => {
  return (new Processor()).process('a {}', { from: undefined })
    .then(result => {
      expect(result.css).toEqual('a {}')
    })
})

it('runs async plugin only once', () => {
  expect.assertions(1)

  let calls = 0
  const async = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        calls += 1
        resolve()
      }, 1)
    })
  }

  const result = (new Processor([async])).process('a {}', { from: undefined })
  result.then(() => { })
  return result.then(() => {
    return result.then(() => {
      expect(calls).toEqual(1)
    })
  })
})

it('supports async errors', done => {
  const error = new Error('Async')
  const async = () => {
    return new Promise((resolve, reject) => {
      reject(error)
    })
  }
  const result = (new Processor([async])).process('', { from: undefined })
  result.then(() => {
    done.fail()
  }).catch(err => {
    expect(err).toEqual(error)
    return result.catch(err2 => {
      expect(err2).toEqual(error)
      done()
    })
  })
})

it('supports sync errors in async mode', done => {
  const error = new Error('Async')
  const async = () => {
    throw error
  };
  (new Processor([async])).process('', { from: undefined }).then(() => {
    done.fail()
  }).catch(err => {
    expect(err).toEqual(error)
    done()
  })
})

it('throws parse error in async', () => {
  return (new Processor()).process('a{').catch(err => {
    expect(err.message).toEqual('<css input>:1:1: Unclosed block')
  })
})

it('throws error on sync method to async plugin', () => {
  const async = () => {
    return new Promise(resolve => resolve())
  }
  expect(() => {
    (new Processor([async])).process('a{}').css
  }).toThrowError(/async/)
})

it('throws a sync call in async running', () => {
  const async = () => new Promise(resolve => setTimeout(resolve, 1))

  const processor = (new Processor([async])).process('a{}')
  processor.async()

  expect(() => {
    processor.sync()
  }).toThrowError(/then/)
})

it('checks plugin compatibility', () => {
  const plugin = postcss.plugin('test', () => {
    return () => {
      throw new Error('Er')
    }
  })
  const func = plugin()
  func.postcssVersion = '2.1.5'

  const processBy = version => {
    const processor = new Processor([func])
    processor.version = version
    processor.process('a{}').css
  }

  console.error = jest.fn()

  expect(() => {
    processBy('1.0.0')
  }).toThrowError('Er')
  expect(console.error.mock.calls).toHaveLength(1)
  expect(console.error.mock.calls[0][0]).toEqual(
    'Unknown error from PostCSS plugin. ' +
    'Your current PostCSS version is 1.0.0, but test uses 2.1.5. ' +
    'Perhaps this is the source of the error below.'
  )

  expect(() => {
    processBy('3.0.0')
  }).toThrowError('Er')
  expect(console.error.mock.calls).toHaveLength(2)

  expect(() => {
    processBy('2.0.0')
  }).toThrowError('Er')
  expect(console.error.mock.calls).toHaveLength(3)

  expect(() => {
    processBy('2.1.0')
  }).toThrowError('Er')
  expect(console.error.mock.calls).toHaveLength(3)
})

it('sets last plugin to result', () => {
  const plugin1 = function (css, result) {
    expect(result.lastPlugin).toBe(plugin1)
  }
  const plugin2 = function (css, result) {
    expect(result.lastPlugin).toBe(plugin2)
  }

  const processor = new Processor([plugin1, plugin2])
  return processor.process('a{}', { from: undefined }).then(result => {
    expect(result.lastPlugin).toBe(plugin2)
  })
})

it('uses custom parsers', () => {
  const processor = new Processor([])
  return processor.process('a{}', { parser: prs, from: undefined })
    .then(result => {
      expect(result.css).toEqual('ok')
    })
})

it('uses custom parsers from object', () => {
  const processor = new Processor([])
  const syntax = { parse: prs, stringify: str }
  return processor.process('a{}', { parser: syntax, from: undefined })
    .then(result => {
      expect(result.css).toEqual('ok')
    })
})

it('uses custom stringifier', () => {
  const processor = new Processor([])
  return processor.process('a{}', { stringifier: str, from: undefined })
    .then(result => {
      expect(result.css).toEqual('!')
    })
})

it('uses custom stringifier from object', () => {
  const processor = new Processor([])
  const syntax = { parse: prs, stringify: str }
  return processor.process('', { stringifier: syntax, from: undefined })
    .then(result => {
      expect(result.css).toEqual('!')
    })
})

it('uses custom stringifier with source maps', () => {
  const processor = new Processor([])
  return processor.process('a{}', {
    map: true, stringifier: str, from: undefined
  }).then(result => {
    expect(result.css).toMatch(/!\n\/\*# sourceMap/)
  })
})

it('uses custom syntax', () => {
  const processor = new Processor([])
  return processor.process('a{}', {
    syntax: { parse: prs, stringify: str }, from: undefined
  }).then(result => {
    expect(result.css).toEqual('ok!')
  })
})

it('contains PostCSS version', () => {
  expect((new Processor()).version).toMatch(/\d+.\d+.\d+/)
})

it('throws on syntax as plugin', () => {
  const processor = new Processor()
  expect(() => {
    processor.use({
      parse () { }
    })
  }).toThrowError(/syntax/)
})

it('warns about missed from', () => {
  console.warn = jest.fn()
  const processor = new Processor()

  processor.process('a{}').css
  expect(console.warn).not.toBeCalled()

  return processor.process('a{}').then(() => {
    expect(console.warn).toBeCalledWith(
      'Without `from` option PostCSS could generate wrong source map ' +
      'and will not find Browserslist config. Set it to CSS file path ' +
      'or to `undefined` to prevent this warning.'
    )
  })
})
