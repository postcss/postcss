import { resetNodeWalk } from './symbols'

export default function defineProperty (
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
        target[resetNodeWalk]()
      }
    }
  })

  target[publicPropName] = cache
}
