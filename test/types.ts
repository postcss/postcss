import { PluginCreator } from '../lib/postcss.js'

const plugin: PluginCreator<string> = prop => {
  return {
    postcssPlugin: 'remover',
    Declaration: (decl, { result, comment }) => {
      if (decl.prop === prop) {
        decl.warn(result, `${decl.prop} found`)
        decl.replaceWith(comment({ text: `${decl.prop} removed` }))
      }
    }
  }
}

plugin.postcss = true

export default plugin
