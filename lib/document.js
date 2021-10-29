'use strict'

let Container = require('./container')

let LazyResult, NoWork, Processor

class Document extends Container {
  constructor(defaults) {
    // type needs to be passed to super, otherwise child roots won't be normalized correctly
    super({ type: 'document', ...defaults })

    if (!this.nodes) {
      this.nodes = []
    }
  }

  toResult(opts = {}) {
    let result

    if (
      typeof opts.plugins === 'undefined' &&
      typeof opts.parser === 'undefined' &&
      typeof opts.stringifier === 'undefined' &&
      typeof opts.syntax === 'undefined' &&
      // @TODO what to do with this warning option? do we need it here and in processor.js?
      // Seems like we will not have a warning after NoWork is properly implemented.
      !opts.hideNothingWarning
    ) {
      result = new NoWork(new Processor(), this, opts)
    } else {
      result = new LazyResult(new Processor(), this, opts)
    }

    return result.stringify()
  }
}

Document.registerLazyResult = dependant => {
  LazyResult = dependant
}

Document.registerNoWork = dependant => {
  NoWork = dependant
}

Document.registerProcessor = dependant => {
  Processor = dependant
}

module.exports = Document
Document.default = Document
