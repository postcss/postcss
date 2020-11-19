import postcss, { Result, PluginCreator, SourceMap } from '../lib/postcss.js'

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

interface StyleCompileResults {
  code: string
  map: SourceMap | undefined
}

const processResult: Promise<Result> | Result = postcss([
  plugin
]).process('h1{color: black;}', { from: undefined })
const processed:
  | StyleCompileResults
  | Promise<StyleCompileResults> = processResult.then(result => ({
  code: result.css,
  map: result.map
}))

export default plugin
