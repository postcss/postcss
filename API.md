# PostCSS API

## `postcss` Function

It is a main enter point of PostCSS:

```js
var postcss = require('postcss');
```

### `postcss(plugins)`

Return new `PostCSS` instance and set plugins from `plugins` array
as CSS processors.

```js
postcss([autoprefixer, cssnext, cssgrace]).process(css).css;
```

Also you can create empty `PostCSS` and set plugins by `PostCSS#use` method.
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

* `from` is a path to CSS file. You should always set it, because it used
  in map generation and in syntax error messages.
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

## `PostCSS` class

`PostCSS` instance contains plugin to process CSS. You can create one `PostCSS`
instance and use it on many CSS files:

```js
var processor = postcss([autoprefixer, cssnext, cssgrace]);
processor.process(css1).css;
processor.process(css2).css;
```

### `use(plugin)`

Add plugin to CSS processors. There is a two way to set plugins:
in `postcss(plugins)` constructor or by this method.

```
var processor = postcss();
processor.use(autoprefixer).use(cssnext).use(cssgrace);
```

There is three format of plugin:

1. Function. PostCSS will send a `Root` instance as first argument.
2. An object with `postcss` method. PostCSS will use this method as function
   from function format below.
3. Instance of `PostCSS`. PostCSS will copy plugins from there.

Plugin function should change `Root` from first argument or return new `Root`.

```js
processor.use(function (css) {
    css.prepend({ name: 'charset', params: '"UTF-8"' });
});
processor.use(function (css) {
    return postcss.root();
});
```

### `process(css, opts)`

This is a main method of PostCSS. It will parse CSS to `Root`, send this root
to each plugin and then return `Result` object from transformed root.

```
var result = processor.process(css, { from: 'a.css', to: 'a.out.css' });
```

Options:

* `from` is a path to input CSS file. You should always set it, because it used
  in map generation and in syntax error messages.
* `to` is a path to output CSS file. You should always set it to generates
  correct source map.
* `safe` enables [Safe Mode] when PostCSS will try to fix CSS syntax errors.
* `map` is a object with [source map options].

[source map options]: https://github.com/postcss/postcss#source-map-1
