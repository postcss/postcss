import Stringifier from './stringifier'

function stringify (node, builder) {
  const str = new Stringifier(builder)
  str.stringify(node)
}

export default stringify
