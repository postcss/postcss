#!/usr/bin/env node

let real = require('postcss-parser-tests/real')

let Processor = require('../lib/processor')
let postcss = require('../')
let pkg = require('../package')

let instance = new Processor()
if (pkg.version !== instance.version) {
  throw new Error('Version in Processor is not equal to package.json')
}

real(error => {
  if (error) throw error
}, css => {
  return postcss.parse(css).toResult({ map: { annotation: false } })
})
