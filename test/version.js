#!/usr/bin/env node

let Processor = require('../lib/processor')
let pkg = require('../package')

let instance = new Processor()
if (pkg.version !== instance.version) {
  throw new Error('Version in Processor is not equal to package.json')
}
