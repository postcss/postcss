// @ts-ignore type definitions for nanodelay@1 are wrong.
import { delay } from 'nanodelay'
import { restoreAll, spyOn } from 'nanospy'
import { resolve as pathResolve } from 'path'
import { test } from 'uvu'
import { equal, instance, is, match, not, throws, type } from 'uvu/assert'

import CssSyntaxError from '../lib/css-syntax-error.js'
import LazyResult from '../lib/lazy-result.js'
import NoWorkResult from '../lib/no-work-result.js'
import postcss, {
  Document,
  Node,
  parse,
  Parser,
  Plugin,
  PluginCreator,
  Result,
  Root,
  Stringifier
} from '../lib/postcss.js'
import Processor from '../lib/processor.js'
import Rule from '../lib/rule.js'

test.after.each(() => {
  restoreAll()
})

function prs(): Root {
  return new Root({ raws: { after: 'ok' } })
}

function str(node: Node, builder: (s: string) => void): void {
  builder(`${node.raws.after}!`)
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

test('adds new plugins', () => {
  let a = (): void => {}
  let processor = new Processor()
  processor.use(a)
  equal(processor.plugins, [a])
})

test('adds new plugin by object', () => {
  let a = (): void => {}
  let processor = new Processor()
  processor.use({ postcss: a })
  equal(processor.plugins, [a])
})

test('adds new plugin by object-function', () => {
  let a = (): void => {}
  let obj: any = () => {}
  obj.postcss = a
  let processor = new Processor()
  processor.use(obj)
  equal(processor.plugins, [a])
})

test('adds new processors of another postcss instance', () => {
  let a = (): void => {}
  let processor = new Processor()
  let other = new Processor([a])
  processor.use(other)
  equal(processor.plugins, [a])
})

test('adds new processors from object', () => {
  let a = (): void => {}
  let processor = new Processor()
  let other = new Processor([a])
  processor.use({ postcss: other })
  equal(processor.plugins, [a])
})

test('returns itself', () => {
  let a = (): void => {}
  let b = (): void => {}
  let processor = new Processor()
  equal(processor.use(a).use(b).plugins, [a, b])
})

test('throws on wrong format', () => {
  let pr = new Processor()
  throws(() => {
    // @ts-expect-error
    pr.use(1)
  }, /1 is not a PostCSS plugin/)
})

test('processes CSS', () => {
  let result = beforeFix.process('a::before{top:0}')
  is(result.css, 'a::before{content:"";top:0}')
})

test('processes parsed AST', () => {
  let root = parse('a::before{top:0}')
  let result = beforeFix.process(root)
  is(result.css, 'a::before{content:"";top:0}')
})

test('processes previous result', () => {
  let result = new Processor([() => {}]).process('a::before{top:0}')
  result = beforeFix.process(result)
  is(result.css, 'a::before{content:"";top:0}')
})

test('takes maps from previous result', () => {
  let one = new Processor([() => {}]).process('a{}', {
    from: 'a.css',
    map: { inline: false },
    to: 'b.css'
  })
  let two = new Processor([() => {}]).process(one, { to: 'c.css' })
  equal(two.map.toJSON().sources, ['a.css'])
})

test('inlines maps from previous result', () => {
  let one = new Processor([() => {}]).process('a{}', {
    from: 'a.css',
    map: { inline: false },
    to: 'b.css'
  })
  let two = new Processor([() => {}]).process(one, {
    map: { inline: true },
    to: 'c.css'
  })
  type(two.map, 'undefined')
})

test('throws with file name', () => {
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

  is(error?.file, pathResolve('a.css'))
  match(String(error?.message), /a.css:1:1: Unclosed block$/)
})

test('allows to replace Root', () => {
  let processor = new Processor([
    (css, result) => {
      result.root = new Root()
    }
  ])
  is(processor.process('a {}').css, '')
})

test('returns LazyResult object', () => {
  let result = new Processor([() => {}]).process('a{}')
  is(result instanceof LazyResult, true)
  is(result.css, 'a{}')
  is(result.toString(), 'a{}')
})

test('calls all plugins once', async () => {
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
  is(calls, 'ab')
})

test('parses, converts and stringifies CSS', () => {
  is(
    typeof new Processor([
      (css: Root) => {
        equal(css instanceof Root, true)
      }
    ]).process('a {}').css,
    'string'
  )
})

test('send result to plugins', () => {
  let processor = new Processor([() => {}])
  processor
    .use((css, result) => {
      is(result instanceof Result, true)
      equal(result.processor, processor)
      equal(result.opts, { map: true })
      equal(result.root, css)
    })
    .process('a {}', { from: undefined, map: true })
})

test('accepts source map from PostCSS', () => {
  let one = new Processor([() => {}]).process('a{}', {
    from: 'a.css',
    map: { inline: false },
    to: 'b.css'
  })
  let two = new Processor([() => {}]).process(one.css, {
    from: 'b.css',
    map: { inline: false, prev: one.map },
    to: 'c.css'
  })
  equal(two.map.toJSON().sources, ['a.css'])
})

test('supports async plugins', async () => {
  let starts = 0
  let finish = 0
  let async1 = (css: Root): Promise<void> =>
    new Promise<void>(resolve => {
      starts += 1
      setTimeout(() => {
        equal(starts, 1)

        css.append('a {}')
        finish += 1
        resolve()
      }, 1)
    })
  let async2 = (css: Root): Promise<void> =>
    new Promise<void>(resolve => {
      equal(starts, 1)
      equal(finish, 1)

      starts += 1
      setTimeout(() => {
        css.append('b {}')
        finish += 1
        resolve()
      }, 1)
    })
  let r = await new Processor([async1, async2]).process('', { from: 'a' })
  is(starts, 2)
  is(finish, 2)
  is(r.css, 'a {}b {}')
})

test('works async without plugins', async () => {
  let r = await new Processor([() => {}]).process('a {}', { from: 'a' })
  is(r.css, 'a {}')
})

test('runs async plugin only once', async () => {
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
  is(calls, 1)
})

test('supports async errors', async () => {
  let error = new Error('Async')
  let async = (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      reject(error)
    })
  }
  let result = new Processor([async]).process('', { from: undefined })
  let err1 = await catchError(async () => await result)
  equal(err1, error)

  let err2: Error | undefined
  result.catch(catched => {
    err2 = catched
  })
  await delay(10)
  equal(err2, error)
})

