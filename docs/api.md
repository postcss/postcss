# PostCSS API

* [`postcss` function](#postcss-function)
* [`Processor` class](#processor-class)
* [`LazyResult` class](#lazyresult-class)
* [`Result` class](#result-class)
* [`Warning` class](#warning-class)
* [`CssSyntaxError` class](#csssyntaxerror-class)
* [Vendor module](#vendor-module)
* [List module](#list-module)
* [`Input` class](#input-class)
* [Nodes common methods](#nodes-common-methods)
* [Containers common methods](#containers-common-methods)
* [`Root` node](#root-node)
* [`AtRule` node](#atrule-node)
* [`Rule` node](#rule-node)
* [`Declaration` node](#declaration-node)
* [`Comment` node](#comment-node)

## `postcss` function

The `postcss` function is the main entry point for PostCSS.

```js
var postcss = require('postcss');
```

For those using TypeScript with an [ES6 compile target], you can import
the PostCSS API like so:

```ts
///<reference path="node_modules/postcss/postcss.d.ts" />
import * as postcss from 'postcss';
```

[ES6 compile target]: https://github.com/Microsoft/TypeScript/wiki/tsconfig.json

### `postcss(plugins)`

Returns a new [`Processor`] instance that will apply `plugins`
as CSS processors.

```js
postcss([autoprefixer, cssnext, cssgrace]).process(css).css;
```

Arguments:

* `plugins (array)`: list of PostCSS plugins to be included as processors.

Plugins can also be included with the [`Processor#use`] method.
See its description below for details about plugin formats.

### `postcss.parse(css, opts)`

Parses source `css` and returns a new `Root` node, which contains
the source CSS nodes.

```js
// Simple CSS concatenation with source map support
var root1 = postcss.parse(css1, { from: file1 });
var root2 = postcss.parse(css2, { from: file2 });
root1.append(root2).toResult().css;
```

Arguments:

* `css (string|#toString)`: String with input CSS or any object
  with `toString()` method, like file stream.
* `opts (object) optional`: options:
  * `from`: the path to the source CSS file. You should always set `from`,
    because it is used in map generation and in syntax error messages.
  * `map`: an object of [source map options].
    Only `map.prev` is used in `parse`.

### `postcss.plugin(name, initializer)`

Creates a PostCSS plugin with a standard API.

```js
var remove = postcss.plugin('postcss-remove', function (opts) {
    opts = opts || {};
    var filter = opts.prop || 'z-index';
    return function (css, result) {
        css.walkDecls(filter, function (decl) {
            decl.remove();
        });
    };
});

postcss([ remove ])                   // with default options
postcss([ remove({ prop: 'color' })]) // with options
```

Arguments:

* `name (string)`: PostCSS plugin name. Same as in `name` property
  in `package.json`. It will be saved in `plugin.postcssPlugin` property.
* `initializer  (function)`: will receive plugin options and should return
  functions to modify nodes in input CSS.

The newly-wrapped function will provide both the name and PostCSS
version of the plugin:

```js
var processor = postcss([replace]);
processor.plugins[0].postcssPlugin  //=> 'postcss-replace'
processor.plugins[0].postcssVersion //=> '4.1.0'
```

The plugin function receives 2 arguments: [`Root` node] and [`Result`] instance.
The function should mutate the provided `Root` node. Alternatively, you can
create a new `Root` node and override the `result.root` property.

```js
var cleaner = postcss.plugin('postcss-cleaner', function () {
    return function (css, result) {
        result.root = postcss.root();
    };
});
```

As a convenience, plugins also expose a `process` method so that you can use
them as standalone tools.

```js
cleaner.process(css, options);
// This is equivalent to:
postcss([ cleaner(options) ]).process(css);
```

Asynchronous plugins should return a `Promise` instance.

```js
postcss.plugin('postcss-import', function () {
    return function (css, result) {
        return new Promise(function (resolve, reject) {
            fs.readFile('base.css', function (base) {
                css.prepend(base);
                resolve();
            });
        });
    };
});
```

Add warnings using the [`Node#warn()`] method.

```js
postcss.plugin('postcss-caniuse-test', function () {
    return function (css, result) {
        css.walkDecls(function (decl) {
            if ( !caniuse.support(decl.prop) ) {
                decl.warn(result,
                  'Some browsers do not support ' + decl.prop);
            }
        });
    };
});
```

Send data to other plugins using the [`Result#messages`] array.

### `postcss.root(props)`

Creates a new [`Root` node].

```js
postcss.root({ after: '\n' }).toString() //=> "\n"
```

Arguments:

* `props (object) optional`: properties for the new root node.

### `postcss.atRule(props)`

Creates a new [`AtRule` node].

```js
postcss.atRule({ name: 'charset' }).toString() //=> "@charset"
```

Arguments:

* `props (object) optional`: properties for the new at-rule node.

### `postcss.rule(props)`

Creates a new [`Rule` node].

```js
postcss.rule({ selector: 'a' }).toString() //=> "a {\n}"
```

Arguments:

* `props (object) optional`: properties for the new rule node.

### `postcss.decl(props)`

Creates a new [`Declaration` node].

```js
postcss.decl({ prop: 'color', value: 'black' }).toString() //=> "color: black"
```

Arguments:

* `props (object) optional`: properties for the new declaration node.

### `postcss.comment(props)`

Creates a new [`Comment` node].

```js
postcss.comment({ text: 'test' }).toString() //=> "/* test */"
```

Arguments:

* `props (object) optional`: properties for the new comment node.

### `postcss.vendor`

Contains the [Vendor module](#vendor-module).

```js
postcss.vendor.unprefixed('-moz-tab') //=> ['tab']
```

### `postcss.list`

Contains the [List module](#list-module).

```js
postcss.list.space('5px calc(10% + 5px)') //=> ['5px', 'calc(10% + 5px)']
```

### `postcss.stringify(node, builder)`

Default function to convert a node tree into a CSS string.

## `Processor` class

A `Processor` instance contains plugins to process CSS. Create
one `Processor` instance, initialize its plugins, and then use that instance
on numerous CSS files.

```js
var processor = postcss([autoprefixer, cssnext, cssgrace]);
processor.process(css1).css;
processor.process(css2).css;
```

### `processor.use(plugin)`

Adds a plugin to be used as a CSS processor.

```js
var processor = postcss();
processor.use(autoprefixer()).use(cssnext()).use(cssgrace());
```

Arguments:

* `plugin (function|#postcss|Processor)`: PostCSS plugin. It can be in three
  formats:
  * A plugin created by [`postcss.plugin()`] method.
  * A function. PostCSS will pass the function a [`Root` node]
    as the first argument and current [`Result`] instance as the second.
  * An object with a `postcss` method. PostCSS will use that method
    as described in #2.
  * Another `Processor` instance. PostCSS will copy plugins
    from that instance into this one.

Plugins can also be added by passing them as arguments when creating
a `postcss` instance (see [`postcss(plugins)`]).

Asynchronous Plugins should return a `Promise` instance.

### `processor.process(css, opts)`

Parses source CSS and returns a [`LazyResult`] instance. Because some plugins
can be asynchronous it doesn’t make any transformations. Transformations will
be applied in the `LazyResult`’s methods.

```js
processor.process(css, { from: 'a.css', to: 'a.out.css' }).then(function (result) {
    console.log(result.css);
});
```

Arguments:

* `css (string|#toString|Result)`: String with input CSS or any object
  with a `toString()` method, like file stream. Optionally, send a [`Result`]
  instance and the processor will take the existing [`Root`] parser from it.
* `opts (object) optional`: options:
  * `from`: the path of the CSS source file. You should always set `from`,
    because it is used in source map generation and syntax error messages.
  * `to`: the path where you’ll put the output CSS file. You should always set
    `to` to generate correct source maps.
  * `parser`: function to generate AST by string.
  * `stringifier`: class to generate string by AST.
  * `syntax`: object with `parse` and `stringify` functions.
  * `map`: an object of [source map options].

### `processor.plugins`

Contains plugins added to this processor.

```js
var processor = postcss([cssnext, cssgrace]);
processor.plugins.length //=> 2
```

### `processor.version`

Contains the current version of PostCSS.

```js
postcss().version //=> '4.0.5'
```

## `LazyResult` class

A promise proxy for the result of PostCSS transformations.

A `LazyResult` instance is returned by [`Processor#process(css, opts)`].

```js
var lazy = postcss([cssnext]).process(css);
```

### `lazy.then(onFulfilled, onRejected)`

Processes input CSS through synchronous and asynchronous plugins
and calls `onFulfilled` with a [`Result`] instance. If a plugin throws
an error, the `onRejected` callback will be executed.

```js
postcss([cssnext]).process(css).then(function(result) {
    console.log(result.css);
});
```

This method is a standard [Promise] method.

### `lazy.catch(onRejected)`

Processes input CSS through synchronous and asynchronous plugins
and calls `onRejected` for each error thrown in any plugin.

```js
postcss([cssnext]).process(css).then(function(result) {
    console.log(result.css);
}).catch(function (error) {
    console.error(error);
});
```

This method is a standard [Promise] method.

### `lazy.toString()`

Alias for the `LazyResult#css` property.

### `lazy.css`

Processes input CSS through synchronous plugins, converts `Root` to a CSS
string and returns [`Result#css`].

```js
processor.process(css).css;
```

This property will only work with synchronous plugins. If the processor
contains any asynchronous plugins it will throw an error. In this case,
you should use [`LazyResult#then()`] instead.

```js
postcss([cssnext]).then(function (result) {
    console.log(result.css);
});
```

### `lazy.content`

An alias for the `css` property. Use it with syntaxes that generate non-CSS
output.

```js
lazy.css === lazy.content;
```

### `lazy.map`

Processes input CSS through synchronous plugins and returns [`Result#map`].

```js
if ( result.map ) {
    fs.writeFileSync(result.opts.to + '.map', result.map.toString());
}
```

This property will only work with synchronous plugins. If the processor
contains any asynchronous plugins it will throw an error. In this case,
you should use [`LazyResult#then()`] instead.

```js
postcss([cssnext]).then(function (result) {
    if ( result.map ) {
        fs.writeFileSync(result.opts.to + '.map', result.map.toString());
    }
});
```

### `lazy.root`

Processes input CSS through synchronous plugins and returns
[`Result#root`](#resultroot).

This property will only work with synchronous plugins. If the processor
contains any asynchronous plugins it will throw an error. In this case,
you should use [`LazyResult#then()`] instead.

```js
postcss([cssnext]).then(function (result) {
    console.log(result.root);
});
```

### `lazy.warnings()`

Processes input CSS through synchronous plugins and calls [`Result#warnings()`].

```js
postcss([cssnext]).warnings().forEach(function (message) {
    console.warn(message.text);
});
```

This property will only work with synchronous plugins. If the processor
contains any asynchronous plugins it will throw an error. In this case,
you should use [`LazyResult#then()`] instead.

```js
postcss([cssnext]).then(function (result) {
    result.warnings().forEach(function (message) {
        console.warn(message.text);
    });
});
```

### `lazy.messages`

Processes input CSS through synchronous plugins and returns [`Result#messages`].

This property will only work with synchronous plugins. If the processor
contains any asynchronous plugins it will throw an error. In this case,
you should use [`LazyResult#then()`] instead.

### `lazy.processor`

Returns a [`Processor`] instance, which will be used for CSS transformations.

```js
var lazy = postcss([cssnext, cssgrace]).process(css);
lazy.processor.plugins.length //=> 2
```

### `lazy.opts`

Options from the [`Processor#process(css, opts)`] call that produced
this `Result` instance.

```js
postcss().process(css, opts).opts == opts;
```

## `Result` class

Provides the result of the PostCSS transformations.

A `Result` instance is returned by [`Root#toResult(opts)`]
or [`LazyResult#then()`] methods.

```js
postcss([cssnext]).process(css).then(function (result1) {
    console.log(result1.css);
});
var result2 = postcss.parse(css).toResult();
```

### `result.toString()`

Alias for [`Result#css`] property.

### `result.warn(text, opts)`

Creates an instance of [`Warning`] and adds it to [`Result#messages`].

```js
var plugin = postcss.plugin('postcss-important', function () {
    return function (css, result) {
        css.walkDecls(function (decl) {
            if ( decl.important ) {
                result.warn('Try to avoid !important', { node: decl });
            }
        });
    };
});

postcss([plugin]).process(css).then(function (result) {
    result.warnings() //=> [{
                      //      plugin: 'postcss-important-warning',
                      //      text:   'Try to avoid !important'
                      //      node:  { type: 'decl', … }
                      //   }]
});
```

Arguments:

* `text (string)`: warning message. It will be used in the `text` property of
  the message object.
* `opts (object) optional`: properties to assign to the message object.
  * `node`: CSS node that was the source of the warning.
  * `word (string)`: word inside a node’s string that should be highlighted
    as the source of the warning.
  * `index` (number): index inside a node’s string that should be highlighted
    as the source of the warning.
  * `plugin`: name of the plugin that created this warning. `Result#warn()` will
    automatically fill it with the `plugin.postcssPlugin` value.

### `result.warnings()`

Returns warnings from plugins. Filters [`Warning`] instances
from [Result#messages].

```js
result.warnings().forEach(function (message) {
    console.log(message.toString());
});
```

### `result.css`

A CSS string representing this `Result`’s '`Root` instance.

```js
postcss.parse('a{}').toResult().css //=> "a{}"
```

### `result.content`

An alias for the `css` property. Use it with syntaxes that generate non-CSS
output.

```js
result.css === result.content;
```

### `result.map`

An instance of the `SourceMapGenerator` class from the [`source-map`] library,
representing changes to the `Result`’s `Root` instance.

```js
result.map.toJSON() //=> { version: 3, file: 'a.css', sources: ['a.css'], … }
```

This property will have a value *only if the user does not want an inline source
map*. By default, PostCSS generates inline source maps, written directly into
the processed CSS. The `map` property will be empty by default.

An external source map will be generated — and assigned to `map` —
only if the user has set the `map.inline` option to `false`, or if PostCSS
was passed an external input source map.

```js
if ( result.map ) {
    fs.writeFileSync(result.opts.to + '.map', result.map.toString());
}
```

### `result.root`

Contains the [`Root` node] after all transformations.

```js
root.toResult().root == root;
```

### `result.messages`

Contains messages from plugins (e.g., warnings or custom messages).

Each message should have `type` and `plugin` properties.

```js
postcss.plugin('postcss-min-browser', function () {
    return function (css, result) {
        var browsers = detectMinBrowsersByCanIUse(css);
        result.messages.push({
            type:    'min-browser',
            plugin:  'postcss-min-browser',
            browsers: browsers
        });
    };
});
```

Add a warning using [`Result#warn()`] and get all warnings
using the [`Result#warnings()`](#resultwarnings) method.

### `result.processor`

Returns the [`Processor`] instance used for this transformation.

```js
result.processor.plugins.forEach(function (plugin) {
    if ( plugin.postcssPlugin == 'postcss-bad' ) {
        throw 'postcss-good is incompatible with postcss-bad';
    }
});
```

### `result.opts`

Options from the [`Processor#process(css, opts)`] or [`Root#toResult(opts)`]
call that produced this `Result` instance.

```js
root.toResult(opts).opts == opts;
```

## `Warning` class

Represents a plugin warning. It can be created using [`Node#warn()`].

```js
if ( decl.important ) {
    decl.warn(result, 'Try to avoid !important');
}
```

### `warning.toString()`

Returns a string with the error position and message.

```js
warning.toString() //=> 'postcss-important:a.css:10:4: Try to avoid !important'
```

### `warning.text`

Contains the warning message.

```js
warning.text //=> 'Try to avoid !important'
```

### `warning.plugin`

Contains the name of the plugin that created this warning. When you call
[`Node#warn()`] it will fill this property automatically.

```js
warning.plugin //=> 'postcss-important'
```

### `warning.node`

Contains the CSS node that caused the warning.

```js
warning.node.toString() //=> 'color: white !important'
```

### `warning.line`

The line in the input file with this warning’s source.

```js
warning.line //=> 5
```

### `warning.column`

Column in the input file with this warning’s source.

```js
warning.column //=> 4
```

## `CssSyntaxError` class

The CSS parser throws this error for broken CSS.

```js
postcss.parse('a{') //=> CssSyntaxError
```

Custom parsers can throw this error for broken custom syntax
using the [`Node#error()`](#nodeerrormessage) method.

```js
throw node.error('Unknown variable', { plugin: 'postcss-vars' });
```

### `error.toString()`

Returns a string with the error position, message and source code of the
broken part.

```js
error.toString() //=> CssSyntaxError: app.css:1:1: Unclosed block
                 //   a {
                 //   ^
```

### `error.showSourceCode(color)`

Returns a few lines of CSS source that caused the error.

```js
error.showSourceCode() //=>
                       //   a {
                       //     bad
                       //     ^
                       //   }
```

Arguments:

* `color (boolean) optional`: whether arrow will be colored red by terminal
  color codes. By default, PostCSS will use `process.stdout.isTTY` and
  `process.env.NODE_DISABLE_COLORS`.

If the CSS has an input source map without `sourceContent`, this method will
return an empty string.

### `error.message`

Contains full error text in the GNU error format.

```js
error.message //=> 'a.css:1:1: Unclosed block'
```

### `error.reason`

Contains only the error description.

```js
error.reason //=> 'Unclosed block'
```

### `error.plugin`

Contains the PostCSS plugin name if the error didn’t come from the CSS parser.

```js
error.plugin //=> 'postcss-vars'
```

PostCSS will fill it automatically.

### `error.file`

Contains the absolute path to the broken file. If you use it, send the `from`
option to the parser.

```js
error.file //=> 'a.sass'
```

PostCSS will use the input source map to detect the original error location.
If you wrote a Sass file, compiled it to CSS and then parsed it with PostCSS,
PostCSS will show the original position in the Sass file.

If you need the position in the PostCSS input (e.g., to debug the previous
compiler), use `error.input.file`.

```js
error.file       //=> 'a.sass'
error.input.file //=> 'a.css'
```

### `error.line`

Contains the source line of the error.

```js
error.line //=> 2
```

PostCSS will use the input source map to detect the original error location.
If you wrote a Sass file, compiled it to CSS and then parsed it with PostCSS,
PostCSS will show the original position in the Sass file.

If you need the position in the PostCSS input (e.g., to debug the previous
compiler), use `error.input.file`.

```js
error.line       //=> 2
error.input.line //=> 4
```

### `error.column`

Contains the source column of the error.

```js
error.column //=> 1
```

PostCSS will use the input source map to detect the original error location.
If you wrote a Sass file, compiled it to CSS and then parsed it with PostCSS,
PostCSS will show the original position in the Sass file.

If you need the position in the PostCSS input (e.g., to debug the previous
compiler), use `error.input.file`.

```js
error.column       //=> 1
error.input.column //=> 4
```

### `error.source`

Contains the source code of the broken file.

```js
error.source //=> 'a {} b {'
```

PostCSS will use the input source map to detect the original error location.
If you wrote a Sass file, compiled it to CSS and then parsed it with PostCSS,
PostCSS will show the original position in the Sass file.

If you need the position in the PostCSS input (e.g., to debug the previous
compiler), use `error.input.file`.

```js
error.source       //=> 'a { b {} }'
error.input.column //=> 'a b { }'
```

## Vendor module

Contains helpers for working with vendor prefixes.

```js
var vendor = postcss.vendor;
```

### `vendor.prefix(string)`

Returns the vendor prefix extracted from an input string.

```js
postcss.vendor.prefix('-moz-tab-size') //=> '-moz-'
```

### `vendor.unprefixed(string)`

Returns the input string stripped of its vendor prefix.

```js
postcss.vendor.unprefixed('-moz-tab-size') //=> 'tab-size'
```

## List module

Contains helpers for safely splitting lists of CSS values,
preserving parentheses and quotes.

```js
var list = postcss.list;
```

### `list.space(string)`

Safely splits space-separated values (such as those for `background`,
`border-radius`, and other shorthand properties).

```js
postcss.list.space('1px calc(10% + 1px)') //=> ['1px', 'calc(10% + 1px)']
```

### `list.comma(string)`

Safely splits comma-separated values (such as those
for `transition-*` and `background` properties).

```js
postcss.list.comma('black, linear-gradient(white, black)')
//=> ['black', 'linear-gradient(white, black)']
```

## `Input` class

Represents the source CSS.

```js
var root  = postcss.parse(css, { from: file });
var input = root.source.input;
```

### `input.file`

The absolute path to the CSS source file defined with the [`from` option].

```js
var root  = postcss.parse(css, { from: 'a.css' });
root.source.input.file //=> '/home/ai/a.css'
```

### `input.id`

The unique ID of the CSS source. Used if `from`
option is not provided (because PostCSS does not know the file path).

```js
var root  = postcss.parse(css);
root.source.input.file //=> undefined
root.source.input.id   //=> <input css 1>
```

### `input.from`

The CSS source identifier. Contains [`input.file`](#inputfile) if the user set
the [`from` option], or [`input.id`](#inputid) if they did not.

```js
var root  = postcss.parse(css, { from: 'a.css' });
root.source.input.from //=> '/home/ai/a.css'

var root  = postcss.parse(css);
root.source.input.from //=> <input css 1>
```

### `input.map`

Represents the input source map passed from a compilation step before PostCSS
(e.g., from the Sass compiler).

`map.consumer()` returns an instance of the `SourceMapConsumer` class
from the [`source-map`] library.

```js
root.source.input.map.consumer().sources //=> ['a.sass']
```

### `input.origin(line, column)`

Reads the input source map and returns a symbol position in the input source
(e.g., in a Sass file that was compiled to CSS before being passed
to PostCSS):

```js
root.source.input.origin(1, 1) //=> { source: 'a.css', line: 3, column: 1 }
```

## Nodes: common methods

All node classes inherit the following common methods.

### `node.type`

Returns a string representing the node’s type.

Possible values are `root`, `atrule`, `rule`, `decl`, or `comment`.

```js
postcss.decl({ prop: 'color', value: 'black' }).type //=> 'decl'
```

### `node.parent`

Returns the node’s parent node.

```js
root.nodes[0].parent == root;
```

### `node.source`

Returns the input source of the node, with the following properties:

- `node.source.input`: An [`Input`] instance.
- `node.source.start`: The starting position of the node’s source —
  line and column.
- `node.source.end`: The ending position of the node’s source — line and column.

```js
decl.source.input.from //=> '/home/ai/a.sass'
decl.source.start      //=> { line: 10, column: 2 }
decl.source.end        //=> { line: 10, column: 12 }
```

The property is used in source map generation.

If you create a node manually (e.g., with `postcss.decl()`),
that node will not have a `source` property and will be absent
from the source map. For this reason, the plugin developer should consider
cloning nodes to create new ones (in which case the new node’s source
will reference the original, cloned node) or setting the `source` property
manually.

```js
// Bad
var prefixed = postcss.decl({ prop: '-moz-' + decl.prop, value: decl.value });

// Good
var prefixed = decl.clone({ prop: '-moz-' + decl.prop });
```

```js
if ( atrule.name == 'add-link' ) {
    var rule = postcss.rule({ selector: 'a' }); // Rule has no source
    atrule.parent.insertBefore(atrule, rule);   // We add it because of atrule
    rule.source = atrule.source;                // So we copy source from atrule
}
```

### `node.raws`

Contains information to generate byte-to-byte equal node string
as it was in the origin input.

Every parser saves its own properties, but the default CSS parser uses:

* `before`: the space symbols before the node. It also stores any non-standard
  symbols before the declaration, like `_` from an IE hack.
* `after`: the space symbols after the last child of the node to the end of the
  node.
* `between`: the symbols between the property and value for declarations,
  selector and `{` for rules, or last parameter and `{` for at-rules.
* `semicolon`: contains `true` if the last child has an (optional) semicolon.
* `afterName`: the space between the at-rule’s name and its parameters.
* `left`: the space symbols between `/*` and the comment’s text.
* `right`: the space symbols between the comment’s text and `*/`.
* `important`: the content of the important statement,
  if it is not just `!important`.

PostCSS cleans selectors, declaration values and at-rule parameters
from comments and extra spaces, but it stores origin content
in `raws` properties. As such, if you don’t change a declaration’s value,
PostCSS will use the raw value with comments.

### `node.toString()`

Returns a CSS string representing the node.

```js
postcss.rule({ selector: 'a' }).toString() //=> 'a {}''
```

Arguments:

* `stringifier (functions|object) optional`: a syntax to use
  in string generation.

### `node.error(message, opts)`

Returns a [`CssSyntaxError`] instance containing the original position
of the node in the source, showing line and column numbers and also
a small excerpt to facilitate debugging.

If present, an input source map will be used to get the original position
of the source, even from a previous compilation step
(e.g., from Sass compilation).

This method produces very useful error messages.

```js
if ( !variables[name] ) {
    throw decl.error('Unknown variable ' + name, { word: name });
    // CssSyntaxError: postcss-vars:a.sass:4:3: Unknown variable $black
    // a
    //   color: $black
    //          ^
    //   background: white
}
```

Arguments:

* `message (string)`: error description.
* `opts (object) optional`: options.
  * `plugin (string)`: plugin name that created this error.
    PostCSS will set it automatically.
  * `word (string)`: a word inside a node’s string that should be highlighted
    as the source of the error.
  * `index` (number): an index inside a node’s string that should be highlighted
    as the source of the error.

### `node.warn(result, message)`

This method is provided as a convenience wrapper for [`Result#warn()`].

```js
var plugin = postcss.plugin('postcss-deprecated', function () {
    return function (css, result) {
        css.walkDecls('bad', function (decl) {
            decl.warn(result, 'Deprecated property bad');
        });
    };
});
```

Arguments:

* `result`: The [`Result`] instance that will receive the warning.
* `message (string)`: error description.

### `node.next()` and `node.prev()`

Returns the next/previous child of the node’s parent.
Returns `undefined` if the current node is the last/first child.

```js
var annotation = decl.prev();
if ( annotation.type == 'comment' ) {
    readAnnotation( annotation.text );
}
```

### `node.root()`

Returns the `Root` instance of the node’s tree.

```js
root.nodes[0].nodes[0].root() == root
```

### `node.remove()`

Removes the node from its parent and cleans the `parent` properties from the
node and its children.

```js
if ( decl.prop.match(/^-webkit-/) ) {
    decl.remove();
}
```

### `node.replaceWith(...otherNodes)`

Inserts node(s) before the current node and removes the current node.

```js
if ( atrule.name == 'mixin' ) {
    atrule.replaceWith(mixinRules[atrule.params]);
}
```

### `node.clone(props)`

Returns a clone of the node.

The resulting cloned node and its (cloned) children will have a clean `parent`
and code style properties.

```js
var cloned = decl.clone({ prop: '-moz-' + decl.prop });
cloned.raws.before  //=> undefined
cloned.parent       //=> undefined
cloned.toString()   //=> -moz-transform: scale(0)
```

Arguments:

* `props (object) optional`: new properties to override in the clone.

### `node.cloneBefore(props)` and `node.cloneAfter(props)`

Shortcut to clone the node and insert the resulting cloned node before/after
the current node.

```js
decl.cloneBefore({ prop: '-moz-' + decl.prop });
```

Arguments:

* `props (object) optional`: new properties to override in the clone.

### `node.moveTo(newParent)`

Removes the node from its current parent and inserts it
at the end of `newParent`.

This will clean the `before` and `after` code style properties from the node
and replace them with the indentation style of `newParent`. It will also clean
the `between` property if `newParent` is in another `Root`.

```js
atrule.moveTo(atrule.parent.parent);
```

Arguments:

* `newParent: (Container)`: container node where the current node will be moved.

### `node.moveBefore(otherNode)` and `node.moveAfter(otherNode)`

Removes the node from its current parent and inserts it into a new parent
before/after `otherNode`.

This will also clean the node’s code style properties just as it would in
`node.moveTo(newParent)`.

Arguments:

* `otherNode (Node)`: node that will be after/before current node after moving.

### `node.raw(prop, defaultType)`

Returns a code style property value. If the node is missing the code style
property (because the node was manually built or cloned), PostCSS will try
to autodetect the code style property by looking at other nodes in the tree.

```js
var root = postcss.parse('a { background: white }');
root.nodes[0].append({ prop: 'color', value: 'black' });
root.nodes[0].nodes[1].raws.before //=> ' '
```

Arguments:

* `prop (string)`: name or code style property.
* `defaultType (string)`: name of default value. It can be easily missed
  if the value is the same as `prop`.

## Containers: common methods

The `Root`, `AtRule`, and `Rule` container nodes inherit some common methods
to help work with their children.

Note that all containers can store *any* content. If you write a rule inside
a rule, PostCSS will parse it.

### `container.nodes`

An array containing the container’s children.

```js
var root = postcss.parse('a { color: black }');
root.nodes.length           //=> 1
root.nodes[0].selector      //=> 'a'
root.nodes[0].nodes[0].prop //=> 'color'
```

### `container.first`

The container’s first child.

```js
rule.first == rules.nodes[0];
```

### `container.last`

The container’s last child.

```js
rule.last == rule.nodes[rule.nodes.length - 1];
```

### `container.index(child)`

Returns a `child`’s index within the container’s `nodes` array.

```js
rule.index( rule.nodes[2] ) //=> 2
```

Arguments:

* `child (Node)`: child of the current container.

### `container.every(callback)`

Returns `true` if `callback` returns true for all of the container’s children.

```js
var noPrefixes = rule.every(function (decl) {
    return decl.prop[0] != '-';
});
```

Arguments:

* `callback (function)`: iterator. Returns true or false.

### `container.some(callback)`

Returns `true` if `callback` returns true for (at least) one
of the container’s children.

```js
var hasPrefix = rule.some(function (decl) {
    return decl.prop[0] == '-';
});
```

Arguments:

* `callback (function)`: iterator. Returns true or false.

### `container.each(callback)`

Iterates through the container’s immediate children, calling `callback`
for each child.

Returning `false` in the `callback` will break iteration.

```js
var color;
rule.each(function (decl) {
    if ( decl.prop == 'color' ) {
        color = decl.value;
        return false;
    }
});
```

Arguments:

* `callback (function)`: iterator. Receives each node and its index.

Unlike the `for {}`-cycle or `Array#forEach()` this iterator is safe
if you are mutating the array of child nodes during iteration.
PostCSS will adjust the current index to match the mutations.

```js
var root = postcss.parse('a { color: black; z-index: 1 }');
var rule = root.first;

for ( var i = 0; i < rule.nodes.length; i++ ) {
    var decl = rule.nodes[i];
    decl.cloneBefore({ prop: '-webkit-' + decl.prop });
    // Cycle will be infinite, because cloneBefore moves the current node
    // to the next index
}

rule.each(function (decl) {
    decl.cloneBefore({ prop: '-webkit-' + decl.prop });
    // Will be executed only for color and z-index
});
```

`container.each()` only iterates through the container’s immediate children.
If you need to recursively iterate through all the container’s descendant nodes,
use `container.walk()`.

### `container.walk(callback)`

Traverses the container’s descendant nodes, calling `callback` for each node.

```js
root.walk(function (node) {
    // Traverses all descendant nodes.
});
```

Arguments:

* `callback (function)`: iterator. Receives each node and its index.

Like `container.each()`, this method is safe to use
if you are mutating arrays during iteration.

If you only need to iterate through the container’s immediate children,
use `container.each()`.

### `container.walkDecls([propFilter,] callback)`

Traverses the container’s descendant nodes, calling `callback` for each
declaration node.

```js
root.walkDecls(function (decl) {
    if ( decl.prop.match(/^-webkit-/) ) {
        decl.remove();
    }
});
```

Arguments:

* `propFilter: (string|RegExp) optional`: string or regular expression
  to filter declarations by property name.
  * `callback (function)`: iterator. Receives each declaration node and its
  index.

If you pass a `propFilter`, iteration will only happen over declarations with
matching properties.

```js
// Make a flat design
root.walkDecls('border-radius', function (decl) {
    decl.remove();
});
root.walkDecls(/^background/, function (decl) {
    decl.value = takeFirstColorFromGradient(decl.value);
});
```

Like `container.each()`, this method is safe to use if you are mutating
arrays during iteration.

### `container.walkAtRules([nameFilter,] callback)`

Traverses the container’s descendant nodes, calling `callback` for each
at-rule node.

```js
root.walkAtRules(function (rule) {
    if ( rule.name.match(/^-webkit-/) ) rule.remove();
});
```

Arguments:

* `nameFilter: (string|RegExp) optional`: string or regular expression to filter
  at-rules by name.
  * `callback (function)`: iterator. Receives each at-rule and its index.

If you pass a `filter`, iteration will only happen over at-rules that have
matching names.

```js
var first = false;
root.walkAtRules('charset', function (rule) {
    if ( !first ) {
        first = true;
    } else {
        rule.remove();
    }
});
```

Like `container.each()`, this method is safe to use if you are mutating arrays
during iteration.

### `container.walkRules([selectorFilter,] callback)`

Traverses the container’s descendant nodes, calling `callback` for each
rule node.

```js
var selectors = [];
root.walkRules(function (rule) {
    selectors.push(rule.selector);
});
console.log('Your CSS uses ' + selectors.length + ' selectors');
```

Arguments:

* `selectorFilter: (string|RegExp) optional`: string or regular expression
  to filter rules by selector.
* `callback (function)`: iterator. Receives each rule node and its index.

If you pass a `selectorFilter`, iteration will only happen over rules with
matching selectors.

Like `container.each()`, this method is safe to use if you are mutating arrays
during iteration.

### `container.walkComments(callback)`

Traverses the container’s descendant nodes, calling `callback` for each
comment node.

```js
root.walkComments(function (comment) {
    comment.remove();
});
```

Arguments:

* `callback (function)`: iterator. Receives each comment node and its index.

Like `container.each()`, this method is safe to use if you are mutating arrays
during iteration.

### `container.replaceValues(pattern, opts, callback)`

Passes all declaration values within the container that match `pattern` through
`callback`, replacing those values with the returned result of `callback`.

This method is useful if you are using a custom unit or function and need
to iterate through all values.

```js
root.replaceValues(/\d+rem/, { fast: 'rem' }, function (string) {
    return 15 * parseInt(string) + 'px';
});
```

Arguments:

* `pattern (string|RegExp)`: replace pattern.
* `opts (object) optional`: options to speed up the search:
  * `props`: An array of property names. The method will only search for values
    that match `regexp` within declarations of listed properties.
  * `fast`: A string that’s used to narrow down values and speed up
    the regexp search. Searching every single value with a regexp can be slow.
    If you pass a `fast` string, PostCSS will first check whether the value
    contains the `fast` string; and only if it does will PostCSS check that
    value against `regexp`. For example, instead of just checking for `/\d+rem/`
    on all values, set `fast: 'rem'` to first check whether a value has
    the `rem` unit, and only if it does perform the regexp check.
* `callback (function|string)`: string to replace `pattern` or callback that
  returns a new value. The callback will receive the same arguments as those
  passed to a function parameter of [`String#replace`].

[`String#replace`]: (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter)

### `container.prepend(...nodes)` and `container.append(...nodes)`

Inserts new nodes to the start/end of the container.

```js
var decl = postcss.decl({ prop: 'color', value: 'black' });
rule.append(decl);
```

```js
var decl1 = postcss.decl({ prop: 'color', value: 'black' });
var decl2 = postcss.decl({ prop: 'background-color', value: 'white' });
rule.prepend(decl1, decl2);
```

Arguments:

* `node (Node|object|string)`: new node.

Because each node class is identifiable by unique properties, use
the following shortcuts to create nodes in insert methods:

```js
root.append({ name: '@charset', params: '"UTF-8"' }); // at-rule
root.append({ selector: 'a' });                       // rule
rule.append({ prop: 'color', value: 'black' });       // declaration
rule.append({ text: 'Comment' })                      // comment
```

A string containing the CSS of the new element can also be used.
This approach is slower than the above shortcuts.

```js
root.append('a {}');
root.first.append('color: black; z-index: 1');
```

### `container.insertBefore(oldNode, newNew)` and `container.insertAfter(oldNode, newNew)`

Insert `newNode` before/after `oldNode` within the container.

```js
rule.insertBefore(decl, decl.clone({ prop: '-webkit-' + decl.prop }));
```

Arguments:

* `oldNode (Node|number)`: child or child’s index.
* `node (Node|object|string)`: new node.

### `container.removeChild(node)`

Removes `node` from the container and cleans the `parent` properties from the
node and its children.

```js
rule.nodes.length  //=> 5
rule.removeChild(decl);
rule.nodes.length  //=> 4
decl.parent        //=> undefined
```

Arguments:

* `node (Node|number)`: child or child’s index.

### `container.removeAll()`

Removes all children from the container and cleans their `parent` properties.

```js
rule.removeAll();
rule.nodes.length //=> 0
```

## `Root` node

Represents a CSS file and contains all its parsed nodes.

```js
var root = postcss.parse('a{color:black} b{z-index:2}');
root.type         //=> 'root'
root.nodes.length //=> 2
```

### `root.toResult(opts)`

Returns a [`Result`] instance representing the root’s CSS.

```js
var root1 = postcss.parse(css1, { from: 'a.css' });
var root2 = postcss.parse(css2, { from: 'b.css' });

root1.append(root2);
var result = root1.toResult({ to: 'all.css', map: true });
```

Arguments:

* `opts (object) optional`: options:
  * `to`: the path where you’ll put the output CSS file. You should always set
    `to` to generate correct source maps.
  * `map`: an object of [source map options].

## `AtRule` node

Represents an at-rule.

If it’s followed in the CSS by a `{}` block, this node will have a `nodes`
property representing its children.


```js
var root = postcss.parse('@charset "UTF-8"; @media print {}');

var charset = root.first;
charset.type  //=> 'atrule'
charset.nodes //=> undefined

var media = root.last;
media.nodes   //=> []
```

### `atrule.name`

The at-rule’s name. This is the identifier that immediately follows the `@`.

```js
var root  = postcss.parse('@media print {}');
var media = root.first;
media.name //=> 'media'
```

### `atrule.params`

The at-rule’s parameters. These are the values that follow the at-rule’s name
but precede any `{}` block. The spec refers to this area
as the at-rule’s “prelude”.

```js
var root  = postcss.parse('@media print, screen {}');
var media = root.first;
media.params //=> '[print, screen]'
```

## `Rule` node

Represents a CSS rule: a selector followed by a declaration block.

```js
var root = postcss.parse('a{}');
var rule = root.first;
rule.type       //=> 'rule'
rule.toString() //=> 'a{}'
```

### `rule.selector`

The rule’s full selector represented as a string. If there are multiple
comma-separated selectors, the entire group will be included.

```js
var root = postcss.parse('a, b { }');
var rule = root.first;
rule.selector //=> 'a, b'
```

### `rule.selectors`

An array containing the rule’s individual selectors.
Groups of selectors are split at commas.

```js
var root = postcss.parse('a, b { }');
var rule = root.first;

rule.selector  //=> 'a, b'
rule.selectors //=> ['a', 'b']

rule.selectors = ['a', 'strong'];
rule.selector //=> 'a, strong'
```

## `Declaration` node

Represents a CSS declaration.

```js
var root = postcss.parse('a { color: black }');
var decl = root.first.first;
decl.type       //=> 'decl'
decl.toString() //=> ' color: black'
```

### `declaration.prop`

The declaration’s property name.

```js
var root = postcss.parse('a { color: black }');
var decl = root.first.first;
decl.prop //=> 'color'
```

### `declaration.value`

The declaration’s value.

```js
var root = postcss.parse('a { color: black }');
var decl = root.first.first;
decl.value //=> 'black'
```

### `declaration.important`

`true` if the declaration has an `!important` annotation.

```js
var root = postcss.parse('a { color: black !important; color: white }');
root.first.first.important //=> true
root.first.last.important  //=> undefined
```

## `Comment` node

Represents a comment between declarations or statements (rule and at-rules).
Comments inside selectors, at-rule parameters, or declaration values
will be stored in the [`Node#raws`] properties explained above.

```js
var root    = postcss.parse('a { color: /* inner */ black; /* outer */ }');
var decl    = root.first.first;
var comment = root.first.last;

comment.type //=> 'comment'
decl.between //=> ': /* inner */'
```

### `comment.text`

The comment’s text.

```js
var root    = postcss.parse('/* Empty file */');
var comment = root.first;
var comment.text //=> 'Empty file'
```

[`source-map`]: https://github.com/mozilla/source-map
[Promise]:      http://www.html5rocks.com/en/tutorials/es6/promises/

[source map options]: https://github.com/postcss/postcss#source-map

[`Processor#process(css, opts)`]: #processorprocesscss-opts
[`Root#toResult(opts)`]:          #roottoresult-opts
[`LazyResult#then()`]:            #lazythenonfulfilled-onrejected
[`postcss(plugins)`]:             #postcssplugins
[`postcss.plugin()`]:             #postcsspluginname-initializer
[`Declaration` node]:             #declaration-node
[`Result#messages`]:              #resultmessages
[`CssSyntaxError`]:               #csssyntaxerror-class
[`Processor#use`]:                #processoruseplugin
[`Result#warn()`]:                #resultwarn
[`Node#warn()`]:                  #nodewarnmessage-result
[`Comment` node]:                 #comment-node
[`AtRule` node]:                  #atrule-node
[`from` option]:                  #processorprocesscss-opts
[`LazyResult`]:                   #lazyresult-class
[`Result#map`]:                   #resultmap
[`Result#css`]:                   #resultcss
[`Root` node]:                    #root-node
[`Rule` node]:                    #rule-node
[`Processor`]:                    #processor-class
[`Node#raws`]:                    #node-raws
[`Warning`]:                      #warning-class
[`Result`]:                       #result-class
[`Input`]:                        #inputclass
