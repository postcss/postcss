'use strict'

let Stringifier = require('./stringifier')

const STYLE_TAG = /(<)(\/?style\b)/gi
const COMMENT_OPEN = /(<)(!--)/g

function escapeHTMLInCSS(str) {
  if (!str.includes('<')) return str
  return str.replace(STYLE_TAG, '\\3c $2').replace(COMMENT_OPEN, '\\3c $2')
}

function cutEscaped(chunks, css, escaped) {
  let parts = []
  let at = 0
  let into = 0
  for (let i = 0; i < chunks.length; i += 3) {
    let from = into
    let end = at + chunks[i].length
    while (at < end) {
      if (css[at] === escaped[into]) {
        at += 1
        into += 1
      } else {
        // The `<` of this pair was replaced by the `\3c ` in front of it
        at += 1
        into += 4
      }
    }
    parts.push(escaped.slice(from, into))
  }
  return parts
}

class SafeStringifier extends Stringifier {
  escapeHTML(print) {
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
      let parts = cutEscaped(chunks, css, escaped)
      for (let i = 0; i < chunks.length; i += 3) {
        builder(parts[i / 3], chunks[i + 1], chunks[i + 2])
      }
    }
  }

  root(node) {
    if (node.parent && node.parent.type === 'document') {
      // Document raws around the Root hold markup and are kept as is since CSS in Document can be marked with <style>
      this.escapeHTML(() => this.body(node))
      if (node.raws.after) this.builder(node.raws.after)
    } else {
      this.escapeHTML(() => super.root(node))
    }
  }
}

function stringify(node, builder) {
  let str = new SafeStringifier(builder)
  // Root escapes its own output and keeps markup in Document raws
  if (node.type === 'root' || node.type === 'document') {
    str.stringify(node)
  } else {
    str.escapeHTML(() => str.stringify(node))
  }
}

module.exports = stringify
stringify.default = stringify