test('supports sync errors in async mode', async () => {
  let error = new Error('Async')
  let async = (): void => {
    throw error
  }
  let err = await catchError(() =>
    new Processor([async]).process('', { from: undefined })
  )
  equal(err, error)
})

test('throws parse error in async', async () => {
  let err = await catchError(() =>
    new Processor([() => {}]).process('a{', { from: undefined })
  )
  is(err.message, '<css input>:1:1: Unclosed block')
})

test('throws error on sync method to async plugin', () => {
  let async = (): Promise<void> => {
    return new Promise<void>(resolve => {
      resolve()
    })
  }
  throws(() => {
    new Processor([async]).process('a{}').css
  }, /async/)
})

test('throws a sync call in async running', async () => {
  let async = (): Promise<void> =>
    new Promise<void>(resolve => setTimeout(resolve, 1))

  let processor = new Processor([async]).process('a{}', { from: 'a.css' })
  processor.async()

  throws(() => {
    processor.sync()
  }, /then/)
})

test('remembers errors', async () => {
  let calls = 0
  let plugin: Plugin = {
    Once() {
      calls += 1
      throw new Error('test')
    },
    postcssPlugin: 'plugin'
  }

  let processing = postcss([plugin]).process('a{}', { from: undefined })

  throws(() => {
    processing.css
  }, 'test')
  throws(() => {
    processing.css
  }, 'test')
  throws(() => {
    processing.root
  }, 'test')

  let asyncError: any
  try {
    await processing
  } catch (e) {
    asyncError = e
  }
  is(asyncError.message, 'test')

  is(calls, 1)
})

test('checks plugin compatibility', () => {
  let error = spyOn(console, 'error', () => {})
  let warn = spyOn(console, 'warn', () => {})

  let plugin = (postcss as any).plugin('test', () => {
    return () => {
      throw new Error('Er')
    }
  })
  let func = plugin()
  equal(warn.callCount, 1)
  func.postcssVersion = '2.1.5'

  function processBy(version: string): void {
    let processor = new Processor([func])
    processor.version = version
    processor.process('a{}').css
  }

  throws(() => {
    processBy('1.0.0')
  }, 'Er')
  equal(error.callCount, 1)
  equal(error.calls, [
    [
      'Unknown error from PostCSS plugin. ' +
        'Your current PostCSS version is 1.0.0, but test uses 2.1.5. ' +
        'Perhaps this is the source of the error below.'
    ]
  ])

  throws(() => {
    processBy('3.0.0')
  }, 'Er')
  equal(error.callCount, 2)

  throws(() => {
    processBy('2.0.0')
  }, 'Er')
  equal(error.callCount, 3)

  throws(() => {
    processBy('2.1.0')
  }, 'Er')
  equal(error.callCount, 3)
})

test('sets last plugin to result', async () => {
  let plugin1 = (css: Root, result: Result): void => {
    equal(result.lastPlugin, plugin1)
  }
  let plugin2 = (css: Root, result: Result): void => {
    equal(result.lastPlugin, plugin2)
  }

  let processor = new Processor([plugin1, plugin2])
  let result = await processor.process('a{}', { from: undefined })
  equal(result.lastPlugin, plugin2)
})

