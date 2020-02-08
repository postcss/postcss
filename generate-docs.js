let { join, extname } = require('path')
let documentation = require('documentation')
let { promisify } = require('util')
let fs = require('fs')

let mkdir = promisify(fs.mkdir)
let writeFile = promisify(fs.writeFile)

const API_FOLDER = join(__dirname, 'api')

function generateDocs (data) {
  let docs = Object.values(data)
  docs
    .filter(doc => doc.augments.length > 0)
    .forEach(doc => {
      doc.augments.forEach(augment => {
        let essence = docs.find(i => i.name === augment.name)
        if (essence) {
          let instance = essence.members.instance
            .filter(i => i.memberof === essence.name)

          doc.members.instance = doc.members.instance
            .concat(instance)
            .map(i => ({
              ...i,
              namespace: i.namespace.replace(essence.name, doc.name)
            }))
            .filter((i, index, list) => {
              if (i.memberof === essence.name) {
                return true
              } else {
                let same = list.find(e => {
                  return e.name === i.name && e.memberof === essence.name
                })
                return i.memberof === doc.name && !same
              }
            })
            .sort((a, b) => a.name > b.name ? 1 : -1)
        }
      })
    })

  docs
    .sort((a, b) => a.name > b.name ? 1 : -1)
    .forEach(doc => {
      doc.members.instance = doc.members.instance.filter(i => i.name)
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

async function saveDocs (output) {
  await mkdir(API_FOLDER, { recursive: true })
  output.forEach(async file => {
    let name = file.history[0].replace(file.base, '')
    if (extname(name)) {
      let content = file.contents.toString()
      if (name === 'index.html') {
        content = content.replace(
          /regular blockmt1 quiet rounded/g,
          'blockmt1 quiet rounded bold block h4 mt2'
        )
      }
      await writeFile(join(API_FOLDER, name), content)
    } else {
      await mkdir(join(API_FOLDER, name), { recursive: true })
    }
  })
}

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

documentation
  .build('./lib/*.js', { shallow: true, github: true })
  .then(generateDocs)
  .then(renderTemplate)
  .then(saveDocs)
  .catch(error => {
    process.stderr.write(error.stack + '\n')
    process.exit(1)
  })
