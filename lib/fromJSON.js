'use strict'

let AtRule = require('./at-rule')
let Comment = require('./comment')
let Declaration = require('./declaration')
let Input = require('./input')
let PreviousMap = require('./previous-map')
let Root = require('./root')
let Rule = require('./rule')

function fromJSON(json, inputs) {
  if (Array.isArray(json)) return json.map(n => fromJSON(n))

  let { inputs: ownInputs, ...defaults } = json
  if (ownInputs) {
    inputs = []
    for (let input of ownInputs) {
      let inputHydrated = { ...input, __proto__: Input.prototype }
      if (inputHydrated.map) {
        inputHydrated.map = {
          ...inputHydrated.map,
          __proto__: PreviousMap.prototype
        }
      }
      inputs.push(inputHydrated)
    }
  }
  // Rehydrate children separately and attach them after construction.
  // Passing them through the container constructor would re-run insertion
  // spacing normalization and overwrite each child's own `raws.before`.
  let nodes
  if (defaults.nodes) {
    nodes = json.nodes.map(n => fromJSON(n, inputs))
    delete defaults.nodes
  }
  if (defaults.source) {
    let { inputId, ...source } = defaults.source
    defaults.source = source
    if (inputId != null) {
      defaults.source.input = inputs[inputId]
    }
  }

  let node
  if (defaults.type === 'root') {
    node = new Root(defaults)
  } else if (defaults.type === 'decl') {
    node = new Declaration(defaults)
  } else if (defaults.type === 'rule') {
    node = new Rule(defaults)
  } else if (defaults.type === 'comment') {
    node = new Comment(defaults)
  } else if (defaults.type === 'atrule') {
    node = new AtRule(defaults)
  } else {
    throw new Error('Unknown node type: ' + json.type)
  }

  if (nodes) {
    node.nodes = nodes
    for (let child of nodes) child.parent = node
  }

  return node
}

module.exports = fromJSON
fromJSON.default = fromJSON
