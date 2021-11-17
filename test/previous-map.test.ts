import { removeSync, outputFileSync } from 'fs-extra'
import { SourceMapConsumer } from 'source-map-js'
import { pathToFileURL } from 'url'
import { existsSync } from 'fs'
import { join } from 'path'
import { test } from 'uvu'
import { is, type, equal, match, throws, not } from 'uvu/assert'

import { parse } from '../lib/postcss.js'

let dir = join(__dirname, 'prevmap-fixtures')
let mapObj = {
  version: 3,
  file: null,
  sources: [],
  names: [],
  mappings: ''
}
let map = JSON.stringify(mapObj)

test.after.each(() => {
  if (existsSync(dir)) removeSync(dir)
})

test('misses property if no map', () => {
  type(parse('a{}').source?.input.map, 'undefined')
})

test('creates property if map present', () => {
  let root = parse('a{}', { map: { prev: map } })
  is(root.source?.input.map.text, map)
})

test('returns consumer', () => {
  let obj = parse('a{}', { map: { prev: map } }).source?.input.map.consumer()
  is(obj instanceof SourceMapConsumer, true)
})

test('sets annotation property', () => {
  let mapOpts = { map: { prev: map } }

  let root1 = parse('a{}', mapOpts)
  type(root1.source?.input.map.annotation, 'undefined')

  let root2 = parse('a{}/*# sourceMappingURL=a.css.map */', mapOpts)
  is(root2.source?.input.map.annotation, 'a.css.map')
})

test('checks previous sources content', () => {
  let map2: any = {
    version: 3,
    file: 'b',
    sources: ['a'],
    names: [],
    mappings: ''
  }

  let opts = { map: { prev: map2 } }
  is(parse('a{}', opts).source?.input.map.withContent(), false)

  map2.sourcesContent = ['a{}']
  is(parse('a{}', opts).source?.input.map.withContent(), true)
})

test('decodes base64 maps', () => {
  let b64 = Buffer.from(map).toString('base64')
  let css =
    'a{}\n' + `/*# sourceMappingURL=data:application/json;base64,${b64} */`

  is(parse(css).source?.input.map.text, map)
})

test('decodes base64 UTF-8 maps', () => {
  let b64 = Buffer.from(map).toString('base64')
  let css =
    'a{}\n/*# sourceMappingURL=data:application/json;' +
    'charset=utf-8;base64,' +
    b64 +
    ' */'

  is(parse(css).source?.input.map.text, map)
})

test('accepts different name for base64 maps with UTF-8 encoding', () => {
  let b64 = Buffer.from(map).toString('base64')
  let css =
    'a{}\n/*# sourceMappingURL=data:application/json;' +
    'charset=utf8;base64,' +
    b64 +
    ' */'

  is(parse(css).source?.input.map.text, map)
})

test('decodes URI maps', () => {
  let uri = 'data:application/json,' + decodeURI(map)
  let css = `a{}\n/*# sourceMappingURL=${uri} */`

  is(parse(css).source?.input.map.text, map)
})

test('decodes URI UTF-8 maps', () => {
  let uri = decodeURI(map)
  let css =
    'a{}\n/*# sourceMappingURL=data:application/json;' +
    'charset=utf-8,' +
    uri +
    ' */'

  is(parse(css).source?.input.map.text, map)
})

test('accepts different name for URI maps with UTF-8 encoding', () => {
  let uri = decodeURI(map)
  let css =
    'a{}\n/*# sourceMappingURL=data:application/json;' +
    'charset=utf8,' +
    uri +
    ' */'

  is(parse(css).source?.input.map.text, map)
})

test('removes map on request', () => {
  let uri = 'data:application/json,' + decodeURI(map)
  let css = `a{}\n/*# sourceMappingURL=${uri} */`

  let input = parse(css, { map: { prev: false } }).source?.input
  type(input?.map, 'undefined')
})

test('raises on unknown inline encoding', () => {
  let css =
    'a { }\n/*# sourceMappingURL=data:application/json;' +
    'md5,68b329da9893e34099c7d8ad5cb9c940*/'

  throws(() => {
    parse(css)
  }, 'Unsupported source map encoding md5')
})

test('raises on unknown map format', () => {
  throws(() => {
    // @ts-expect-error
    parse('a{}', { map: { prev: 1 } })
  }, 'Unsupported previous source map format: 1')
})

test('reads map from annotation', () => {
  let file = join(dir, 'a.map')
  outputFileSync(file, map)
  let root = parse('a{}\n/*# sourceMappingURL=a.map */', { from: file })

  is(root.source?.input.map.text, map)
  is(root.source?.input.map.root, dir)
})

