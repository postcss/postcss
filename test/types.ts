import postcss, { PluginCreator, Result } from '../lib/postcss.js'

const plugin: PluginCreator<string> = prop => {
  return {
    Declaration: (decl, { Comment, result }) => {
      if (decl.prop === prop) {
        decl.warn(result, `${decl.prop} found`)
        decl.replaceWith(new Comment({ text: `${decl.prop} removed` }))
      }
    },
    postcssPlugin: 'remover'
  }
}

plugin.postcss = true

const processResult: Promise<Result> | Result = postcss([
  plugin
]).process('h1{color: black;}', { from: undefined })

processResult.then((result: Result) => {
  console.log(result.css)
})

export default plugin
