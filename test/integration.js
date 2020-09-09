#!/usr/bin/env node

let { testOnReal } = require('postcss-parser-tests')

let Processor = require('../lib/processor')
let postcss = require('../')
let pkg = require('../package')

let instance = new Processor()
if (pkg.version !== instance.version) {
  throw new Error('Version in Processor is not equal to package.json')
}

testOnReal(css => postcss.parse(css).toResult({ map: { annotation: false } }))
