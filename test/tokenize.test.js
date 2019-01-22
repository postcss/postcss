let tokenizer = require('../lib/tokenize')
let Input = require('../lib/input')

function tokenize (css, opts) {
  let processor = tokenizer(new Input(css), opts)
  let tokens = []
  while (!processor.endOfFile()) {
    tokens.push(processor.nextToken())
  }
  return tokens
}

function run (css, tokens, opts) {
  expect(tokenize(css, opts)).toEqual(tokens)
}

it('tokenizes empty file', () => {
  run('', [])
})

it('tokenizes space', () => {
  run('\r\n \f\t', [['space', '\r\n \f\t']])
})

it('tokenizes word', () => {
  run('ab', [['word', 'ab', 1, 1, 1, 2]])
})

it('splits word by !', () => {
  run('aa!bb', [
    ['word', 'aa', 1, 1, 1, 2],
    ['word', '!bb', 1, 3, 1, 5]
  ])
})

it('changes lines in spaces', () => {
  run('a \n b', [
    ['word', 'a', 1, 1, 1, 1],
    ['space', ' \n '],
    ['word', 'b', 2, 2, 2, 2]
  ])
})

it('tokenizes control chars', () => {
  run('{:;}', [
    ['{', '{', 1, 1],
    [':', ':', 1, 2],
    [';', ';', 1, 3],
    ['}', '}', 1, 4]
  ])
})

it('escapes control symbols', () => {
  run('\\(\\{\\"\\@\\\\""', [
    ['word', '\\(', 1, 1, 1, 2],
    ['word', '\\{', 1, 3, 1, 4],
    ['word', '\\"', 1, 5, 1, 6],
    ['word', '\\@', 1, 7, 1, 8],
    ['word', '\\\\', 1, 9, 1, 10],
    ['string', '""', 1, 11, 1, 12]
  ])
})

it('escapes backslash', () => {
  run('\\\\\\\\{', [
    ['word', '\\\\\\\\', 1, 1, 1, 4],
    ['{', '{', 1, 5]
  ])
})

it('tokenizes simple brackets', () => {
  run('(ab)', [['brackets', '(ab)', 1, 1, 1, 4]])
})

it('tokenizes square brackets', () => {
  run('a[bc]', [
    ['word', 'a', 1, 1, 1, 1],
    ['[', '[', 1, 2],
    ['word', 'bc', 1, 3, 1, 4],
    [']', ']', 1, 5]
  ])
})

it('tokenizes complicated brackets', () => {
  run('(())("")(/**/)(\\\\)(\n)(', [
    ['(', '(', 1, 1],
    ['brackets', '()', 1, 2, 1, 3],
    [')', ')', 1, 4],
    ['(', '(', 1, 5],
    ['string', '""', 1, 6, 1, 7],
    [')', ')', 1, 8],
    ['(', '(', 1, 9],
    ['comment', '/**/', 1, 10, 1, 13],
    [')', ')', 1, 14],
    ['(', '(', 1, 15],
    ['word', '\\\\', 1, 16, 1, 17],
    [')', ')', 1, 18],
    ['(', '(', 1, 19],
    ['space', '\n'],
    [')', ')', 2, 1],
    ['(', '(', 2, 2]
  ])
})

it('tokenizes string', () => {
  run('\'"\'"\\""', [
    ['string', '\'"\'', 1, 1, 1, 3],
    ['string', '"\\""', 1, 4, 1, 7]
  ])
})

it('tokenizes escaped string', () => {
  run('"\\\\"', [['string', '"\\\\"', 1, 1, 1, 4]])
})

it('changes lines in strings', () => {
  run('"\n\n""\n\n"', [
    ['string', '"\n\n"', 1, 1, 3, 1],
    ['string', '"\n\n"', 3, 2, 5, 1]
  ])
})

it('tokenizes at-word', () => {
  run('@word ', [['at-word', '@word', 1, 1, 1, 5], ['space', ' ']])
})

it('tokenizes at-word end', () => {
  run('@one{@two()@three""@four;', [
    ['at-word', '@one', 1, 1, 1, 4],
    ['{', '{', 1, 5],
    ['at-word', '@two', 1, 6, 1, 9],
    ['brackets', '()', 1, 10, 1, 11],
    ['at-word', '@three', 1, 12, 1, 17],
    ['string', '""', 1, 18, 1, 19],
    ['at-word', '@four', 1, 20, 1, 24],
    [';', ';', 1, 25]
  ])
})

it('tokenizes urls', () => {
  run('url(/*\\))', [
    ['word', 'url', 1, 1, 1, 3],
    ['brackets', '(/*\\))', 1, 4, 1, 9]
  ])
})

it('tokenizes quoted urls', () => {
  run('url(")")', [
    ['word', 'url', 1, 1, 1, 3],
    ['(', '(', 1, 4],
    ['string', '")"', 1, 5, 1, 7],
    [')', ')', 1, 8]
  ])
})

