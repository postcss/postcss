let { test } = require('uvu')
let { equal, throws, is } = require('uvu/assert')

let tokenizer = require('../lib/tokenize')
let { Input } = require('../lib/postcss')

function tokenize(css, opts) {
  let processor = tokenizer(new Input(css), opts)
  let tokens = []
  while (!processor.endOfFile()) {
    tokens.push(processor.nextToken())
  }
  return tokens
}

function run(css, tokens, opts) {
  equal(tokenize(css, opts), tokens)
}

test('tokenizes empty file', () => {
  run('', [])
})

test('tokenizes space', () => {
  run('\r\n \f\t', [['whitespace-token', '\r\n \f\t', 0, 4, undefined]])
})

test('tokenizes word', () => {
  run('ab', [['ident-token', 'ab', 0, 1, { value: 'ab' }]])
})

test('splits word by !', () => {
  run('aa!bb', [
    ['ident-token', 'aa', 0, 1, { value: 'aa' }],
    ['delim-token', '!', 2, 2, { value: '!' }],
    ['ident-token', 'bb', 3, 4, { value: 'bb' }]
  ])
})

test('changes lines in spaces', () => {
  run('a \n b', [
    ['ident-token', 'a', 0, 0, { value: 'a' }],
    ['whitespace-token', ' \n ', 1, 3, undefined],
    ['ident-token', 'b', 4, 4, { value: 'b' }]
  ])
})

test('tokenizes control chars', () => {
  run('{:;}', [
    ['{-token', '{', 0, 0, undefined],
    ['colon-token', ':', 1, 1, undefined],
    ['semicolon-token', ';', 2, 2, undefined],
    ['}-token', '}', 3, 3, undefined]
  ])
})

test('escapes control symbols', () => {
  run('\\(\\{\\"\\@\\\\""', [
    ['ident-token', '\\(\\{\\"\\@\\\\', 0, 9, { value: '({"@\\' }],
    ['string-token', '""', 10, 11, { value: '' }]
  ])
})

test('escapes backslash', () => {
  run('\\\\\\\\{', [
    ['ident-token', '\\\\\\\\', 0, 3, { value: '\\\\' }],
    ['{-token', '{', 4, 4, undefined]
  ])
})

test('tokenizes simple brackets', () => {
  run('(ab)', [
    ['(-token', '(', 0, 0, undefined],
    ['ident-token', 'ab', 1, 2, { value: 'ab' }],
    [')-token', ')', 3, 3, undefined]
  ])
})

test('tokenizes square brackets', () => {
  run('a[bc]', [
    ['ident-token', 'a', 0, 0, { value: 'a' }],
    ['[-token', '[', 1, 1, undefined],
    ['ident-token', 'bc', 2, 3, { value: 'bc' }],
    [']-token', ']', 4, 4, undefined]
  ])
})

test('tokenizes complicated brackets', () => {
  run('(())("")(/**/)(\\\\)(\n)(', [
    ['(-token', '(', 0, 0, undefined],
    ['(-token', '(', 1, 1, undefined],
    [')-token', ')', 2, 2, undefined],
    [')-token', ')', 3, 3, undefined],
    ['(-token', '(', 4, 4, undefined],
    ['string-token', '""', 5, 6, { value: '' }],
    [')-token', ')', 7, 7, undefined],
    ['(-token', '(', 8, 8, undefined],
    ['comment', '/**/', 9, 12, undefined],
    [')-token', ')', 13, 13, undefined],
    ['(-token', '(', 14, 14, undefined],
    ['ident-token', '\\\\', 15, 16, { value: '\\' }],
    [')-token', ')', 17, 17, undefined],
    ['(-token', '(', 18, 18, undefined],
    ['whitespace-token', '\n', 19, 19, undefined],
    [')-token', ')', 20, 20, undefined],
    ['(-token', '(', 21, 21, undefined]
  ])
})

test('tokenizes string', () => {
  run('\'"\'"\\""', [
    ['string-token', `'"'`, 0, 2, { value: '"' }],
    ['string-token', '"\\""', 3, 6, { value: '"' }]
  ])
})

