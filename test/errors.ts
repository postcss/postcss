import { PluginCreator } from '../lib/postcss.js'

const plugin: PluginCreator<{ a: number }> = opts => {
  // THROWS 'opts' is possibly 'undefined'
  console.log(opts.a)
  // THROWS Property 'b' does not exist on type '{ a: number; }'
  console.log(opts?.b)
  return {
    postcssPlugin: 'remover',
    // THROWS Property 'Decl' does not exist on type 'Helpers'.
    Comment(decl, { Decl }) {
      // THROWS Property 'prop' does not exist on type 'Comment_'
      console.log(decl.prop)
      // THROWS Property 'removeChild' does not exist on type 'Comment_'
      decl.removeChild(1)
    }
  }
}

plugin.postcss = true

export default plugin
