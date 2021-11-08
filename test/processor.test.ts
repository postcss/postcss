import { resolve as pathResolve } from 'path'
import { delay } from 'nanodelay'

import postcss, {
  Plugin,
  Result,
  Node,
  Root,
  parse,
  PluginCreator,
  Document,
  Parser,
  Stringifier
} from '../lib/postcss.js'
import CssSyntaxError from '../lib/css-syntax-error.js'
import LazyResult from '../lib/lazy-result.js'
import NoWorkResult from '../lib/no-work-result.js'
import Processor from '../lib/processor.js'
import Rule from '../lib/rule.js'

afterEach(() => {
  jest.resetAllMocks()
})

function prs(): Root {
  return new Root({ raws: { after: 'ok' } })
}

function str(node: Node, builder: (s: string) => void): void {
  builder(`${node.raws.after}!`)
}

function getCalls(func: any): any {
  return func.mock.calls
}

async function catchError(cb: () => Promise<any>): Promise<Error> {
  try {
    await cb()
  } catch (e) {
    if (e instanceof Error) return e
  }
  throw new Error('Error was not thrown')
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
  let a = (): void => {}
  let processor = new Processor()
  processor.use(a)
  expect(processor.plugins).toEqual([a])
})

it('adds new plugin by object', () => {
  let a = (): void => {}
  let processor = new Processor()
  processor.use({ postcss: a })
  expect(processor.plugins).toEqual([a])
})

it('adds new plugin by object-function', () => {
  let a = (): void => {}
  let obj: any = () => {}
  obj.postcss = a
  let processor = new Processor()
  processor.use(obj)
  expect(processor.plugins).toEqual([a])
})

it('adds new processors of another postcss instance', () => {
  let a = (): void => {}
  let processor = new Processor()
  let other = new Processor([a])
  processor.use(other)
  expect(processor.plugins).toEqual([a])
})

it('adds new processors from object', () => {
  let a = (): void => {}
  let processor = new Processor()
  let other = new Processor([a])
  processor.use({ postcss: other })
  expect(processor.plugins).toEqual([a])
})

it('returns itself', () => {
  let a = (): void => {}
  let b = (): void => {}
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
  expect(result.css).toBe('a::before{content:"";top:0}')
})

it('processes parsed AST', () => {
  let root = parse('a::before{top:0}')
  let result = beforeFix.process(root)
  expect(result.css).toBe('a::before{content:"";top:0}')
})

it('processes previous result', () => {
  let result = new Processor([() => {}]).process('a::before{top:0}')
  result = beforeFix.process(result)
  expect(result.css).toBe('a::before{content:"";top:0}')
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
  expect(two.map).toBeUndefined()
})

it('throws with file name', () => {
  let error: CssSyntaxError | undefined
  try {
    new Processor([() => {}]).process('a {', { from: 'a.css' }).css
  } catch (e) {
    if (e instanceof CssSyntaxError) {
      error = e
    } else {
      throw e
    }
  }

  expect(error?.file).toEqual(pathResolve('a.css'))
  expect(error?.message).toMatch(/a.css:1:1: Unclosed block$/)
})

it('allows to replace Root', () => {
  let processor = new Processor([
    (css, result) => {
      result.root = new Root()
    }
  ])
  expect(processor.process('a {}').css).toBe('')
})

it('returns LazyResult object', () => {
  let result = new Processor([() => {}]).process('a{}')
  expect(result instanceof LazyResult).toBe(true)
  expect(result.css).toBe('a{}')
  expect(result.toString()).toBe('a{}')
})

it('calls all plugins once', async () => {
  expect.assertions(1)

  let calls = ''
  let a = (): void => {
    calls += 'a'
  }
  let b = (): void => {
    calls += 'b'
  }

  let result = new Processor([a, b]).process('', { from: undefined })
  result.css
  result.map
  result.root
  await result
  expect(calls).toBe('ab')
})

