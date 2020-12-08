// based on map.test.ts

import { removeSync } from 'fs-extra'
import { join, parse } from 'path'
import { existsSync } from 'fs'

import postcss, { Root } from '../lib/postcss.js'

let dir = join(__dirname, 'map-fixtures')

afterEach(() => {
  if (existsSync(dir)) removeSync(dir)
})

it('adds annotation-lines to sourcemap', () => {
  let css = 'a {\n  color: black;\n  }'
  let processor = postcss((root: Root) => {
    root.walkRules(rule => {
      rule.selector = 'strong'
    })
    root.walkDecls(decl => {
      decl.parent?.prepend(decl.clone({ prop: 'background', value: 'black' }))
    })
  })

  let result = processor.process(css, {
    from: 'a.css',
    to: 'b.css',
    map: true
  })
  //let map = read(result) // SourceMapConsumer is not needed here

  let expectedAnnotations = [
    '/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImEuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsaUJBQVk7RUFBWixZQUFZO0VBQ1o7QTtBIiwiZmlsZSI6ImIuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiYSB7XG4gIGNvbG9yOiBibGFjaztcbiAgfSJdfQ== */'
  ]

  let sourceLines = 0
  let mappedLines = null
  for (let [lineIdx, line] of result.css.split('\n').entries()) {
    sourceLines++
    if (line.slice(0, 4) !== '/*# ') continue // no annotation

    expect(line).toEqual(expectedAnnotations.shift())

    if (
      line.slice(0, 50) === '/*# sourceMappingURL=data:application/json;base64,'
    ) {
      // found sourcemap annotation
      // verify: all source lines are mapped
      let start = line.indexOf(',')
      let end = line.lastIndexOf(' ')
      let map = JSON.parse(
        Buffer.from(line.slice(start + 1, end), 'base64').toString()
      )
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      mappedLines = (map.mappings.match(/;/g) || []).length + 1

      // verify: two unmapped lines were added at end-of-file
      // eslint-disable-next-line jest/no-conditional-expect
      expect(map.mappings.slice(-4)).toEqual(';A;A')
    }
  }

  // verify: all source lines are mapped
  // (only test last sourcemap)
  expect(mappedLines).toEqual(sourceLines)
})
