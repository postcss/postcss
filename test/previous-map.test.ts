import { removeSync, outputFileSync } from 'fs-extra'
import { SourceMapConsumer } from 'source-map-js'
import { pathToFileURL } from 'url'
import { existsSync } from 'fs'
import { join } from 'path'

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

afterEach(() => {
  if (existsSync(dir)) removeSync(dir)
})

it('misses property if no map', () => {
  expect(parse('a{}').source?.input.map).not.toBeDefined()
})

it('creates property if map present', () => {
  let root = parse('a{}', { map: { prev: map } })
  expect(root.source?.input.map.text).toEqual(map)
})

it('returns consumer', () => {
  let obj = parse('a{}', { map: { prev: map } }).source?.input.map.consumer()
  expect(obj instanceof SourceMapConsumer).toBe(true)
})

it('sets annotation property', () => {
  let mapOpts = { map: { prev: map } }

  let root1 = parse('a{}', mapOpts)
  expect(root1.source?.input.map.annotation).not.toBeDefined()

  let root2 = parse('a{}/*# sourceMappingURL=a.css.map */', mapOpts)
  expect(root2.source?.input.map.annotation).toEqual('a.css.map')
})

it('checks previous sources content', () => {
  let map2: any = {
    version: 3,
    file: 'b',
    sources: ['a'],
    names: [],
    mappings: ''
  }

  let opts = { map: { prev: map2 } }
  expect(parse('a{}', opts).source?.input.map.withContent()).toBe(false)

  map2.sourcesContent = ['a{}']
  expect(parse('a{}', opts).source?.input.map.withContent()).toBe(true)
})

it('decodes base64 maps', () => {
  let b64 = Buffer.from(map).toString('base64')
  let css =
    'a{}\n' + `/*# sourceMappingURL=data:application/json;base64,${b64} */`

  expect(parse(css).source?.input.map.text).toEqual(map)
})

it('decodes base64 UTF-8 maps', () => {
  let b64 = Buffer.from(map).toString('base64')
  let css =
    'a{}\n/*# sourceMappingURL=data:application/json;' +
    'charset=utf-8;base64,' +
    b64 +
    ' */'

  expect(parse(css).source?.input.map.text).toEqual(map)
})

it('accepts different name for base64 maps with UTF-8 encoding', () => {
  let b64 = Buffer.from(map).toString('base64')
  let css =
    'a{}\n/*# sourceMappingURL=data:application/json;' +
    'charset=utf8;base64,' +
    b64 +
    ' */'

  expect(parse(css).source?.input.map.text).toEqual(map)
})

it('decodes URI maps', () => {
  let uri = 'data:application/json,' + decodeURI(map)
  let css = `a{}\n/*# sourceMappingURL=${uri} */`

  expect(parse(css).source?.input.map.text).toEqual(map)
})

it('decodes URI UTF-8 maps', () => {
  let uri = decodeURI(map)
  let css =
    'a{}\n/*# sourceMappingURL=data:application/json;' +
    'charset=utf-8,' +
    uri +
    ' */'

  expect(parse(css).source?.input.map.text).toEqual(map)
})

it('accepts different name for URI maps with UTF-8 encoding', () => {
  let uri = decodeURI(map)
  let css =
    'a{}\n/*# sourceMappingURL=data:application/json;' +
    'charset=utf8,' +
    uri +
    ' */'

  expect(parse(css).source?.input.map.text).toEqual(map)
})

it('removes map on request', () => {
  let uri = 'data:application/json,' + decodeURI(map)
  let css = `a{}\n/*# sourceMappingURL=${uri} */`

  let input = parse(css, { map: { prev: false } }).source?.input
  expect(input?.map).not.toBeDefined()
})

it('raises on unknown inline encoding', () => {
  let css =
    'a { }\n/*# sourceMappingURL=data:application/json;' +
    'md5,68b329da9893e34099c7d8ad5cb9c940*/'

  expect(() => {
    parse(css)
  }).toThrow('Unsupported source map encoding md5')
})

it('raises on unknown map format', () => {
  expect(() => {
    // @ts-expect-error
    parse('a{}', { map: { prev: 1 } })
  }).toThrow('Unsupported previous source map format: 1')
})