it('tokenizes at-symbol', () => {
  run('@', [['at-word', '@', 1, 1, 1, 1]])
})

it('tokenizes comment', () => {
  run('/* a\nb */', [['comment', '/* a\nb */', 1, 1, 2, 4]])
})

it('changes lines in comments', () => {
  run('a/* \n */b', [
    ['word', 'a', 1, 1, 1, 1],
    ['comment', '/* \n */', 1, 2, 2, 3],
    ['word', 'b', 2, 4, 2, 4]
  ])
})

it('supports line feed', () => {
  run('a\fb', [
    ['word', 'a', 1, 1, 1, 1],
    ['space', '\f'],
    ['word', 'b', 2, 1, 2, 1]
  ])
})

it('supports carriage return', () => {
  run('a\rb\r\nc', [
    ['word', 'a', 1, 1, 1, 1],
    ['space', '\r'],
    ['word', 'b', 2, 1, 2, 1],
    ['space', '\r\n'],
    ['word', 'c', 3, 1, 3, 1]
  ])
})

it('tokenizes CSS', () => {
  let css = 'a {\n' +
              '  content: "a";\n' +
              '  width: calc(1px;)\n' +
              '  }\n' +
              '/* small screen */\n' +
              '@media screen {}'
  run(css, [
    ['word', 'a', 1, 1, 1, 1],
    ['space', ' '],
    ['{', '{', 1, 3],
    ['space', '\n  '],
    ['word', 'content', 2, 3, 2, 9],
    [':', ':', 2, 10],
    ['space', ' '],
    ['string', '"a"', 2, 12, 2, 14],
    [';', ';', 2, 15],
    ['space', '\n  '],
    ['word', 'width', 3, 3, 3, 7],
    [':', ':', 3, 8],
    ['space', ' '],
    ['word', 'calc', 3, 10, 3, 13],
    ['brackets', '(1px;)', 3, 14, 3, 19],
    ['space', '\n  '],
    ['}', '}', 4, 3],
    ['space', '\n'],
    ['comment', '/* small screen */', 5, 1, 5, 18],
    ['space', '\n'],
    ['at-word', '@media', 6, 1, 6, 6],
    ['space', ' '],
    ['word', 'screen', 6, 8, 6, 13],
    ['space', ' '],
    ['{', '{', 6, 15],
    ['}', '}', 6, 16]
  ])
})

it('throws error on unclosed string', () => {
  expect(() => {
    tokenize(' "')
  }).toThrowError(/:1:2: Unclosed string/)
})

it('throws error on unclosed comment', () => {
  expect(() => {
    tokenize(' /*')
  }).toThrowError(/:1:2: Unclosed comment/)
})

it('throws error on unclosed url', () => {
  expect(() => {
    tokenize('url(')
  }).toThrowError(/:1:4: Unclosed bracket/)
})

it('ignores unclosing string on request', () => {
  run(' "', [
    ['space', ' '], ['string', '"', 1, 2, 1, 3]
  ], { ignoreErrors: true })
})

it('ignores unclosing comment on request', () => {
  run(' /*', [
    ['space', ' '], ['comment', '/*', 1, 2, 1, 4]
  ], { ignoreErrors: true })
})

it('ignores unclosing function on request', () => {
  run('url(', [
    ['word', 'url', 1, 1, 1, 3],
    ['brackets', '(', 1, 4, 1, 4]
  ], { ignoreErrors: true })
})

it('tokenizes hexadecimal escape', () => {
  run('\\0a \\09 \\z ', [
    ['word', '\\0a ', 1, 1, 1, 4],
    ['word', '\\09 ', 1, 5, 1, 8],
    ['word', '\\z', 1, 9, 1, 10],
    ['space', ' ']
  ])
})

it('ignore unclosed per token request', () => {
  function tokn (css, opts) {
    let processor = tokenizer(new Input(css), opts)
    let tokens = []
    while (!processor.endOfFile()) {
      tokens.push(processor.nextToken({ ignoreUnclosed: true }))
    }
    return tokens
  }

  let css = `How's it going (`
  let tokens = tokn(css, {})
  let expected = [['word', 'How', 1, 1, 1, 3],
    ['string', "'s", 1, 4, 1, 5],
    ['space', ' '],
    ['word', 'it', 1, 7, 1, 8],
    ['space', ' '],
    ['word', 'going', 1, 10, 1, 14],
    ['space', ' '],
    ['(', '(', 1, 16]]

  expect(tokens).toEqual(expected)
})

it('provides correct position', () => {
  let css = `Three tokens`
  let processor = tokenizer(new Input(css))
  expect(processor.position()).toEqual(0)
  processor.nextToken()
  expect(processor.position()).toEqual(5)
  processor.nextToken()
  expect(processor.position()).toEqual(6)
  processor.nextToken()
  expect(processor.position()).toEqual(12)
  processor.nextToken()
  expect(processor.position()).toEqual(12)
})
