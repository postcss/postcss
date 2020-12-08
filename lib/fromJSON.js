'use strict'

let Declaration = require('./declaration')
let PreviousMap = require('./previous-map')
let Comment = require('./comment')
let AtRule = require('./at-rule')
let Input = require('./input')
let Root = require('./root')
let Rule = require('./rule')

function fromJSON (json, inputs) {
  let { _inputs, ...defaults } = json
  inputs = _inputs || inputs
  if (defaults.nodes) {
    defaults.nodes = json.nodes.map(n => fromJSON(n, inputs))
  }
  if (defaults.source) {
    defaults.source = { ...defaults.source }
    if (defaults.source.input != null) {
      defaults.source.input = {
        ...inputs[defaults.source.input],
        __proto__: Input.prototype
      }
      if (defaults.source.input.map) {
        defaults.source.input.map = {
          ...defaults.source.input.map,
          __proto__: PreviousMap.prototype
        }
      }
    }
  }
  if (defaults.type === 'root') {
    return new Root(defaults)
  } else if (defaults.type === 'decl') {
    return new Declaration(defaults)
  } else if (defaults.type === 'rule') {
    return new Rule(defaults)
  } else if (defaults.type === 'comment') {
    return new Comment(defaults)
  } else if (defaults.type === 'atrule') {
    return new AtRule(defaults)
  } else {
    throw new Error('Unknown node type: ' + json.type)
  }
}

module.exports = fromJSON
fromJSON.default = fromJSON
