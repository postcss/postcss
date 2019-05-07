#!/usr/bin/env node

let { join, extname } = require('path')
let documentation = require('documentation')
let { promisify } = require('util')
let ciJobNumber = require('ci-job-number')
let fs = require('fs')

let writeFile = promisify(fs.writeFile)
let mkdir = promisify(fs.mkdir)

if (ciJobNumber() !== 1) return

const API_FOLDER = __dirname

function generateDocs (data) {
  let docs = Object.values(data)

  extendClasses(docs)
  sortClasses(docs)
  removeEmptyMethods(docs)

  return [].concat(
    getSectionsSeparator('Classes'),
    docs.filter(item => item.kind === 'class'),
    getSectionsSeparator('Namespaces'),
    docs.filter(item => item.kind === 'namespace'),
    getSectionsSeparator('Global'),
    docs
      .filter(item => item.kind === 'typedef')
      .map(i => ({ ...i, hideAtNavigation: true }))
  )
}

function extendClasses (docs) {
  docs
    .filter(filterExtendedClasses)
    .forEach(targetClass => {
      targetClass.augments.forEach(augment => {
        let parentClass = docs.find(i => i.name === augment.name)
        if (!parentClass) return

        targetClass.members.instance = targetClass.members.instance
          .concat(getParentMethods(parentClass))
          .map(changeNamespaceForMethod(targetClass, parentClass))
          .filter(cleanFromDuplicated(targetClass, parentClass))
          .sort((a, b) => a.name > b.name ? 1 : -1)
      })
    })
}

function filterExtendedClasses (extendedClass) {
  return extendedClass.augments.length > 0
}

function getParentMethods (parentCls) {
  return parentCls.members.instance.filter(i => i.memberof === parentCls.name)
}

function changeNamespaceForMethod (targetCls, parentCls) {
  return i => ({
    ...i, namespace: i.namespace.replace(parentCls.name, targetCls.name)
  })
}

function cleanFromDuplicated (targetClass, parentClass) {
  return (i, index, list) => {
    if (i.memberof === parentClass.name) {
      return true
    } else {
      let same = list.find(e => {
        return e.name === i.name && e.memberof === parentClass.name
      })
      return i.memberof === targetClass.name && !same
    }
  }
}

function sortClasses (docs) {
  docs.sort((a, b) => a.name > b.name ? 1 : -1)
}

function removeEmptyMethods (docs) {
  docs.forEach(doc => {
    doc.members.instance = doc.members.instance.filter(i => i.name)
  })
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
        content = content
          .replace(
            /regular blockmt1 quiet rounded/g,
            'blockmt1 quiet rounded bold block h4 mt2'
          )
          .replace(
            /<div class='keyline-top-not py2'>/g,
            `<div class='hide'>`
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
