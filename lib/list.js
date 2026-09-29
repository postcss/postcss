'use strict'

let list = {
  comma(string) {
    return list.split(string, [','], true)
  },

  space(string) {
    let spaces = [' ', '\n', '\t']
    return list.split(string, spaces)
  },

  split(string, separators, last) {
    if (typeof string !== 'string') return []
    let array = []
    let current = ''
    let split = false

    let func = 0
    let inQuote = false
    let prevQuote = ''
    let escape = false
    let inComment = false

    for (let i = 0; i < string.length; i++) {
      let letter = string[i]

      if (inComment) {
        current += letter
        if (letter === '*' && string[i + 1] === '/') {
          current += '/'
          i += 1
          inComment = false
        }
        continue
      }

      if (escape) {
        escape = false
      } else if (letter === '\\') {
        escape = true
      } else if (inQuote) {
        if (letter === prevQuote) {
          inQuote = false
        }
      } else if (letter === '"' || letter === "'") {
        inQuote = true
        prevQuote = letter
      } else if (letter === '/' && string[i + 1] === '*') {
        current += '/*'
        i += 1
        inComment = true
        continue
      } else if (letter === '(') {
        func += 1
      } else if (letter === ')') {
        if (func > 0) func -= 1
      } else if (func === 0) {
        if (separators.includes(letter)) split = true
      }

      if (split) {
        let value = current.trim()
        if (last || value !== '') array.push(value)
        current = ''
        split = false
      } else {
        current += letter
      }
    }

    let value = current.trim()
    if (last || value !== '') array.push(value)
    return array
  }
}

module.exports = list
list.default = list