test('uses custom parsers', async () => {
  let processor = new Processor([])
  let result = await processor.process('a{}', { from: undefined, parser: prs })
  is(result.css, 'ok')
})

test('uses custom parsers from object', async () => {
  let processor = new Processor([])
  let syntax = { parse: prs, stringify: str }
  let result = await processor.process('a{}', { from: 'a', parser: syntax })
  equal(result.css, 'ok')
})

test('uses custom stringifier', async () => {
  let processor = new Processor([])
  let result = await processor.process('a{}', { from: 'a', stringifier: str })
  is(result.css, '!')
})

test('uses custom stringifier from object', async () => {
  let processor = new Processor([])
  let syntax = { parse: prs, stringify: str }
  let result = await processor.process('', { from: 'a', stringifier: syntax })
  is(result.css, '!')
})

test('uses custom stringifier with source maps', async () => {
  let processor = new Processor([])
  let result = await processor.process('a{}', {
    from: undefined,
    map: true,
    stringifier: str
  })
  match(result.css, /!\n\/\*# sourceMap/)
})

test('uses custom syntax', async () => {
  let processor = new Processor([() => {}])
  let result = await processor.process('a{}', {
    from: undefined,
    syntax: { parse: prs, stringify: str }
  })
  is(result.css, 'ok!')
})

test('contains PostCSS version', () => {
  match(new Processor().version, /\d+.\d+.\d+/)
})

test('throws on syntax as plugin', () => {
  let processor = new Processor([() => {}])
  throws(() => {
    processor.use({
      // @ts-expect-error
      parse() {}
    })
  }, /syntax/)
})

test('warns about missed from', async () => {
  let warn = spyOn(console, 'warn', () => {})
  let processor = new Processor([() => {}])

  processor.process('a{}').css
  equal(warn.calls, [])

  await processor.process('a{}')
  equal(warn.calls, [
    [
      'Without `from` option PostCSS could generate wrong source map ' +
        'and will not find Browserslist config. Set it to CSS file path ' +
        'or to `undefined` to prevent this warning.'
    ]
  ])
})

test('returns NoWorkResult object', async () => {
  let result = new Processor().process('a{}')
  instance(result, NoWorkResult)
})

test('without plugins parses CSS only on root access', async () => {
  let noWorkResult = new Processor().process('a{}')
  let result = await noWorkResult
  // @ts-expect-error
  type(noWorkResult._root, 'undefined')
  is(result.root.nodes.length, 1)
  // @ts-expect-error
  not.type(noWorkResult._root, 'undefined')
  is(noWorkResult.root.nodes.length, 1)
})

test('catches error with empty processor', async () => {
  let noWorkResult = new Processor().process('a {')

  try {
    noWorkResult.root
  } catch {}

  let err = await catchError(async () => await noWorkResult)

  noWorkResult.catch(e => {
    instance(e, CssSyntaxError)
  })

  instance(err, CssSyntaxError)
})

test('throws an error on root access on no plugins mode', () => {
  throws(() => {
    postcss().process('// invalid', { from: 'a' }).root
  }, 'Unknown word')
})

test('supports plugins returning processors', () => {
  let warn = spyOn(console, 'warn', () => {})
  let a = (): void => {}
  let processor = new Processor()
  let other: any = (postcss as any).plugin('test', () => {
    return new Processor([a])
  })
  processor.use(other)
  equal(processor.plugins, [a])
  equal(warn.callCount, 1)
})

test('supports plugin creators returning processors', () => {
  let a = (): void => {}
  let processor = new Processor()
  let other = (() => {
    return new Processor([a])
  }) as PluginCreator<void>
  other.postcss = true
  processor.use(other)
  equal(processor.plugins, [a])
})

test('uses custom syntax for document', async () => {
  let customParser: Parser<Document> = () => {
    return new Document({
      nodes: [
        new Root({
          nodes: [new Rule({ selector: 'a' })],
          raws: {
            after: '\n\n\n',
            codeBefore: '<html>\n<head>\n<style id="id1">'
          }
        }),
        new Root({
          nodes: [new Rule({ selector: 'b' })],
          raws: {
            after: '\n',
            codeAfter: '</style>\n</head>',
            codeBefore: '</style>\n<style id="id2">'
          }
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
    from: undefined,
    syntax: {
      parse: customParser,
      stringify: customStringifier
    }
  })

  is(
    result.css,
    '<html>\n<head>\n<style id="id1">' +
      'a {}\n\n\n' +
      '</style>\n<style id="id2">' +
      'b {}\n' +
      '</style>\n</head>'
  )
})

test.run()
