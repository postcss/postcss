'use strict'

const TokenType = {
  /**
   * 'comment'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#comment-diagram
   */
  Comment: 'comment',

  /**
   * 'at-keyword-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-at-keyword-token
   */
  AtKeyword: 'at-keyword-token',
  /**
   * 'bad-string-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-bad-string-token
   */
  BadString: 'bad-string-token',
  /**
   * 'bad-url-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-bad-url-token
   */
  BadURL: 'bad-url-token',
  /**
   * 'CDC-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-cdc-token
   */
  CDC: 'CDC-token',
  /**
   * 'CDO-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-cdo-token
   */
  CDO: 'CDO-token',
  /**
   * 'colon-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-colon-token
   */
  Colon: 'colon-token',
  /**
   * 'comma-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-comma-token
   */
  Comma: 'comma-token',
  /**
   * 'delim-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-delim-token
   */
  Delim: 'delim-token',
  /**
   * 'dimension-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-dimension-token
   */
  Dimension: 'dimension-token',
  /**
   * 'EOF-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-eof-token
   */
  EOF: 'EOF-token',
  /**
   * 'function-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-function-token
   */
  Function: 'function-token',
  /**
   * 'hash-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-hash-token
   */
  Hash: 'hash-token',
  /**
   * 'ident-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-ident-token
   */
  Ident: 'ident-token',
  /**
   * 'number-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-percentage-token
   */
  Number: 'number-token',
  /**
   * 'percentage-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-percentage-token
   */
  Percentage: 'percentage-token',
  /**
   * 'semicolon-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-semicolon-token
   */
  Semicolon: 'semicolon-token',
  /**
   * 'string-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-string-token
   */
  String: 'string-token',
  /**
   * 'url-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-url-token
   */
  URL: 'url-token',
  /**
   * 'whitespace-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-whitespace-token
   */
  Whitespace: 'whitespace-token',

  /**
   * '(-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-open-paren
   */
  OpenParen: '(-token',
  /**
   * ')-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-close-paren
   */
  CloseParen: ')-token',
  /**
   * '[-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-open-square
   */
  OpenSquare: '[-token',
  /**
   * ']-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-close-square
   */
  CloseSquare: ']-token',
  /**
   * '{-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-open-curly
   */
  OpenCurly: '{-token',
  /**
   * '}-token'
   * @link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-close-curly
   */
  CloseCurly: '}-token',
}

const NumberType = {
  Integer: 'integer',
  Number: 'number',
}

const HashType = {
  Unrestricted: 'unrestricted',
  ID: 'id',
}

/** ' */
const APOSTROPHE = 0x0027;
/** * */
const ASTERISK = 0x002a;
/** \b */
const BACKSPACE = 0x008;
/** \r */
const CARRIAGE_RETURN = 0x00d;
/** \t */
const CHARACTER_TABULATION = 0x009;
/** : */
const COLON = 0x003a;
/** , */
const COMMA = 0x002c;
/** @ */
const COMMERCIAL_AT = 0x0040;
/** \x7F */
const DELETE = 0x007f;
/** ! */
const EXCLAMATION_MARK = 0x0021;
/** \f */
const FORM_FEED = 0x000c;
/** . */
const FULL_STOP = 0x002e;
/** > */
const GREATER_THAN_SIGN = 0x003e;
/** - */
const HYPHEN_MINUS = 0x002d;
/** \x1F */
const INFORMATION_SEPARATOR_ONE = 0x001f;
/** E */
const LATIN_CAPITAL_LETTER_E = 0x0045;
/** e */
const LATIN_SMALL_LETTER_E = 0x0065;
/** { */
const LEFT_CURLY_BRACKET = 0x007b;
/** ( */
const LEFT_PARENTHESIS = 0x0028;
/** [ */
const LEFT_SQUARE_BRACKET = 0x005b;
/** < */
const LESS_THAN_SIGN = 0x003c;
/** \n */
const LINE_FEED = 0x00a;
/** \v */
const LINE_TABULATION = 0x00b;
/** _ */
const LOW_LINE = 0x005f;
/** \x10FFFF */
const MAXIMUM_ALLOWED_CODEPOINT = 0x10FFFF;
/** \x00 */
const NULL = 0x000;
/** # */
const NUMBER_SIGN = 0x0023;
/** % */
const PERCENTAGE_SIGN = 0x0025;
/** + */
const PLUS_SIGN = 0x002b;
/** " */
const QUOTATION_MARK = 0x0022;
/** � */
const REPLACEMENT_CHARACTER = 0xFFFD;
/** \ */
const REVERSE_SOLIDUS = 0x005c;
/** } */
const RIGHT_CURLY_BRACKET = 0x007d;
/** ) */
const RIGHT_PARENTHESIS = 0x0029;
/** ] */
const RIGHT_SQUARE_BRACKET = 0x005d;
/** ; */
const SEMICOLON = 0x003b;
/** \u0E */
const SHIFT_OUT = 0x00e;
/** / */
const SOLIDUS = 0x002f;
/** \u20 */
const SPACE = 0x0020;