it('parses, converts and stringifies CSS', () => {
  expect(
    typeof new Processor([
      (css: Root) => {
        expect(css instanceof Root).toBe(true)
      }
    ]).process('a {}').css
  ).toBe('string')
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
  let async1 = (css: Root): Promise<void> =>
    new Promise<void>(resolve => {
      starts += 1
      setTimeout(() => {
        expect(starts).toBe(1)

        css.append('a {}')
        finish += 1
        resolve()
      }, 1)
    })
  let async2 = (css: Root): Promise<void> =>
    new Promise<void>(resolve => {
      expect(starts).toBe(1)
      expect(finish).toBe(1)

      starts += 1
      setTimeout(() => {
        css.append('b {}')
        finish += 1
        resolve()
      }, 1)
    })
  let r = await new Processor([async1, async2]).process('', { from: 'a' })
  expect(starts).toBe(2)
  expect(finish).toBe(2)
  expect(r.css).toBe('a {}b {}')
})

it('works async without plugins', async () => {
  let r = await new Processor([() => {}]).process('a {}', { from: 'a' })
  expect(r.css).toBe('a {}')
})

it('runs async plugin only once', async () => {
  expect.assertions(1)

  let calls = 0
  let async = (): Promise<void> => {
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
  expect(calls).toBe(1)
})

it('supports async errors', async () => {
  let error = new Error('Async')
  let async = (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      reject(error)
    })
  }
  let result = new Processor([async]).process('', { from: undefined })
  let err1 = await catchError(async () => await result)
  expect(err1).toEqual(error)

  let err2: Error | undefined
  result.catch(catched => {
    err2 = catched
  })
  await delay(10)
  expect(err2).toEqual(error)
})

it('supports sync errors in async mode', async () => {
  let error = new Error('Async')
  let async = (): void => {
    throw error
  }
  let err = await catchError(() =>
    new Processor([async]).process('', { from: undefined })
  )
  expect(err).toEqual(error)
})

it('throws parse error in async', async () => {
  let err = await catchError(() =>
    new Processor([() => {}]).process('a{', { from: undefined })
  )
  expect(err.message).toBe('<css input>:1:1: Unclosed block')
})

it('throws error on sync method to async plugin', () => {
  let async = (): Promise<void> => {
    return new Promise<void>(resolve => {
      resolve()
    })
  }
  expect(() => {
    new Processor([async]).process('a{}').css
  }).toThrow(/async/)
})