test('tokenizes escaped string', () => {
  run('"\\\\"', [['string-token', '"\\\\"', 0, 3, { value: '\\' }]])
})

test('changes lines in strings', () => {
  run('"\n\n""\n\n"', [
    ['bad-string-token', '"', 0, 0, undefined],
    ['whitespace-token', '\n\n', 1, 2, undefined],
    ['string-token', '""', 3, 4, { value: '' }],
    ['whitespace-token', '\n\n', 5, 6, undefined],
    ['string-token', '"', 7, 7, { value: '' }]
  ], { ignoreErrors : true })
})

test('tokenizes at-word', () => {
  run('@word ', [
    ['at-keyword-token', '@word', 0, 4, { value: 'word' }],
    ['whitespace-token', ' ', 5, 5, undefined]
  ])
})

test('tokenizes at-word end', () => {
  run('@one{@two()@three""@four;', [
    ['at-keyword-token', '@one', 0, 3, { value: 'one' }],
    ['{-token', '{', 4, 4, undefined],
    ['at-keyword-token', '@two', 5, 8, { value: 'two' }],
    ['(-token', '(', 9, 9, undefined],
    [')-token', ')', 10, 10, undefined],
    ['at-keyword-token', '@three', 11, 16, { value: 'three' }],
    ['string-token', '""', 17, 18, { value: '' }],
    ['at-keyword-token', '@four', 19, 23, { value: 'four' }],
    ['semicolon-token', ';', 24, 24, undefined]
  ])
})

test('tokenizes urls', () => {
  run('url(/*\\))', [
    ['url-token', 'url(/*\\)', 0, 7, { value: '/*\\' }],
    [')-token', ')', 8, 8, undefined]
  ])
})

test('tokenizes quoted urls', () => {
  run('url(")")', [
    ['function-token', 'url(', 0, 3, { value: 'url' }],
    ['string-token', '")"', 4, 6, { value: ')' }],
    [')-token', ')', 7, 7, undefined]
  ])
})

test('tokenizes at-symbol', () => {
  run('@', [['delim-token', '@', 0, 0, { value: '@' }]])
})

test('tokenizes comment', () => {
  run('/* a\nb */', [['comment', '/* a\nb */', 0, 8, undefined]])
})

test('changes lines in comments', () => {
  run('a/* \n */b', [
    ['ident-token', 'a', 0, 0, { value: 'a' }],
    ['comment', '/* \n */', 1, 7, undefined],
    ['ident-token', 'b', 8, 8, { value: 'b' }]
  ])
})

test('supports line feed', () => {
  run('a\fb', [
    ['ident-token', 'a', 0, 0, { value: 'a' }],
    ['whitespace-token', '\f', 1, 1, undefined],
    ['ident-token', 'b', 2, 2, { value: 'b' }]
  ])
})

test('supports carriage return', () => {
  run('a\rb\r\nc', [
    ['ident-token', 'a', 0, 0, { value: 'a' }],
    ['whitespace-token', '\r', 1, 1, undefined],
    ['ident-token', 'b', 2, 2, { value: 'b' }],
    ['whitespace-token', '\r\n', 3, 4, undefined],
    ['ident-token', 'c', 5, 5, { value: 'c' }]
  ])
})

