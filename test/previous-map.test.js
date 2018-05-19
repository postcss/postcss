const parse = require('../lib/parse')

const mozilla = require('source-map')
const path = require('path')
const fs = require('fs-extra')

const dir = path.join(__dirname, 'prevmap-fixtures')
const mapObj = {
  version: 3,
  file: null,
  sources: [],
  names: [],
  mappings: ''
}
const map = JSON.stringify(mapObj)

afterEach(() => {
  if (fs.existsSync(dir)) fs.removeSync(dir)
})

it('misses property if no map', () => {
  expect(parse('a{}').source.input.map).not.toBeDefined()
})

it('creates property if map present', () => {
  const root = parse('a{}', { map: { prev: map } })
  expect(root.source.input.map.text).toEqual(map)
})

it('returns consumer', () => {
  const obj = parse('a{}', { map: { prev: map } }).source.input.map.consumer()
  expect(obj instanceof mozilla.SourceMapConsumer).toBeTruthy()
})

it('sets annotation property', () => {
  const mapOpts = { map: { prev: map } }

  const root1 = parse('a{}', mapOpts)
  expect(root1.source.input.map.annotation).not.toBeDefined()

  const root2 = parse('a{}/*# sourceMappingURL=a.css.map */', mapOpts)
  expect(root2.source.input.map.annotation).toEqual('a.css.map')
})

it('checks previous sources content', () => {
  const map2 = {
    version: 3,
    file: 'b',
    sources: ['a'],
    names: [],
    mappings: ''
  }

  const opts = { map: { prev: map2 } }
  expect(parse('a{}', opts).source.input.map.withContent()).toBe(false)

  map2.sourcesContent = ['a{}']
  expect(parse('a{}', opts).source.input.map.withContent()).toBe(true)
})

it('decodes base64 maps', () => {
  const b64 = Buffer.from(map).toString('base64')
  const css = 'a{}\n' +
              `/*# sourceMappingURL=data:application/json;base64,${ b64 } */`

  expect(parse(css).source.input.map.text).toEqual(map)
})

it('decodes base64 UTF-8 maps', () => {
  const b64 = Buffer.from(map).toString('base64')
  const css = 'a{}\n/*# sourceMappingURL=data:application/json;' +
              'charset=utf-8;base64,' + b64 + ' */'

  expect(parse(css).source.input.map.text).toEqual(map)
})

it('accepts different name for UTF-8 encoding', () => {
  const b64 = Buffer.from(map).toString('base64')
  const css = 'a{}\n/*# sourceMappingURL=data:application/json;' +
              'charset=utf8;base64,' + b64 + ' */'

  expect(parse(css).source.input.map.text).toEqual(map)
})

it('decodes URI maps', () => {
  const uri = 'data:application/json,' + decodeURI(map)
  const css = `a{}\n/*# sourceMappingURL=${ uri } */`

  expect(parse(css).source.input.map.text).toEqual(map)
})

it('removes map on request', () => {
  const uri = 'data:application/json,' + decodeURI(map)
  const css = `a{}\n/*# sourceMappingURL=${ uri } */`

  const input = parse(css, { map: { prev: false } }).source.input
  expect(input.map).not.toBeDefined()
})

it('raises on unknown inline encoding', () => {
  const css = 'a { }\n/*# sourceMappingURL=data:application/json;' +
              'md5,68b329da9893e34099c7d8ad5cb9c940*/'

  expect(() => {
    parse(css)
  }).toThrowError('Unsupported source map encoding md5')
})

it('raises on unknown map format', () => {
  expect(() => {
    parse('a{}', { map: { prev: 1 } })
  }).toThrowError('Unsupported previous source map format: 1')
})

it('reads map from annotation', () => {
  const file = path.join(dir, 'a.map')
  fs.outputFileSync(file, map)
  const root = parse('a{}\n/*# sourceMappingURL=a.map */', { from: file })

  expect(root.source.input.map.text).toEqual(map)
  expect(root.source.input.map.root).toEqual(dir)
})

it('sets uniq name for inline map', () => {
  const map2 = {
    version: 3,
    sources: ['a'],
    names: [],
    mappings: ''
  }

  const opts = { map: { prev: map2 } }
  const file1 = parse('a{}', opts).source.input.map.file
  const file2 = parse('a{}', opts).source.input.map.file

  expect(file1).toMatch(/^<input css \d+>$/)
  expect(file1).not.toEqual(file2)
})

it('accepts an empty mappings string', () => {
  const emptyMap = {
    version: 3,
    sources: [],
    names: [],
    mappings: ''
  }
  parse('body{}', { map: { prev: emptyMap } })
})

it('accepts a function', () => {
  const css = 'body{}\n/*# sourceMappingURL=a.map */'
  const file = path.join(dir, 'previous-sourcemap-function.map')
  fs.outputFileSync(file, map)
  const opts = {
    map: {
      prev: () => file
    }
  }
  const root = parse(css, opts)
  expect(root.source.input.map.text).toEqual(map)
  expect(root.source.input.map.annotation).toEqual('a.map')
})

it('calls function with opts.from', () => {
  expect.assertions(1)

  const css = 'body{}\n/*# sourceMappingURL=a.map */'
  const file = path.join(dir, 'previous-sourcemap-function.map')
  fs.outputFileSync(file, map)
  const opts = {
    from: 'a.css',
    map: {
      prev: from => {
        expect(from).toEqual('a.css')
        return file
      }
    }
  }
  parse(css, opts)
})

it('raises when function returns invalid path', () => {
  const css = 'body{}\n/*# sourceMappingURL=a.map */'
  const fakeMap = Number.MAX_SAFE_INTEGER.toString() + '.map'
  const fakePath = path.join(dir, fakeMap)
  const opts = {
    map: {
      prev: () => fakePath
    }
  }
  expect(() => {
    parse(css, opts)
  }).toThrowError('Unable to load previous source map: ' + fakePath)
})
