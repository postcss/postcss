let documentation = require('documentation')
let streamArray = require('stream-array')
let vfs = require('vinyl-fs')

let generateDocs = require('./helpers/generateDocs')
let addMarginForNote = require('./helpers/addMarginForNote')
let { API_FOLDER } = require('./helpers/constants')

let config = {
  extension: 'js',
  shallow: true,
  github: true
}

documentation
  .build('./lib/*.js', config)
  .then(generateDocs)
  .then(renderTemplate)
  .then(saveDocs)
  .catch(renderError)

function renderTemplate (output) {
  return documentation.formats.html(output, {
    theme: './node_modules/documentation-theme-light'
  })
}

function saveDocs (output) {
  return streamArray(output)
    .pipe(vfs.dest(API_FOLDER))
    .on('end', addMarginForNote)
}

function renderError (error) {
  process.stderr.write(error.stack + '\n')
  process.exit(1)
}
