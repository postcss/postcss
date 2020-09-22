#!/usr/bin/env node

let { testOnReal } = require('postcss-parser-tests')

let { parse } = require('../')

testOnReal(css => parse(css).toResult({ map: { annotation: false } }))