// https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#digit
function isDigitCodePoint(search) {
  return search >= 0x0030 && search <= 0x0039;
}

// https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#hex-digit
function isHexDigitCodePoint(search) {
  return (
    isDigitCodePoint(search) || // 0 .. 9
    (search >= 0x0061 && search <= 0x0066) || // a .. f
    (search >= 0x0041 && search <= 0x0046)    // A .. F
  );
}

// https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#letter
function isLetterCodePoint(search) {
  return (
    (search >= 0x0061 && search <= 0x007a) || // a .. z
    (search >= 0x0041 && search <= 0x005a)    // A .. Z
  );
}

// https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#non-ascii-code-point
function isNonASCIICodePoint(search) {
  return search >= 0x0080;
}

// https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#ident-start-code-point
function isIdentStartCodePoint(search) {
  return isLetterCodePoint(search) || isNonASCIICodePoint(search) || search === LOW_LINE;
}

// https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#ident-code-point
function isIdentCodePoint(search) {
  return isIdentStartCodePoint(search) || isDigitCodePoint(search) || search === HYPHEN_MINUS;
}

// https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#non-printable-code-point
function isNonPrintableCodePoint(search) {
  return (
    (search === LINE_TABULATION) ||
    (search === DELETE) ||
    (NULL <= search && search <= BACKSPACE) ||
    (SHIFT_OUT <= search && search <= INFORMATION_SEPARATOR_ONE)
  );
}

// https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#whitespace
function isNewLine(search) {
  return search === 0x000a || search === 0x000d || search === FORM_FEED;
}

// https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#whitespace
function isWhitespace(search) {
  return search === SPACE || search === 0x000a || search === 0x0009 || search === 0x000d || search === FORM_FEED;
}

// https://infra.spec.whatwg.org/#surrogate
function isSurrogate(search) {
  return search >= 0xd800 && search <= 0xdfff;
}

function checkIfCodePointsMatchURLIdent(codePoints) {
  if (codePoints.length !== 3) {
    return false;
  }

  // "u"|"U"
  if (codePoints[0] !== 0x0075 && codePoints[0] !== 0x0055) {
    return false;
  }

  // "r"|"R"
  if (codePoints[1] !== 0x0072 && codePoints[1] !== 0x0052) {
    return false;
  }

  // "l"|"L"
  if (codePoints[2] !== 0x006c && codePoints[2] !== 0x004c) {
    return false;
  }

  return true;
}

