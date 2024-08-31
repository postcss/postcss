// eslint-disable-next-line
globalThis = Function('return this')()

let Module = require('module')
let originalRequire = Module.prototype.require

Module.prototype.require = function (request) {
  if (request.startsWith('node:')) {
    request = request.slice(5)
  }
  return originalRequire.call(this, request)
}
