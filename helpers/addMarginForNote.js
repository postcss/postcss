let fs = require('fs')
let { join } = require('path')

let { API_FOLDER } = require('./constants')

/**
 * Adding indentation to sections
 */
function addMarginForNote () {
  let indexFile = join(API_FOLDER, 'index.html')

  fs.readFile(indexFile, { encoding: 'utf-8' }, (error, data) => {
    if (error) {
      process.stderr.write(error.stack + '\n')
      process.exit(1)
    }

    let html = data
      .replace(
        /regular blockmt1 quiet rounded/g,
        'blockmt1 quiet rounded bold block h4 mt2'
      )

    fs.writeFile(indexFile, html, errorWrite => {
      if (errorWrite) {
        process.stderr.write(errorWrite.stack + '\n')
        process.exit(1)
      }
    })
  })
}

module.exports = addMarginForNote