it('reads map from annotation', () => {
  let file = join(dir, 'a.map')
  outputFileSync(file, map)
  let root = parse('a{}\n/*# sourceMappingURL=a.map */', { from: file })

  expect(root.source?.input.map.text).toEqual(map)
  expect(root.source?.input.map.root).toEqual(dir)
})

it('reads only the last map from annotation', () => {
  let file = join(dir, 'c.map')
  outputFileSync(file, map)
  let root = parse(
    'a{}' +
      '\n/*# sourceMappingURL=a.map */' +
      '\n/*# sourceMappingURL=b.map */' +
      '\n/*# sourceMappingURL=c.map */',
    { from: file }
  )

  expect(root.source?.input.map.text).toEqual(map)
  expect(root.source?.input.map.root).toEqual(dir)
})

it('sets unique name for inline map', () => {
  let map2 = {
    version: 3,
    sources: ['a'],
    names: [],
    mappings: ''
  }

  let opts = { map: { prev: map2 } }
  let file1 = parse('a{}', opts).source?.input.map.file
  let file2 = parse('a{}', opts).source?.input.map.file

  expect(file1).toMatch(/^<input css [\w-]+>$/)
  expect(file1).not.toEqual(file2)
})

it('accepts an empty mappings string', () => {
  expect(() => {
    let emptyMap = {
      version: 3,
      sources: [],
      names: [],
      mappings: ''
    }
    parse('body{}', { map: { prev: emptyMap } })
  }).not.toThrow()
})

it('accepts a function', () => {
  let css = 'body{}\n/*# sourceMappingURL=a.map */'
  let file = join(dir, 'previous-sourcemap-function.map')
  outputFileSync(file, map)
  let opts = {
    map: {
      prev: () => file
    }
  }
  let root = parse(css, opts)
  expect(root.source?.input.map.text).toEqual(map)
  expect(root.source?.input.map.annotation).toEqual('a.map')
})

it('calls function with opts.from', () => {
  expect.assertions(1)

  let css = 'body{}\n/*# sourceMappingURL=a.map */'
  let file = join(dir, 'previous-sourcemap-function.map')
  outputFileSync(file, map)
  parse(css, {
    from: 'a.css',
    map: {
      prev: from => {
        expect(from).toEqual('a.css')
        return file
      }
    }
  })
})

it('raises when function returns invalid path', () => {
  let css = 'body{}\n/*# sourceMappingURL=a.map */'
  let fakeMap = Number.MAX_SAFE_INTEGER.toString() + '.map'
  let fakePath = join(dir, fakeMap)
  let opts = {
    map: {
      prev: () => fakePath
    }
  }
  expect(() => {
    parse(css, opts)
  }).toThrow('Unable to load previous source map: ' + fakePath)
})

it('uses source map path as a root', () => {
  let from = join(dir, 'a.css')
  outputFileSync(
    join(dir, 'maps', 'a.map'),
    JSON.stringify({
      version: 3,
      mappings: 'AAAA,CAAC;EAAC,CAAC,EAAC,CAAC',
      sources: ['../../test.scss'],
      names: [],
      file: 'test.css'
    })
  )
  let root = parse('a{}\n/*# sourceMappingURL=maps/a.map */', { from })
  expect(root.source?.input.origin(1, 1)).toEqual({
    url: pathToFileURL(join(dir, '..', 'test.scss')).href,
    file: join(dir, '..', 'test.scss'),
    line: 1,
    column: 1
  })
})

it('uses current file path for source map', () => {
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
  expect(root.source?.input.origin(1, 1)).toEqual({
    url: pathToFileURL(join(__dirname, 'dir', 'test.scss')).href,
    file: join(__dirname, 'dir', 'test.scss'),
    line: 1,
    column: 1
  })
})

it('works with non-file sources', () => {
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
  expect(root.source?.input.origin(1, 1)).toEqual({
    url: 'http://example.com/test.scss',
    line: 1,
    column: 1
  })
})

it('works with index map', () => {
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
  expect((root as any).source.input.origin(1, 1).file).toEqual(
    join(__dirname, 'b.css')
  )
})
