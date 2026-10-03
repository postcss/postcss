#!/usr/bin/env node

let Processor = require('../lib/processor')
let pkg = require('../package')

let majorMinor = pkg.version.split('.').slice(0, 2).join('.')

let instance = new Processor()
if (majorMinor !== instance.version) {
  throw new Error(
    'Version in Processor is not equal to major.minor from package.json'
  )
}
