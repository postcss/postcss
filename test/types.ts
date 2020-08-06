import { PluginCreator } from '../lib/postcss.js'

const plugin: PluginCreator<string> = prop => {
  return {
    postcssPlugin: 'remover',
    decl: decl => {
      if (decl.prop === prop) {
        decl.remove()
      }
    }
  }
}

plugin.postcss = true

export default plugin
