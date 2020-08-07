import { PluginCreator } from '../lib/postcss.js'

const plugin: PluginCreator<string> = prop => {
  return {
    postcssPlugin: 'remover',
    Declaration: (decl, { result, Comment }) => {
      if (decl.prop === prop) {
        decl.warn(result, `${decl.prop} found`)
        decl.replaceWith(new Comment({ text: `${decl.prop} removed` }))
      }
    }
  }
}

plugin.postcss = true

export default plugin
