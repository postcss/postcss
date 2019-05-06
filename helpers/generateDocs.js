let objectValues = require('./objectValues')
let getSectionsSeparator = require('./getSectionsSeparator')

/**
 * Generate documentation with extended classes
 * @param {Object} data Entrance data
 * @return {Array} Essences of documentation
 */
function generateDocs (data) {
  let docs = objectValues(data)

  docs
    .filter(item => item.augments.length > 0)
    .forEach(doc => {
      doc.augments.forEach(augment => {
        let essence = docs
          .find(essenceItem => essenceItem.name === augment.name)

        if (essence) {
          let instanceEssence = essence.members.instance
            .filter(item => item.memberof === essence.name)

          doc.members.instance = []
            .concat(doc.members.instance, instanceEssence)
            .map(item => ({
              ...item,
              namespace: item.namespace.replace(essence.name, doc.name)
            }))
            .filter((item, index, list) =>
              item.memberof === essence.name ||
              (
                item.memberof === doc.name &&
                !list.find(e => e.name === item.name &&
                  e.memberof === essence.name
                )
              )
            )
            .sort((a, b) => a.name > b.name ? 1 : -1)
        }
      })
    })

  docs
    .sort((a, b) => {
      if (a.kind === b.kind) {
        return a.name > b.name ? 1 : -1
      }

      return a.kind > b.kind ? 1 : -1
    })
    .forEach(doc => {
      doc.members.instance = doc.members.instance
        .filter(item => item.name)
    })

  let classes = docs.filter(item => item.kind === 'class')
  let namespace = docs.filter(item => item.kind === 'namespace')
  let typedef = docs.filter(item => item.kind === 'typedef')

  return [].concat(
    getSectionsSeparator('Classes'),
    classes,

    getSectionsSeparator('Namespaces'),
    namespace,

    getSectionsSeparator('Global'),
    typedef
  )
}

module.exports = generateDocs
