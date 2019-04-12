let Stringifier = require('./stringifier')

module.exports = function stringify (node, builder) {
  let str = new Stringifier(builder)
  str.stringify(node)
}