it('throws a sync call in async running', async () => {
  let async = (): Promise<void> =>
    new Promise<void>(resolve => setTimeout(resolve, 1))

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
    Once() {
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

  let asyncError: any
  try {
    await processing
  } catch (e) {
    asyncError = e
  }
  expect(asyncError.message).toBe('test')

  expect(calls).toBe(1)
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

  function processBy(version: string): void {
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
  let plugin1 = (css: Root, result: Result): void => {
    expect(result.lastPlugin).toBe(plugin1)
  }
  let plugin2 = (css: Root, result: Result): void => {
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
  expect(result.css).toBe('ok')
})

it('uses custom parsers from object', async () => {
  let processor = new Processor([])
  let syntax = { parse: prs, stringify: str }
  let result = await processor.process('a{}', { parser: syntax, from: 'a' })
  expect(result.css).toBe('ok')
})

it('uses custom stringifier', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  let processor = new Processor([])
  let result = await processor.process('a{}', { stringifier: str, from: 'a' })
  expect(console.warn).not.toHaveBeenCalled()
  expect(result.css).toBe('!')
})

it('uses custom stringifier from object', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  let processor = new Processor([])
  let syntax = { parse: prs, stringify: str }
  let result = await processor.process('', { stringifier: syntax, from: 'a' })
  expect(console.warn).not.toHaveBeenCalled()
  expect(result.css).toBe('!')
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
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  let processor = new Processor([() => {}])
  let result = await processor.process('a{}', {
    syntax: { parse: prs, stringify: str },
    from: undefined
  })
  expect(console.warn).not.toHaveBeenCalled()
  expect(result.css).toBe('ok!')
})

it('contains PostCSS version', () => {
  expect(new Processor().version).toMatch(/\d+.\d+.\d+/)
})

it('throws on syntax as plugin', () => {
  let processor = new Processor([() => {}])
  expect(() => {
    processor.use({
      // @ts-expect-error
      parse() {}
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

it('returns NoWorkResult object', async () => {
  let noWorkResult = new Processor().process('a{}')

  expect(noWorkResult).toBeInstanceOf(NoWorkResult)
})

it('parses CSS only on root access when no plugins are specified', async () => {
  let noWorkResult = new Processor().process('a{}')
  let result = await noWorkResult
  // @ts-ignore
  expect(noWorkResult._root).toBeUndefined()
  expect(result.root.nodes).toHaveLength(1)
  // @ts-ignore
  expect(noWorkResult._root).toBeDefined()
  expect(noWorkResult.root.nodes).toHaveLength(1)
})

// @NOTE: couldn't spy on console.warn because warnOnce was triggered before
// in other tests. Spying on async() instead
it('warns about missed from with empty processor', async () => {
  let processor = new Processor()
  let r = new Result(processor, new Root({}), {})
  let spy = jest
    .spyOn(NoWorkResult.prototype, 'async')
    .mockImplementation(() => Promise.resolve(r))

  processor.process('a{}').css
  expect(spy).not.toHaveBeenCalled()

  await processor.process('a{}')
  expect(spy).toHaveBeenCalledTimes(1)
  spy.mockRestore()
})

it('catches error with empty processor', async () => {
  let noWorkResult = new Processor().process('a {')

  noWorkResult.root

  let err = await catchError(async () => await noWorkResult)

  noWorkResult.catch(e => {
    expect(e).toBeInstanceOf(CssSyntaxError)
  })

  expect(err).toBeInstanceOf(CssSyntaxError)
})

it('supports plugins returning processors', () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  let a = (): void => {}
  let processor = new Processor()
  let other: any = (postcss as any).plugin('test', () => {
    return new Processor([a])
  })
  processor.use(other)
  expect(processor.plugins).toEqual([a])
})

it('supports plugin creators returning processors', () => {
  let a = (): void => {}
  let processor = new Processor()
  let other = (() => {
    return new Processor([a])
  }) as PluginCreator<void>
  other.postcss = true
  processor.use(other)
  expect(processor.plugins).toEqual([a])
})

it('uses custom syntax for document', async () => {
  let customParser: Parser<Document> = () => {
    return new Document({
      nodes: [
        new Root({
          raws: {
            codeBefore: '<html>\n<head>\n<style id="id1">',
            after: '\n\n\n'
          },
          nodes: [new Rule({ selector: 'a' })]
        }),
        new Root({
          raws: {
            codeBefore: '</style>\n<style id="id2">',
            after: '\n',
            codeAfter: '</style>\n</head>'
          },
          nodes: [new Rule({ selector: 'b' })]
        })
      ]
    })
  }

  let customStringifier: Stringifier = (doc, builder) => {
    if (doc.type === 'document') {
      for (let root of doc.nodes) {
        if (root.raws.codeBefore) {
          builder(root.raws.codeBefore, root)
        }

        builder(root.toString(), root)

        if (root.raws.codeAfter) {
          builder(root.raws.codeAfter, root)
        }
      }
    }
  }

  let processor = new Processor([() => {}])
  let result = await processor.process('a{}', {
    syntax: {
      parse: customParser,
      stringify: customStringifier
    },
    from: undefined
  })

  expect(result.css).toEqual(
    '<html>\n<head>\n<style id="id1">' +
      'a {}\n\n\n' +
      '</style>\n<style id="id2">' +
      'b {}\n' +
      '</style>\n</head>'
  )
})
