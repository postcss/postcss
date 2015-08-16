# How to Write Custom Syntax

PostCSS can transforms styles in any syntax, not only in CSS.
You can write a custom syntax and transform styles in any format.

Writing a custom syntax is much harder then writing just a PostCSS plugin.
But it is a awesome adventure.

There are 3 types of PostCSS syntax packages:

* **Parser** to parse input string to node’s tree.
* **Stringifier** to generate output string by node’s tree.
* **Syntax** contains both parser and stringifier.

## Syntax

Good example of syntax is [SCSS]. Some users may want to change properties order
or add prefixes directly to SCSS sources. So we need SCSS input and output.

Syntax API is very simple. It is just a object with `parse` and `stringify`
functions:

```js
module.exports = {
    parse:     require('./parse'),
    stringify: require('./stringify')
};
```

[SCSS]: https://github.com/postcss/postcss-scss

## Parser

Main example of parse is [Safe Parser], which parses broken CSS.
There is no sense to generate string with broken CSS,
so package provides only parser.

Parser API is a function, that receives string and returns [`Root`] node.
In second argument this function receives a object with PostCSS options.

```js
var postcss = require('postcss');

module.exports = function (css, opts) {
    var root = postcss.root();
    // Add other nodes to root
    return root;
};
```

[Safe Parser]: https://github.com/postcss/postcss-safe-parser
[`Root`]:      https://github.com/postcss/postcss/blob/master/docs/api.md#root-node

### Main Theory

There are many books about parsers. But do not scary, CSS syntax is very easy,
so parser will be much simpler than programming language parsers.

The default PostCSS parser contains two steps:

* [Tokenizer] to read input string char by char and build tokens array.
  For example, it join spaces symbols to `['space', '\n  ']` token,
  or detect strings to `['string', '"\"{"']`.
* [Parser] to read tokens array, create node instances and build tree.

[Tokenizer]: https://github.com/postcss/postcss/blob/master/lib/tokenize.es6
[Parser]:    https://github.com/postcss/postcss/blob/master/lib/parser.es6

### Performance

Parsing input is a longest task in CSS processors. So it is very important
to have fast parser.

The main rule of optimization: there is no performance without benchmark.
You can look at [PostCSS benchmarks] to build your own.

If we will look deeper, the tokenize step will be a longest part of parsing.
So you should focus only on tokenizer performance. Other parts could be
well written maintainable code.

1. Unfortunately, classes, functions and high level structures can slow down
your tokenizer. Be ready to write dirty code with code repeating.
This is why it is difficult to extend default [PostCSS tokenizer].
Copy paste will be a necessary evil.

2. Second optimization is using char codes instead of string.

    ```js
   // Slow
   string[i] === '{';

   // Fast
   const OPEN_CURLY = 123; // `{'
   string.charCodeAt(i) === OPEN_CURLY;
    ```

3. Third optimization is “fast jumps”. If you find open quote, you can find
   next close quote much faster by `indexOf`:

    ```js
   // Simple jump
   next = string.indexOf('"', currentPosition + 1);

   // Jump by RegExp
   regexp.lastIndex = currentPosion + 1;
   regexp.text(string);
   next = regexp.lastIndex;
    ```

Parser can be well written class. There is no need in copy-paste and
hardcore optimization there. You can extend default [PostCSS parser].

[PostCSS benchmarks]: https://github.com/postcss/benchmark
[PostCSS tokenizer]:  https://github.com/postcss/postcss/blob/master/lib/tokenize.es6
[PostCSS parser]:     https://github.com/postcss/postcss/blob/master/lib/parser.es6

### Node Source

Every node should have `source` property to generate correct source map.
This property contains `start` and `end` properties with `{ line, column }`,
and `input` property with [`Input`] instance.

So your tokenizer should save position to every token to use set it to nodes
in parser.

[`Input`]: https://github.com/postcss/postcss/blob/master/lib/input.es6

### Raw Values

Good PostCSS parser should provide all information (including spaces symbols)
to generate byte-to-byte equal output. It is not so difficult, but respectful
for user input and allow integration smoke tests.

Parser should save all addition symbols to [`node.raws`] object.
It is a open structure for you, you can add addition keys.
For example, [SCSS parser] saves comment types (`/* */` or `//`)
in `node.raws.inline`.

Default parser cleans CSS values from comments and spaces.
It saves origin value with comments to `node.raws.value.raw` and use it,
if node value was not changed.

[SCSS parser]: https://github.com/postcss/postcss-scss
[`node.raws`]: https://github.com/postcss/postcss/blob/master/docs/api.md#node-raws

### Tests

Of course, all parsers in PostCSS ecosystem must have tests.

If your parser just extend CSS syntax (like [SCSS] or [Safe Parser]),
you can use [PostCSS Parser Tests]. It contains unit and integration tests.

[PostCSS Parser Tests]: https://github.com/postcss/postcss-parser-tests

## Stringifier

Style guide generator is good example of stringifier. It generates output HTML
with usage examples by component CSS. So there is no sense for parser
and package can contain only stringifier.

Stringifier API is little bit more complicated, that parser API.
PostCSS generates source map. So stringifier can’t just return a string.
It must link every substring with source node.

Stringifier is a function, that receives [`Root`] node and builder callback.
Then it calls builder with every node’s string and node instance.

```js
module.export = function (root, builder) {
    // Some magic
    var string = decl.prop + ':' + decl.value + ';';
    builder(string, decl);
    // Some science
};
```

### Main Theory

PostCSS [default stringifier] is just a class with method for each node type
and many methods to detect raw properties.

In most cases it will be enough just to extent this class,
like in [SCSS stringifier].

[default stringifier]: https://github.com/postcss/postcss/blob/master/lib/stringifier.es6
[SCSS stringifier]:    https://github.com/postcss/postcss-scss/blob/master/lib/scss-stringifier.es6

### Builder Function

Builder function will be pass to `stringify` function as second argument.
For example, default PostCSS stringifier class saves it
to `this.builder` property.

Builder receives output substring and source node to append this substring
to final output.

Some nodes contains other nodes in the middle. For example, rule has `a {`
beginning, many declarations inside and `}` at the end.

For this cases, you should pass a third argument to builder function:
`'start'` or `'end'` string:

```js
this.builder(rule.selector + '{', rule, 'start');
// Stringify declarations inside
this.builder('}', rule, 'end');
```

### Raw Values

Good PostCSS syntax saves all symbols and provide byte-to-byte equal output
if there were no changes.

This is why every node has [`node.raws`] object to store space symbol, etc.

But be ready, that any of this raw properties can be missed. Some nodes
can be built manually. Some nodes can loose indent on moving between parents.

This is why default stringifier has `raw()` method to autodetect raw property
by other nodes. For example, it will look at other nodes to detect indent size
and them multiply it with current node depth.

[`node.raws`]: https://github.com/postcss/postcss/blob/master/docs/api.md#node-raws

### Tests

Stringifier must have a tests too.

You can use unit and integration cases from [PostCSS Parser Tests].
Just compare input CSS with CSS after you parser and stringifier.

[PostCSS Parser Tests]: https://github.com/postcss/postcss-parser-tests
