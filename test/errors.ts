import { plugin } from '../lib/postcss.js'

export default plugin<{ a: number }>('remover', opts => {
  // THROWS Object is possibly 'undefined'
  console.log(opts.a)
  // THROWS Property 'b' does not exist on type '{ a: number; }'
  console.log(opts?.b)
  return root => {
    root.on('comment', decl => {
      // THROWS Property 'prop' does not exist on type 'Comment'
      console.log(decl.prop)
      // THROWS Property 'removeChild' does not exist on type 'Comment'
      decl.removeChild(1)
    })
  }
})
