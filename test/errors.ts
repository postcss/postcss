import { PluginCreator } from '../lib/postcss.js'

const plugin: PluginCreator<{ a: number }> = opts => {
  // @ts-expect-error 'opts' is possibly 'undefined'
  console.log(opts.a)
  // @ts-expect-error Property 'b' does not exist on type '{ a: number; }'
  console.log(opts?.b)
  return {
    postcssPlugin: 'remover',
    // @ts-expect-error Property 'Decl' does not exist on type 'Helpers'.
    Comment(decl, { Decl }) {
      // @ts-expect-error Property 'prop' does not exist on type 'Comment'
      console.log(decl.prop)
      // @ts-expect-error Property 'removeChild' does not exist on type 'Comment'
      decl.removeChild(1)
    }
  }
}

plugin.postcss = true

export default plugin
