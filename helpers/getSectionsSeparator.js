/**
 * Get section for documentation
 * @param {String} name Name section
 * @return {Object} Structure of section
 */
function getSectionsSeparator (name = '') {
  return {
    name: name.toUpperCase(),
    namespace: name,
    kind: 'note',
    children: [{}],
    description: {
      type: 'root',
      children: [],
      position: {}
    },
    tags: [],
    augments: [],
    errors: [],
    examples: [],
    implements: [],
    params: [],
    properties: [],
    returns: [],
    sees: [],
    throws: [],
    todos: [],
    yields: [],
    members: {
      global: [],
      inner: [],
      instance: [],
      events: [],
      static: []
    },
    path: []
  }
}

module.exports = getSectionsSeparator
