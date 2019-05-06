let fs = require('fs')
let path = require('path')
let { promisify } = require('util')
let documentation = require('documentation')

let mkdir = promisify(fs.mkdir)
let writeFile = promisify(fs.writeFile)

let API_FOLDER = path.join(process.cwd(), 'api')

documentation
  .build('./lib/*.js', {
    shallow: true,
    github: true
  })
  .then(generateDocs)
  .then(renderTemplate)
  .then(saveDocs)
  .catch(error => {
    process.stderr.write(error.stack + '\n')
    process.exit(1)
  })

/**
 * @param {Object} data Entrance data
 * @return {Array}
 */
function generateDocs (data) {
  let docs = Object.values(data)

  docs
    .filter(item => item.augments.length > 0)
    .forEach(doc => {
      doc.augments.forEach(augment => {
        let essence = docs
          .find(essenceItem => essenceItem.name === augment.name)

        if (essence) {
          let instanceEssence = essence.members.instance
            .filter(item => item.memberof === essence.name)

          doc.members.instance = []
            .concat(doc.members.instance, instanceEssence)
            .map(item => ({
              ...item,
              namespace: item.namespace.replace(essence.name, doc.name)
            }))
            .filter((item, index, list) => {
              return item.memberof === essence.name ||
                (
                  item.memberof === doc.name &&
                  !list.find(e => e.name === item.name &&
                    e.memberof === essence.name
                  )
                )
            })
            .sort((a, b) => a.name > b.name ? 1 : -1)
        }
      })
    })

  docs
    .sort((a, b) => a.name > b.name ? 1 : -1)
    .forEach(doc => {
      doc.members.instance = doc.members.instance
        .filter(item => item.name)
    })

  let classes = docs.filter(item => item.kind === 'class')
  let namespace = docs.filter(item => item.kind === 'namespace')
  let typedef = docs.filter(item => item.kind === 'typedef')

  return [].concat(
    getSectionsSeparator('Classes'),
    classes,

    getSectionsSeparator('Namespaces'),
    namespace,

    getSectionsSeparator('Global'),
    typedef
  )
}

function renderTemplate (output) {
  return documentation.formats.html(output, {
    theme: './node_modules/documentation-theme-light'
  })
}

/**
 * @param {file[]} output
 */
async function saveDocs (output) {
  await mkdir(API_FOLDER, { recursive: true })

  output.forEach(async file => {
    let fileName = file.history[0].replace(file.base, '')
    let fileExt = path.extname(fileName)
    let filePath = path.join(API_FOLDER, fileName)

    if (fileExt) {
      let content = file.contents

      if (fileName === 'index.html') {
        content = content
          .toString()
          .replace(
            /regular blockmt1 quiet rounded/g,
            'blockmt1 quiet rounded bold block h4 mt2'
          )
      }

      await writeFile(filePath, content)
    } else {
      await mkdir(filePath, { recursive: true })
    }
  })
}

/**
 * @param {String} name Name section
 * @return {Object}
 */
function getSectionsSeparator (name = '') {
  return {
    name: name.toUpperCase(),
    namespace: name,
    kind: 'note',
    children: [{}],
    description: {
      type: 'root',
      children: [],
      position: {}
    },
    tags: [],
    augments: [],
    errors: [],
    examples: [],
    implements: [],
    params: [],
    properties: [],
    returns: [],
    sees: [],
    throws: [],
    todos: [],
    yields: [],
    members: {
      global: [],
      inner: [],
      instance: [],
      events: [],
      static: []
    },
    path: []
  }
}

/**
 * @typedef {Object} file
 * @property {Object} stat
 * @property {Buffer} contents
 * @property {String[]} history
 * @property {String} cwd
 * @property {String} base
 * @property {Boolean} isVinyl
 */
