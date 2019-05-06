/**
 * Returns an array of values of the enumerable properties of an object
 * @param {Object} obj Object that contains the properties and methods
 * @return {Array} An array containing the given object's own values
 */
function objectValues (obj) {
  if (typeof Object.values === 'function') {
    return Object.values(obj)
  }

  return Reflect.ownKeys(obj)
    .reduce((all, key) => all.concat(concatValue(obj, key)), [])
}

/**
 * Returns value of item
 * @param {Object} obj Object that contains the properties and methods
 * @param {String} key Key of object
 * @return {*} Object value
 */
function concatValue (obj, key) {
  let isEnum = obj.propertyIsEnumerable(key)
  return typeof key === 'string' && isEnum ? [obj[key]] : []
}

module.exports = objectValues