module.exports = function tokenizer(input, options = {}) {
  let css = input.css.valueOf()
  let ignore = options.ignoreErrors
  let length = css.length;

  let cursor = 0;
  let codePointSource = new Array(length);
  let representationStart = 0;
  let representationEnd = -1;
  let returned = [];

  for (let i = 0; i < length; i++) {
    codePointSource[i] = css.charCodeAt(i);
  }

  function advanceCodePoint(n = 1) {
    cursor += n;
    representationEnd = cursor - 1;
  }

  function readCodePoint(n = 1) {
    if (cursor >= length) {
      return false;
    }

    let codePoint = codePointSource[cursor];

    cursor += n;
    representationEnd = cursor - 1;

    return codePoint;
  }

  function unreadCodePoint(n = 1) {
    cursor -= n;
    representationEnd = cursor - 1;
  }

  // https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#consume-token
  function checkIfFourCodePointsWouldStartCDO() {
    return codePointSource[cursor] === LESS_THAN_SIGN && codePointSource[cursor + 1] === EXCLAMATION_MARK && codePointSource[cursor + 2] === HYPHEN_MINUS && codePointSource[cursor + 3] === HYPHEN_MINUS;
  }

  // https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#consume-token
  function checkIfThreeCodePointsWouldStartCDC() {
    return codePointSource[cursor] === HYPHEN_MINUS && codePointSource[cursor + 1] === HYPHEN_MINUS && codePointSource[cursor + 2] === GREATER_THAN_SIGN;
  }

  // https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#would-start-an-identifier
  function checkIfThreeCodePointsWouldStartAnIdentSequence() {
    // // U+002D HYPHEN-MINUS
    if (codePointSource[cursor] === HYPHEN_MINUS) {
      // If the second code point is a U+002D HYPHEN-MINUS return true
      if (codePointSource[cursor + 1] === HYPHEN_MINUS) {
        return true;
      }

      // If the second code point is an ident-start code point return true
      if (isIdentStartCodePoint(codePointSource[cursor + 1])) {
        return true;
      }

      // If the second and third code points are a valid escape return true
      if (codePointSource[cursor + 1] === REVERSE_SOLIDUS && !isNewLine(codePointSource[cursor + 2])) {
        return true;
      }

      return false;
    }

    // ident-start code point
    // Return true.
    if (isIdentStartCodePoint(codePointSource[cursor])) {
      return true;
    }

    // U+005C REVERSE SOLIDUS (\)
    return checkIfTwoCodePointsAreAValidEscape();
  }

  // https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#starts-with-a-number
  function checkIfThreeCodePointsWouldStartANumber() {
    if (codePointSource[cursor] === PLUS_SIGN || codePointSource[cursor] === HYPHEN_MINUS) { // U+002B PLUS SIGN (+) or U+002D HYPHEN-MINUS (-)
      // If the second code point is a digit, return true.
      if (isDigitCodePoint(codePointSource[cursor + 1])) {
        return true;
      }

      // Otherwise, if the second code point is a U+002E FULL STOP (.)
      if (codePointSource[cursor + 1] === FULL_STOP) {
        // and the third code point is a digit, return true.
        return isDigitCodePoint(codePointSource[cursor + 2]);
      }

      // Otherwise, return false.
      return false;

    } else if (codePointSource[cursor] === FULL_STOP) { // U+002E FULL STOP (.)
      // If the second code point is a digit, return true.
      // Otherwise, return false.
      return isDigitCodePoint(codePointSource[cursor + 1]);
    }
    /* c8 ignore start */
    // Code path is unreachable in the current specification.
    return isDigitCodePoint(codePointSource[cursor]); // digit
  } /* c8 ignore stop */

  // https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#starts-with-a-valid-escape
  function checkIfTwoCodePointsAreAValidEscape() {
    // If the first code point is not U+005C REVERSE SOLIDUS (\), return false.
    if (codePointSource[cursor] !== REVERSE_SOLIDUS) { // "\"
      return false;
    }

    // Otherwise, if the second code point is a newline, return false.
    if (isNewLine(codePointSource[cursor + 1])) {
      return false;
    }

    // Otherwise, return true.
    return true;
  }

  // https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#consume-comments
  function checkIfTwoCodePointsStartAComment() {
    if (codePointSource[cursor] !== SOLIDUS) {
      return false;
    }

    if (codePointSource[cursor + 1] !== ASTERISK) {
      return false;
    }

    // Otherwise, return true.
    return true;
  }

  // https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#consume-remnants-of-bad-url
  function consumeBadURL() {
    while (true) {
      if (codePointSource[cursor] === undefined) {
        return;
      }

      if (codePointSource[cursor] === RIGHT_PARENTHESIS) {
        advanceCodePoint();
        return;
      }

      if (checkIfTwoCodePointsAreAValidEscape()) {
        advanceCodePoint();
        consumeEscapedCodePoint();
        continue;
      }

      advanceCodePoint();
      continue;
    }
  }

  // https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#consume-comment
  function consumeComment() {
    advanceCodePoint(2);

    while (true) {
      let codePoint = readCodePoint();
      if (codePoint === false) {
        if (!ignore) {
          throw input.error('Unclosed comment', representationStart)
        }

        break;
      }

      if (codePoint !== ASTERISK) {
        continue;
      }

      if (codePointSource[cursor] === undefined) {
        continue;
      }

      if (codePointSource[cursor] === SOLIDUS) {
        advanceCodePoint();
        break;
      }
    }

    return [
      TokenType.Comment,
      css.slice(representationStart, representationEnd + 1),
      representationStart,
      representationEnd,
      undefined,
    ];
  }

  // https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#consume-escaped-code-point
  function consumeEscapedCodePoint() {
    let codePoint = readCodePoint();
    if (codePoint === false) {
      if (!ignore) {
        throw input.error('Invalid character escape', representationStart)
      }

      return REPLACEMENT_CHARACTER;
    }

    if (isHexDigitCodePoint(codePoint)) {
      let hexSequence = [codePoint];

      while ((codePointSource[cursor] !== undefined) && isHexDigitCodePoint(codePointSource[cursor]) && hexSequence.length < 6) {
        hexSequence.push(codePointSource[cursor]);
        advanceCodePoint();
      }

      if (isWhitespace(codePointSource[cursor])) {
        advanceCodePoint();
      }

      let codePointLiteral = parseInt(String.fromCharCode(...hexSequence), 16);
      if (codePointLiteral === 0) {
        return REPLACEMENT_CHARACTER;
      }
      if (isSurrogate(codePointLiteral)) {
        return REPLACEMENT_CHARACTER;
      }
      if (codePointLiteral > MAXIMUM_ALLOWED_CODEPOINT) {
        return REPLACEMENT_CHARACTER;
      }

      return codePointLiteral;
    }

    return codePoint;
  }


  // https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#consume-token
  function consumeHashToken() {
    advanceCodePoint();

    if (
      (codePointSource[cursor] !== undefined) && (
        isIdentCodePoint(codePointSource[cursor]) ||
        checkIfTwoCodePointsAreAValidEscape()
      )
    ) {
      let hashType = HashType.Unrestricted;

      if (checkIfThreeCodePointsWouldStartAnIdentSequence()) {
        hashType = HashType.ID;
      }

      let identSequence = consumeIdentSequence();
      return [
        TokenType.Hash,
        css.slice(representationStart, representationEnd + 1),
        representationStart,
        representationEnd,
        {
          value: String.fromCharCode(...identSequence),
          type: hashType,
        },
      ];
    }

    return [
      TokenType.Delim,
      '#',
      representationStart,
      representationEnd,
      {
        value: '#',
      },
    ];
  }


  // https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#consume-ident-like-token
  function consumeIdentLikeToken() {
    let codePoints = consumeIdentSequence();

    if (codePointSource[cursor] !== LEFT_PARENTHESIS) {
      return [
        TokenType.Ident,
        css.slice(representationStart, representationEnd + 1),
        representationStart,
        representationEnd,
        {
          value: String.fromCharCode(...codePoints),
        },
      ];
    }

    if (checkIfCodePointsMatchURLIdent(codePoints)) {
      advanceCodePoint();

      let read = 0;

      while (true) {
        let firstIsWhitespace = isWhitespace(codePointSource[cursor]);
        let secondIsWhitespace = isWhitespace(codePointSource[cursor + 1]);
        if (firstIsWhitespace && secondIsWhitespace) {
          read += 1;
          advanceCodePoint(1);
          continue;
        }

        let firstNonWhitespace = firstIsWhitespace ? codePointSource[cursor + 1] : codePointSource[cursor];
        if (firstNonWhitespace === QUOTATION_MARK || firstNonWhitespace === APOSTROPHE) {
          if (read > 0) {
            // https://github.com/w3c/csswg-drafts/issues/8280#issuecomment-1370566921
            unreadCodePoint(read);
          }

          return [
            TokenType.Function,
            css.slice(representationStart, representationEnd + 1),
            representationStart,
            representationEnd,
            {
              value: String.fromCharCode(...codePoints),
            },
          ];
        }

        break;
      }

      return consumeUrlToken();
    }

    advanceCodePoint();
    return [
      TokenType.Function,
      css.slice(representationStart, representationEnd + 1),
      representationStart,
      representationEnd,
      {
        value: String.fromCharCode(...codePoints),
      },
    ];
  }

  // https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#consume-name
  function consumeIdentSequence() {
    let result = [];

    while (true) {
      if (isIdentCodePoint(codePointSource[cursor])) {
        result.push(codePointSource[cursor]);
        advanceCodePoint();
        continue;
      }

      if (checkIfTwoCodePointsAreAValidEscape()) {
        advanceCodePoint();
        result.push(consumeEscapedCodePoint());
        continue;
      }

      return result;
    }
  }

  // https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#consume-number
  function consumeNumber() {
    // 1. Initially set type to "integer".
    let type = NumberType.Integer;

    // 2. If the next input code point is U+002B PLUS SIGN (+) or U+002D HYPHEN-MINUS (-), consume it and append it to repr.
    if (codePointSource[cursor] === PLUS_SIGN || codePointSource[cursor] === HYPHEN_MINUS) {
      advanceCodePoint();
    }

    // 3. While the next input code point is a digit, consume it and append it to repr.
    while (isDigitCodePoint(codePointSource[cursor])) {
      advanceCodePoint();
    }

    // 4. If the next 2 input code points are U+002E FULL STOP (.) followed by a digit, then:
    if (codePointSource[cursor] === FULL_STOP && isDigitCodePoint(codePointSource[cursor + 1])) {
      // 4.1. Consume them.
      advanceCodePoint(2);

      // 4.3. Set type to "number".
      type = NumberType.Number;

      // 4.4. While the next input code point is a digit, consume it and append it to repr.
      while (isDigitCodePoint(codePointSource[cursor])) {
        advanceCodePoint();
      }
    }

    // 5. If the next 2 or 3 input code points are U+0045 LATIN CAPITAL LETTER E (E) or U+0065 LATIN SMALL LETTER E (e),
    // optionally followed by U+002D HYPHEN-MINUS (-) or U+002B PLUS SIGN (+),
    // followed by a digit, then:
    if (codePointSource[cursor] === LATIN_SMALL_LETTER_E || codePointSource[cursor] === LATIN_CAPITAL_LETTER_E) {
      if (isDigitCodePoint(codePointSource[cursor + 1])) {
        // 5.1. Consume them.
        advanceCodePoint(2);
      } else if (
        (codePointSource[cursor + 1] === HYPHEN_MINUS || codePointSource[cursor + 1] === PLUS_SIGN) &&
        isDigitCodePoint(codePointSource[cursor + 2])
      ) {
        // 5.1. Consume them.
        advanceCodePoint(3);
      } else {
        return type;
      }

      // 5.3. Set type to "number".
      type = NumberType.Number;

      // 5.4. While the next input code point is a digit, consume it and append it to repr.
      while (isDigitCodePoint(codePointSource[cursor])) {
        advanceCodePoint();
      }
    }

    return type;
  }

  // https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#consume-numeric-token
  function consumeNumericToken() {
    let numberType = consumeNumber();
    let numberValue = parseFloat(css.slice(representationStart, representationEnd + 1));

    if (checkIfThreeCodePointsWouldStartAnIdentSequence()) {
      let unit = consumeIdentSequence();
      return [
        TokenType.Dimension,
        css.slice(representationStart, representationEnd + 1),
        representationStart,
        representationEnd,
        {
          value: numberValue,
          type: numberType,
          unit: String.fromCharCode(...unit),
        },
      ];
    }

    if (codePointSource[cursor] === PERCENTAGE_SIGN) {
      advanceCodePoint();

      return [
        TokenType.Percentage,
        css.slice(representationStart, representationEnd + 1),
        representationStart,
        representationEnd,
        {
          value: numberValue,
        },
      ];
    }

    return [
      TokenType.Number,
      css.slice(representationStart, representationEnd + 1),
      representationStart,
      representationEnd,
      {
        value: numberValue,
        type: numberType,
      },
    ];
  }

  // https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#consume-string-token
  function consumeStringToken() {
    let result = '';
    let first = readCodePoint();

    while (true) {
      let next = readCodePoint();
      if (next === false) {
        if (!ignore) {
          throw input.error('Unclosed string', representationStart)
        }

        return [TokenType.String, css.slice(representationStart, representationEnd + 1), representationStart, representationEnd, { value: result }];
      }

      if (isNewLine(next)) {
        if (!ignore) {
          throw input.error('Unclosed string', representationStart)
        }

        unreadCodePoint();
        return [TokenType.BadString, css.slice(representationStart, representationEnd + 1), representationStart, representationEnd, undefined];
      }

      if (next === first) {
        return [TokenType.String, css.slice(representationStart, representationEnd + 1), representationStart, representationEnd, { value: result }];
      }

      if (next === REVERSE_SOLIDUS) {
        if (codePointSource[cursor] === undefined) {
          continue;
        }

        if (isNewLine(codePointSource[cursor])) {
          advanceCodePoint();
          continue;
        }

        result += String.fromCharCode(consumeEscapedCodePoint());
        continue;
      }

      result += String.fromCharCode(next);
    }
  }

  // https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#consume-url-token
  function consumeUrlToken() {
    consumeWhiteSpace();
    let string = '';

    while (true) {
      if (codePointSource[cursor] === undefined) {
        if (!ignore) {
          throw input.error('Unclosed url', representationStart)
        }

        return [
          TokenType.URL,
          css.slice(representationStart, representationEnd + 1),
          representationStart,
          representationEnd,
          {
            value: string,
          },
        ];
      }

      if (codePointSource[cursor] === RIGHT_PARENTHESIS) {
        advanceCodePoint();
        return [
          TokenType.URL,
          css.slice(representationStart, representationEnd + 1),
          representationStart,
          representationEnd,
          {
            value: string,
          },
        ];
      }

      if (isWhitespace(codePointSource[cursor])) {
        consumeWhiteSpace();
        if (codePointSource[cursor] === undefined) {
          if (!ignore) {
            throw input.error('Unclosed url', representationStart)
          }

          return [
            TokenType.URL,
            css.slice(representationStart, representationEnd + 1),
            representationStart,
            representationEnd,
            {
              value: string,
            },
          ];
        }

        if (codePointSource[cursor] === RIGHT_PARENTHESIS) {
          advanceCodePoint();
          return [
            TokenType.URL,
            css.slice(representationStart, representationEnd + 1),
            representationStart,
            representationEnd,
            {
              value: string,
            },
          ];
        }

        consumeBadURL();
        return [
          TokenType.BadURL,
          css.slice(representationStart, representationEnd + 1),
          representationStart,
          representationEnd,
          undefined,
        ];
      }

      if (codePointSource[cursor] === QUOTATION_MARK || codePointSource[cursor] === APOSTROPHE || codePointSource[cursor] === LEFT_PARENTHESIS || isNonPrintableCodePoint(codePointSource[cursor])) {
        consumeBadURL();

        if (!ignore) {
          throw input.error('Unexpected characters in url', representationStart)
        }

        return [
          TokenType.BadURL,
          css.slice(representationStart, representationEnd + 1),
          representationStart,
          representationEnd,
          undefined,
        ];
      }

      if (codePointSource[cursor] === REVERSE_SOLIDUS) {
        if (checkIfTwoCodePointsAreAValidEscape()) {
          advanceCodePoint();
          string += String.fromCharCode(consumeEscapedCodePoint());
          continue;
        }

        consumeBadURL();

        if (!ignore) {
          throw input.error('Invalid character escaping in url', representationStart)
        }

        return [
          TokenType.BadURL,
          css.slice(representationStart, representationEnd + 1),
          representationStart,
          representationEnd,
          undefined,
        ];
      }

      string += String.fromCharCode(codePointSource[cursor]);
      advanceCodePoint();
    }
  }

  function consumeWhiteSpace() {
    while (true) {
      if (!isWhitespace(codePointSource[cursor])) {
        break;
      }

      advanceCodePoint();
    }

    return [
      TokenType.Whitespace,
      css.slice(representationStart, representationEnd + 1),
      representationStart,
      representationEnd,
      undefined,
    ];
  }

  function position() {
    return cursor
  }

  function endOfFile() {
    return returned.length === 0 && cursor >= length
  }

  function nextToken() {
    if (returned.length) return returned.pop()
    if (cursor >= length) return

    representationStart = cursor;
    representationEnd = -1;

    if (checkIfTwoCodePointsStartAComment()) {
      return consumeComment();
    }

    let peeked = codePointSource[cursor];
    if (isIdentStartCodePoint(peeked)) {
      return consumeIdentLikeToken();
    }

    if (isDigitCodePoint(peeked)) {
      return consumeNumericToken();
    }

    // Simple, one character tokens:
    switch (peeked) {
      case COMMA:
        advanceCodePoint();
        return [TokenType.Comma, ',', representationStart, representationEnd, undefined];

      case COLON:
        advanceCodePoint();
        return [TokenType.Colon, ':', representationStart, representationEnd, undefined];

      case SEMICOLON:
        advanceCodePoint();
        return [TokenType.Semicolon, ';', representationStart, representationEnd, undefined];

      case LEFT_PARENTHESIS:
        advanceCodePoint();
        return [TokenType.OpenParen, '(', representationStart, representationEnd, undefined];

      case RIGHT_PARENTHESIS:
        advanceCodePoint();
        return [TokenType.CloseParen, ')', representationStart, representationEnd, undefined];

      case LEFT_SQUARE_BRACKET:
        advanceCodePoint();
        return [TokenType.OpenSquare, '[', representationStart, representationEnd, undefined];

      case RIGHT_SQUARE_BRACKET:
        advanceCodePoint();
        return [TokenType.CloseSquare, ']', representationStart, representationEnd, undefined];

      case LEFT_CURLY_BRACKET:
        advanceCodePoint();
        return [TokenType.OpenCurly, '{', representationStart, representationEnd, undefined];

      case RIGHT_CURLY_BRACKET:
        advanceCodePoint();
        return [TokenType.CloseCurly, '}', representationStart, representationEnd, undefined];

      case APOSTROPHE:
      case QUOTATION_MARK:
        return consumeStringToken();

      case NUMBER_SIGN:
        return consumeHashToken();

      case PLUS_SIGN:
      case FULL_STOP:
        if (checkIfThreeCodePointsWouldStartANumber()) {
          return consumeNumericToken();
        }

        advanceCodePoint();
        return [TokenType.Delim, css[representationStart], representationStart, representationEnd, {
          value: css[representationStart],
        }];

      case LINE_FEED:
      case CARRIAGE_RETURN:
      case FORM_FEED:
      case CHARACTER_TABULATION:
      case SPACE:
        return consumeWhiteSpace();

      case HYPHEN_MINUS:
        if (checkIfThreeCodePointsWouldStartANumber()) {
          return consumeNumericToken();
        }

        if (checkIfThreeCodePointsWouldStartCDC()) {
          advanceCodePoint(3);

          return [TokenType.CDC, '-->', representationStart, representationEnd, undefined];
        }

        if (checkIfThreeCodePointsWouldStartAnIdentSequence()) {
          return consumeIdentLikeToken();
        }

        advanceCodePoint();
        return [TokenType.Delim, '-', representationStart, representationEnd, {
          value: '-',
        }];

      case LESS_THAN_SIGN:
        if (checkIfFourCodePointsWouldStartCDO()) {
          advanceCodePoint(4);

          return [TokenType.CDO, '<!--', representationStart, representationEnd, undefined];
        }

        advanceCodePoint();
        return [TokenType.Delim, '<', representationStart, representationEnd, {
          value: '<',
        }];

      case COMMERCIAL_AT:
        advanceCodePoint();
        if (checkIfThreeCodePointsWouldStartAnIdentSequence()) {
          let identSequence = consumeIdentSequence();

          return [TokenType.AtKeyword, css.slice(representationStart, representationEnd + 1), representationStart, representationEnd, {
            value: String.fromCharCode(...identSequence),
          }];
        }

        return [TokenType.Delim, '@', representationStart, representationEnd, {
          value: '@',
        }];

      case REVERSE_SOLIDUS:
        if (checkIfTwoCodePointsAreAValidEscape()) {
          return consumeIdentLikeToken();
        }

        advanceCodePoint();

        if (!ignore) {
          throw input.error('Invalid character escape', representationStart)
        }

        return [TokenType.Delim, '\\', representationStart, representationEnd, {
          value: '\\',
        }];
    }

    advanceCodePoint();
    return [TokenType.Delim, css[representationStart], representationStart, representationEnd, {
      value: css[representationStart],
    }];
  }

  function back(token) {
    returned.push(token)
  }

  return {
    back,
    nextToken,
    endOfFile,
    position
  }
}
