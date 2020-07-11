import postcss from '../lib/postcss.js'

export default postcss.plugin<string>('remover', prop => {
  return root => {
    root.on('decl', decl => {
      if (decl.prop === prop) {
        decl.remove()
      }
    })
  }
})
