#!/usr/bin/env node

let ciJobNumber = require('ci-job-number')
let chalk = require('chalk')
let real = require('postcss-parser-tests/real')

let Processor = require('../lib/processor')
let postcss = require('../')
let pkg = require('../package')

if (ciJobNumber() === 1) {
  let instance = new Processor()
  if (pkg.version !== instance.version) {
    throw new Error('Version in Processor is not equal to package.json')
  }

  real(error => {
    if (error) {
      process.stderr.write(chalk.red(error.toString()) + '\n')
      process.exit(1)
    }
  }, css => {
    return postcss.parse(css).toResult({ map: { annotation: false } })
  })
}