test('reads only the last map from annotation', () => {
  let file = join(dir, 'c.map')
  outputFileSync(file, map)
  let root = parse(
    'a{}' +
      '\n/*# sourceMappingURL=a.map */' +
      '\n/*# sourceMappingURL=b.map */' +
      '\n/*# sourceMappingURL=c.map */',
    { from: file }
  )

  is(root.source?.input.map.text, map)
  is(root.source?.input.map.root, dir)
})

test('sets unique name for inline map', () => {
  let map2 = {
    version: 3,
    sources: ['a'],
    names: [],
    mappings: ''
  }

  let opts = { map: { prev: map2 } }
  let file1 = parse('a{}', opts).source?.input.map.file
  let file2 = parse('a{}', opts).source?.input.map.file

  match(String(file1), /^<input css [\w-]+>$/)
  is.not(file1, file2)
})

test('accepts an empty mappings string', () => {
  not.throws(() => {
    let emptyMap = {
      version: 3,
      sources: [],
      names: [],
      mappings: ''
    }
    parse('body{}', { map: { prev: emptyMap } })
  })
})

test('accepts a function', () => {
  let css = 'body{}\n/*# sourceMappingURL=a.map */'
  let file = join(dir, 'previous-sourcemap-function.map')
  outputFileSync(file, map)
  let opts = {
    map: {
      prev: () => file
    }
  }
  let root = parse(css, opts)
  is(root.source?.input.map.text, map)
  is(root.source?.input.map.annotation, 'a.map')
})

test('calls function with opts.from', () => {
  let css = 'body{}\n/*# sourceMappingURL=a.map */'
  let file = join(dir, 'previous-sourcemap-function.map')
  outputFileSync(file, map)
  parse(css, {
    from: 'a.css',
    map: {
      prev: from => {
        is(from, 'a.css')
        return file
      }
    }
  })
})

test('raises when function returns invalid path', () => {
  let css = 'body{}\n/*# sourceMappingURL=a.map */'
  let fakeMap = Number.MAX_SAFE_INTEGER.toString() + '.map'
  let fakePath = join(dir, fakeMap)
  let opts = {
    map: {
      prev: () => fakePath
    }
  }
  throws(() => {
    parse(css, opts)
  }, 'Unable to load previous source map: ' + fakePath)
})

test('uses source map path as a root', () => {
  let from = join(dir, 'a.css')
  outputFileSync(
    join(dir, 'maps', 'a.map'),
    JSON.stringify({
      version: 3,
      file: 'test.css',
      sources: ['../../test.scss'],
      mappings: 'AACA,CAAC,CACG,GAAG,CAAC;EACF,KAAK,EAAE,GAAI;CACZ',
      names: []
    })
  )
  let root = parse(
    '* div {\n  color: red;\n  }\n/*# sourceMappingURL=maps/a.map */',
    { from }
  )
  equal(root.source?.input.origin(1, 3, 1, 5), {
    url: pathToFileURL(join(dir, '..', 'test.scss')).href,
    file: join(dir, '..', 'test.scss'),
    line: 3,
    column: 4,
    endLine: 3,
    endColumn: 7
  })
})

test('uses current file path for source map', () => {
  let root = parse('a{b:1}', {
    from: join(__dirname, 'dir', 'subdir', 'a.css'),
    map: {
      prev: {
        version: 3,
        mappings: 'AAAA,CAAC;EAAC,CAAC,EAAC,CAAC',
        sources: ['../test.scss'],
        names: [],
        file: 'test.css'
      }
    }
  })
  equal(root.source?.input.origin(1, 1), {
    url: pathToFileURL(join(__dirname, 'dir', 'test.scss')).href,
    file: join(__dirname, 'dir', 'test.scss'),
    line: 1,
    column: 1,
    endLine: undefined,
    endColumn: undefined
  })
})

test('works with non-file sources', () => {
  let root = parse('a{b:1}', {
    from: join(__dirname, 'dir', 'subdir', 'a.css'),
    map: {
      prev: {
        version: 3,
        mappings: 'AAAA,CAAC;EAAC,CAAC,EAAC,CAAC',
        sources: ['http://example.com/test.scss'],
        names: [],
        file: 'test.css'
      }
    }
  })
  equal(root.source?.input.origin(1, 1), {
    url: 'http://example.com/test.scss',
    line: 1,
    column: 1,
    endLine: undefined,
    endColumn: undefined
  })
})

test('works with index map', () => {
  let root = parse('body {\nwidth:100%;\n}', {
    from: join(__dirname, 'a.css'),
    map: {
      prev: {
        version: 3,
        sections: [
          {
            offset: { line: 0, column: 0 },
            map: {
              version: 3,
              mappings: 'AAAA;AACA;AACA;',
              sources: ['b.css'],
              sourcesContent: ['body {\nwidth:100%;\n}']
            }
          }
        ]
      }
    }
  })
  is((root as any).source.input.origin(1, 1).file, join(__dirname, 'b.css'))
})

test.run()
