'use strict'

let Declaration = require('./declaration')
let PreviousMap = require('./previous-map')
let Comment = require('./comment')
let AtRule = require('./at-rule')
let Input = require('./input')
let Root = require('./root')
let Rule = require('./rule')

function fromJSON (json) {
  let defaults = { ...json }
  if (json.nodes) {
    defaults.nodes = json.nodes.map(i => fromJSON(i))
  }
  if (json.type === 'root') {
    if (defaults.source) {
      defaults.source = { ...defaults.source }
      if (defaults.source.input) {
        defaults.source.input = {
          ...defaults.source.input,
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
    return new Root(defaults)
  } else if (json.type === 'decl') {
    return new Declaration(defaults)
  } else if (json.type === 'rule') {
    return new Rule(defaults)
  } else if (json.type === 'comment') {
    return new Comment(defaults)
  } else if (json.type === 'atrule') {
    return new AtRule(defaults)
  } else {
    throw new Error('Unknown node type: ' + json.type)
  }
}

module.exports = fromJSON
fromJSON.default = fromJSON
