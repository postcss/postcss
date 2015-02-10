# PostCSS API

## `postcss`

It is a main enter point of PostCSS:

```js
var postcss = require('postcss');
```

### `postcss(plugins)`

Return new `PostCSS` and set plugins from `plugins` array as CSS processors.

```js
postcss([autoprefixer, cssnext]).process(css).css;
```

See `PostCSS#use` docs below for plugin formats.

### `postcss.parse(css, opts)`

Parse CSS and return `Root` with CSS nodes inside. You can use it to get ssome
information from CSS or to works with several CSS file:

```js
// Simple CSS concatenation with source map support
var root1 = postcss.parse(css1, { from: file1 });
var root2 = postcss.parse(css2, { from: file2 });
root1.append(root2).toResult().css;
```

Options:

* `from` is a path to CSS file. It is strongly recommended, because this option
  will be used in map generation and in syntax error messages.
* `safe` enables [Safe Mode] when PostCSS will try to fix CSS syntax errors.
* `map` is a object with [source map options].

[source map options]: https://github.com/postcss/postcss#source-map-1
[Safe Mode]:          https://github.com/postcss/postcss#safe-mode

### `postcss.root(props)`

Shortcut to create `Root` instance manually:

```js
postcss.root({ after: '\n' }).toString() //=> "\n"
```

### `postcss.atRule(props)`

Shortcut to create `AtRule` node manually:

```js
postcss.atRule({ name: 'charset' }).toString() //=> "@charset"
```

### `postcss.rule(props)`

Shortcut to create `Rule` node manually:

```js
postcss.rule({ selector: 'a' }).toString() //=> "a {\n}"
```

### `postcss.decl(props)`

Shortcut to create `Declaration` node manually:

```js
postcss.decl({ prop: 'color', value: 'black' }).toString() //=> "color: black"
```

### `postcss.comment(props)`

Shortcut to create `Comment` node manually:

```js
postcss.comment({ text: 'test' }).toString() //=> "/* test */"
```
