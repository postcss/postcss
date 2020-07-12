import { plugin } from '../lib/postcss.js'

export default plugin<string>('remover', prop => {
  return root => {
    root.on('decl', decl => {
      if (decl.prop === prop) {
        decl.remove()
      }
    })
  }
})
