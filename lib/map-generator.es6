import mozilla from 'source-map'
import path from 'path'

class MapGenerator {
  constructor (stringify, root, opts) {
    this.stringify = stringify
    this.mapOpts = opts.map || { }
    this.root = root
    this.opts = opts
  }

  isMap () {
    if (typeof this.opts.map !== 'undefined') {
      return !!this.opts.map
    }
    return this.previous().length > 0
  }

  previous () {
    if (!this.previousMaps) {
      this.previousMaps = []
      this.root.walk(node => {
        if (node.source && node.source.input.map) {
          let map = node.source.input.map
          if (this.previousMaps.indexOf(map) === -1) {
            this.previousMaps.push(map)
          }
        }
      })
    }

    return this.previousMaps
  }

  isInline () {
    if (typeof this.mapOpts.inline !== 'undefined') {
      return this.mapOpts.inline
    }

    let annotation = this.mapOpts.annotation
    if (typeof annotation !== 'undefined' && annotation !== true) {
      return false
    }

    if (this.previous().length) {
      return this.previous().some(i => i.inline)
    }
    return true
  }

  isSourcesContent () {
    if (typeof this.mapOpts.sourcesContent !== 'undefined') {
      return this.mapOpts.sourcesContent
    }
    if (this.previous().length) {
      return this.previous().some(i => i.withContent())
    }
    return true
  }

  clearAnnotation () {
    if (this.mapOpts.annotation === false) return

    let node
    for (let i = this.root.nodes.length - 1; i >= 0; i--) {
      node = this.root.nodes[i]
      if (node.type !== 'comment') continue
      if (node.text.indexOf('# sourceMappingURL=') === 0) {
        this.root.removeChild(i)
      }
    }
  }

  setSourcesContent () {
    let already = { }
    this.root.walk(node => {
      if (node.source) {
        let from = node.source.input.from
        if (from && !already[from]) {
          already[from] = true
          let relative = this.relative(from)
          this.map.setSourceContent(relative, node.source.input.css)
        }
      }
    })
  }

  applyPrevMaps () {
    for (let prev of this.previous()) {
      let from = this.relative(prev.file)
      let root = prev.root || path.dirname(prev.file)
      let map

      if (this.mapOpts.sourcesContent === false) {
        map = new mozilla.SourceMapConsumer(prev.text)
        if (map.sourcesContent) {
          map.sourcesContent = map.sourcesContent.map(() => null)
        }
      } else {
        map = prev.consumer()
      }

      this.map.applySourceMap(map, from, this.relative(root))
    }
  }

  isAnnotation () {
    if (this.isInline()) {
      return true
    }
    if (typeof this.mapOpts.annotation !== 'undefined') {
      return this.mapOpts.annotation
    }
    if (this.previous().length) {
      return this.previous().some(i => i.annotation)
    }
    return true
  }

  toBase64 (str) {
    if (Buffer) {
      return Buffer.from(str).toString('base64')
    }
    return window.btoa(unescape(encodeURIComponent(str)))
  }

  addAnnotation () {
    let content

    if (this.isInline()) {
      content = 'data:application/json;base64,' +
                this.toBase64(this.map.toString())
    } else if (typeof this.mapOpts.annotation === 'string') {
      content = this.mapOpts.annotation
    } else {
      content = this.outputFile() + '.map'
    }

    let eol = '\n'
    if (this.css.indexOf('\r\n') !== -1) eol = '\r\n'

    this.css += eol + '/*# sourceMappingURL=' + content + ' */'
  }

  outputFile () {
    if (this.opts.to) {
      return this.relative(this.opts.to)
    }
    if (this.opts.from) {
      return this.relative(this.opts.from)
    }
    return 'to.css'
  }

  generateMap () {
    this.generateString()
    if (this.isSourcesContent()) this.setSourcesContent()
    if (this.previous().length > 0) this.applyPrevMaps()
    if (this.isAnnotation()) this.addAnnotation()

    if (this.isInline()) {
      return [this.css]
    }
    return [this.css, this.map]
  }

  relative (file) {
    if (file.indexOf('<') === 0) return file
    if (/^\w+:\/\//.test(file)) return file

    let from = this.opts.to ? path.dirname(this.opts.to) : '.'

    if (typeof this.mapOpts.annotation === 'string') {
      from = path.dirname(path.resolve(from, this.mapOpts.annotation))
    }

    file = path.relative(from, file)
    if (path.sep === '\\') {
      return file.replace(/\\/g, '/')
    }
    return file
  }

  sourcePath (node) {
    if (this.mapOpts.from) {
      return this.mapOpts.from
    }
    return this.relative(node.source.input.from)
  }

  generateString () {
    this.css = ''
    this.map = new mozilla.SourceMapGenerator({ file: this.outputFile() })

    let line = 1
    let column = 1

    let lines, last
    this.stringify(this.root, (str, node, type) => {
      this.css += str

      if (node && type !== 'end') {
        if (node.source && node.source.start) {
          this.map.addMapping({
            source: this.sourcePath(node),
            generated: { line, column: column - 1 },
            original: {
              line: node.source.start.line,
              column: node.source.start.column - 1
            }
          })
        } else {
          this.map.addMapping({
            source: '<no source>',
            original: { line: 1, column: 0 },
            generated: { line, column: column - 1 }
          })
        }
      }

      lines = str.match(/\n/g)
      if (lines) {
        line += lines.length
        last = str.lastIndexOf('\n')
        column = str.length - last
      } else {
        column += str.length
      }

      if (node && type !== 'start') {
        let p = node.parent || { raws: { } }
        if (node.type !== 'decl' || node !== p.last || p.raws.semicolon) {
          if (node.source && node.source.end) {
            this.map.addMapping({
              source: this.sourcePath(node),
              generated: { line, column: column - 2 },
              original: {
                line: node.source.end.line,
                column: node.source.end.column - 1
              }
            })
          } else {
            this.map.addMapping({
              source: '<no source>',
              original: { line: 1, column: 0 },
              generated: { line, column: column - 1 }
            })
          }
        }
      }
    })
  }

  generate () {
    this.clearAnnotation()

    if (this.isMap()) {
      return this.generateMap()
    }

    let result = ''
    this.stringify(this.root, i => {
      result += i
    })
    return [result]
  }
}

export default MapGenerator
