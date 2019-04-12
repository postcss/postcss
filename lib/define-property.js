let resetNodeWalk = require('./reset-node-walk')

module.exports = function defineProperty (
  target,
  publicPropName,
  privatePropName) {
  let cache = target[publicPropName]
  Object.defineProperty(target, publicPropName, {
    enumerable: true,
    get () {
      return target[privatePropName]
    },
    set (value) {
      let curValue = target[privatePropName]
      target[privatePropName] = value
      if (curValue !== value) {
        resetNodeWalk(target)
      }
    }
  })

  target[publicPropName] = cache
}