test('tokenizes CSS', () => {
  let css =
    'a {\n' +
    '  content: "a";\n' +
    '  width: calc(1px;)\n' +
    '  }\n' +
    '/* small screen */\n' +
    '@media screen {}'
  run(css, [
    ['ident-token', 'a', 0, 0, { value: 'a' }],
    ['whitespace-token', ' ', 1, 1, undefined],
    ['{-token', '{', 2, 2, undefined],
    ['whitespace-token', '\n  ', 3, 5, undefined],
    ['ident-token', 'content', 6, 12, { value: 'content' }],
    ['colon-token', ':', 13, 13, undefined],
    ['whitespace-token', ' ', 14, 14, undefined],
    ['string-token', '"a"', 15, 17, { value: 'a' }],
    ['semicolon-token', ';', 18, 18, undefined],
    ['whitespace-token', '\n  ', 19, 21, undefined],
    ['ident-token', 'width', 22, 26, { value: 'width' }],
    ['colon-token', ':', 27, 27, undefined],
    ['whitespace-token', ' ', 28, 28, undefined],
    ['function-token', 'calc(', 29, 33, { value: 'calc' }],
    [
      'dimension-token',
      '1px',
      34,
      36,
      { value: 1, type: 'integer', unit: 'px' }
    ],
    ['semicolon-token', ';', 37, 37, undefined],
    [')-token', ')', 38, 38, undefined],
    ['whitespace-token', '\n  ', 39, 41, undefined],
    ['}-token', '}', 42, 42, undefined],
    ['whitespace-token', '\n', 43, 43, undefined],
    ['comment', '/* small screen */', 44, 61, undefined],
    ['whitespace-token', '\n', 62, 62, undefined],
    ['at-keyword-token', '@media', 63, 68, { value: 'media' }],
    ['whitespace-token', ' ', 69, 69, undefined],
    ['ident-token', 'screen', 70, 75, { value: 'screen' }],
    ['whitespace-token', ' ', 76, 76, undefined],
    ['{-token', '{', 77, 77, undefined],
    ['}-token', '}', 78, 78, undefined]
  ])
})

test('throws error on unclosed string', () => {
  throws(() => {
    tokenize(' "')
  }, /:1:2: Unclosed string/)
})

test('throws error on unclosed comment', () => {
  throws(() => {
    tokenize(' /*')
  }, /:1:2: Unclosed comment/)
})

test('throws error on unclosed url', () => {
  throws(() => {
    tokenize('url(')
  }, /:1:1: Unclosed url/)
})

test('throws error on unclosed url (with content)', () => {
  throws(() => {
    tokenize('url(foo')
  }, /:1:1: Unclosed url/)
})

test('ignores unclosing string on request', () => {
  run(
    ' "',
    [
      ['whitespace-token', ' ', 0, 0, undefined],
      ['string-token', '"', 1, 1, { value: '' }]
    ],
    { ignoreErrors: true }
  )
})

test('ignores unclosing comment on request', () => {
  run(
    ' /*',
    [
      ['whitespace-token', ' ', 0, 0, undefined],
      ['comment', '/*', 1, 2, undefined]
    ],
    { ignoreErrors: true }
  )
})

test('ignores unclosing function on request', () => {
  run(
    'url(',
    [
      ['url-token', 'url(', 0, 3, { value: '' }]
    ],
    { ignoreErrors: true }
  )
})

test('tokenizes hexadecimal escape', () => {
  run('\\0a \\09 \\z ', [
    ['ident-token', '\\0a \\09 \\z', 0, 9, { value: '\n\tz' }],
    ['whitespace-token', ' ', 10, 10, undefined]
  ])
})

// TODO : this feature is harder to implement with the new tokenizer
// test('ignore unclosed per token request', () => {
//   function token(css, opts) {
//     let processor = tokenizer(new Input(css), opts)
//     let tokens = []
//     while (!processor.endOfFile()) {
//       tokens.push(processor.nextToken({ ignoreUnclosed: true }))
//     }
//     return tokens
//   }

//   let css = "How's it going ("
//   let tokens = token(css, {})
//   let expected = [
//     ['word', 'How', 0, 2],
//     ['string', "'s", 3, 4],
//     ['space', ' '],
//     ['word', 'it', 6, 7],
//     ['space', ' '],
//     ['word', 'going', 9, 13],
//     ['space', ' '],
//     ['(', '(', 15]
//   ]

//   equal(tokens, expected)
// })

test('provides correct position', () => {
  let css = 'Three tokens'
  let processor = tokenizer(new Input(css))
  is(processor.position(), 0)
  processor.nextToken()
  is(processor.position(), 5)
  processor.nextToken()
  is(processor.position(), 6)
  processor.nextToken()
  is(processor.position(), 12)
  processor.nextToken()
  is(processor.position(), 12)
})

test.run()
