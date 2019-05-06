let fs = require('fs')
let { join } = require('path')
let { Readable } = require('stream')
let documentation = require('documentation')
let vfs = require('vinyl-fs')

let API_FOLDER = join(process.cwd(), 'api')

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

/**
 * Save documentation
 * @param {Array} output
 * @return {*}
 */
function saveDocs (output) {
  return new StreamArray(output)
    .pipe(vfs.dest(API_FOLDER))
    .on('end', addMarginForNote)
}

/**
 * Render error
 * @param {Error} error
 */
function renderError (error) {
  process.stderr.write(error.stack + '\n')
  process.exit(1)
}

/**
 * Generate documentation with extended classes
 * @param {Object} data Entrance data
 * @return {Array}
 */
function generateDocs (data) {
  let docs = objectValues(data)

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
            .map(item => Object.assign(item, {
              namespace: item.namespace.replace(essence.name, doc.name)
            }))
            .filter((item, index, list) =>
              item.memberof === essence.name ||
              (
                item.memberof === doc.name &&
                !list.find(e => e.name === item.name &&
                  e.memberof === essence.name
                )
              )
            )
            .sort((a, b) => a.name > b.name ? 1 : -1)
        }
      })
    })

  docs
    .sort((a, b) => {
      if (a.kind === b.kind) {
        return a.name > b.name ? 1 : -1
      }

      return a.kind > b.kind ? 1 : -1
    })
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

/**
 * Adding indentation to sections
 */
function addMarginForNote () {
  let indexFile = join(API_FOLDER, 'index.html')

  fs.readFile(indexFile, { encoding: 'utf-8' }, (error, data) => {
    if (error) {
      renderError(error)
    }

    let html = data
      .replace(
        /regular blockmt1 quiet rounded/g,
        'blockmt1 quiet rounded bold block h4 mt2'
      )

    fs.writeFile(indexFile, html, errorWrite => {
      if (errorWrite) {
        renderError(errorWrite)
      }
    })
  })
}

/**
 * Get section for documentation
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
 * Returns an array of values of the enumerable properties of an object
 * @param {Object} obj Object that contains the properties and methods
 * @return {Array}
 */
function objectValues (obj) {
  if (typeof Object.values === 'function') {
    return Object.values(obj)
  }

  return Reflect.ownKeys(obj)
    .reduce((all, key) => all.concat(concatValue(obj, key)), [])
}

/**
 * Returns value of item
 * @param {Object} obj Object that contains the properties and methods
 * @param {String} key Key of object
 * @return {*}
 */
function concatValue (obj, key) {
  let isEnum = obj.propertyIsEnumerable(key)
  return typeof key === 'string' && isEnum ? [obj[key]] : []
}

class StreamArray extends Readable {
  /**
   * Create a new instance of StreamArray
   *
   * @access private
   * @param {Array} list
   */
  constructor (list) {
    if (!Array.isArray(list)) {
      throw new TypeError('First argument must be an Array')
    }

    super({ objectMode: true })

    this._i = 0
    this._l = list.length
    this._list = list
  }

  /**
   * Read the next item from the source Array and push into NodeJS stream

   * @access protected
   * @desc Read the next item from the source Array and push into NodeJS stream
   */
  _read () {
    this.push(this._i < this._l ? this._list[this._i++] : null)
  }
}
