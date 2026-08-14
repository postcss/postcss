#!/usr/bin/env node

let Processor = require('../lib/processor')
let pkg = require('../package')

let instance = new Processor()
let expected = pkg.version.split('.').slice(0, 2).join('.')
if (expected !== instance.version) {
  throw new Error(
    'Version in Processor is not equal to major.minor of package.json'
  )
}
