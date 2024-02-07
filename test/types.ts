import postcss, { Document, PluginCreator } from '../lib/postcss.js'

const plugin: PluginCreator<string> = prop => {
  return {
    Declaration: (decl, { Comment, result }) => {
      if (decl.prop === prop) {
        decl.warn(result, `${decl.prop} found in ${decl.parent?.nodes.length}`)
        decl.replaceWith(new Comment({ text: `${decl.prop} removed` }))
      }
    },
    postcssPlugin: 'remover'
  }
}

plugin.postcss = true

postcss([plugin])
  .process('h1{color: black;}', {
    from: undefined
  })
  .then(result => {
    console.log(result.root.parent)
    console.log(result.css)
  })

function parseMarkdown(): Document {
  return new Document()
}

let doc = postcss().process('a{}', { parser: parseMarkdown }).root
console.log(doc.toString())

export default plugin
