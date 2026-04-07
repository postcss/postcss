// eslint-disable-next-line
globalThis = Function('return this')()

let Module = require('module')
let path = require('path')
let originalRequire = Module.prototype.require

Module.prototype.require = function (request) {
  if (request.startsWith('node:')) {
    request = request.slice(5)
  }
  return originalRequire.call(this, request)
}

process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  moduleResolution: 'node'
})

require(
  path.join(
    process.cwd(),
    'node_modules',
    'ts-node',
    'register',
    'transpile-only'
  )
)
