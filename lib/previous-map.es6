import mozilla from 'source-map'
import path from 'path'
import fs from 'fs'

function fromBase64 (str) {
  if (Buffer) {
    return Buffer.from(str, 'base64').toString()
  } else {
    return window.atob(str)
  }
}

/**
 * Source map information from input CSS.
 * For example, source map after Sass compiler.
 *
 * This class will automatically find source map in input CSS or in file system
 * near input file (according `from` option).
 *
 * @example
 * const root = postcss.parse(css, { from: 'a.sass.css' })
 * root.input.map //=> PreviousMap
 */
class PreviousMap {
  /**
   * @param {string}         css    Input CSS source.
   * @param {processOptions} [opts] {@link Processor#process} options.
   */
  constructor (css, opts) {
    this.loadAnnotation(css)
    /**
     * Was source map inlined by data-uri to input CSS.
     *
     * @type {boolean}
     */
    this.inline = this.startWith(this.annotation, 'data:')

    let prev = opts.map ? opts.map.prev : undefined
    let text = this.loadMap(opts.from, prev)
    if (text) this.text = text
  }

  /**
   * Create a instance of `SourceMapGenerator` class
   * from the `source-map` library to work with source map information.
   *
   * It is lazy method, so it will create object only on first call
   * and then it will use cache.
   *
   * @return {SourceMapGenerator} Object with source map information.
   */
  consumer () {
    if (!this.consumerCache) {
      this.consumerCache = new mozilla.SourceMapConsumer(this.text)
    }
    return this.consumerCache
  }

  /**
   * Does source map contains `sourcesContent` with input source text.
   *
   * @return {boolean} Is `sourcesContent` present.
   */
  withContent () {
    return !!(this.consumer().sourcesContent &&
              this.consumer().sourcesContent.length > 0)
  }

  startWith (string, start) {
    if (!string) return false
    return string.substr(0, start.length) === start
  }

  getAnnotationURL (sourceMapString) {
    return sourceMapString
      .match(/\/\*\s*# sourceMappingURL=((?:(?!sourceMappingURL=).)*)\*\//)[1]
      .trim()
  }

  loadAnnotation (css) {
    let annotations = css
      .match(/\/\*\s*# sourceMappingURL=(?:(?!sourceMappingURL=).)*\*\//gm)

    if (annotations && annotations.length > 0) {
      // Locate the last sourceMappingURL to avoid picking up
      // sourceMappingURLs from comments, strings, etc.
      let lastAnnotation = annotations[annotations.length - 1]
      if (lastAnnotation) {
        this.annotation = this.getAnnotationURL(lastAnnotation)
      }
    }
  }

  decodeInline (text) {
    let baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/
    let baseUri = /^data:application\/json;base64,/
    let uri = 'data:application/json,'

    if (this.startWith(text, uri)) {
      return decodeURIComponent(text.substr(uri.length))
    }

    if (baseCharsetUri.test(text) || baseUri.test(text)) {
      return fromBase64(text.substr(RegExp.lastMatch.length))
    }

    let encoding = text.match(/data:application\/json;([^,]+),/)[1]
    throw new Error('Unsupported source map encoding ' + encoding)
  }

  loadMap (file, prev) {
    if (prev === false) return false

    if (prev) {
      if (typeof prev === 'string') {
        return prev
      } else if (typeof prev === 'function') {
        let prevPath = prev(file)
        if (prevPath && fs.existsSync && fs.existsSync(prevPath)) {
          return fs.readFileSync(prevPath, 'utf-8').toString().trim()
        } else {
          throw new Error(
            'Unable to load previous source map: ' + prevPath.toString())
        }
      } else if (prev instanceof mozilla.SourceMapConsumer) {
        return mozilla.SourceMapGenerator.fromSourceMap(prev).toString()
      } else if (prev instanceof mozilla.SourceMapGenerator) {
        return prev.toString()
      } else if (this.isMap(prev)) {
        return JSON.stringify(prev)
      } else {
        throw new Error(
          'Unsupported previous source map format: ' + prev.toString())
      }
    } else if (this.inline) {
      return this.decodeInline(this.annotation)
    } else if (this.annotation) {
      let map = this.annotation
      if (file) map = path.join(path.dirname(file), map)

      this.root = path.dirname(map)
      if (fs.existsSync && fs.existsSync(map)) {
        return fs.readFileSync(map, 'utf-8').toString().trim()
      } else {
        return false
      }
    }
  }

  isMap (map) {
    if (typeof map !== 'object') return false
    return typeof map.mappings === 'string' || typeof map._mappings === 'string'
  }
}

export default PreviousMap
