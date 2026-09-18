'use strict'

let Stringifier = require('./stringifier')

const STYLE_TAG = /(<)(\/?style\b)/gi
const COMMENT_OPEN = /(<)(!--)/g

function escapeHTMLInCSS(str) {
  if (!str.includes('<')) return str
  return str.replace(STYLE_TAG, '\\3c $2').replace(COMMENT_OPEN, '\\3c $2')
}

class SafeStringifier extends Stringifier {
  escapeHTML(node, print) {
    let builder = this.builder
    let chunks, css
    this.builder = (str, child, type) => {
      if (chunks) {
        css += str
        chunks.push(str, child, type)
      } else if (str.includes('<')) {
        // Dangerous sequences start with `<`, so everything before
        // the first `<` is safe to pass through. The rest is buffered
        // to escape it as a whole.
        css = str
        chunks = [str, child, type]
      } else {
        builder(str, child, type)
      }
    }
    print()
    this.builder = builder
    if (!chunks) return

    let escaped = escapeHTMLInCSS(css)
    if (escaped === css) {
      // Keep the chunks to get a precise source map
      for (let i = 0; i < chunks.length; i += 3) {
        builder(chunks[i], chunks[i + 1], chunks[i + 2])
      }
    } else {
      // Escaping happens only on a hack attempt, source map is not important
      builder(escaped, node)
    }
  }

  root(node) {
    if (node.parent && node.parent.type === 'document') {
      // Document raws around the Root hold markup and are kept as is since CSS in Document can be marked with <style>
      this.escapeHTML(node, () => this.body(node))
      if (node.raws.after) this.builder(node.raws.after)
    } else {
      this.escapeHTML(node, () => super.root(node))
    }
  }
}

function stringify(node, builder) {
  let str = new SafeStringifier(builder)
  str.stringify(node)
}

module.exports = stringify
stringify.default = stringify
