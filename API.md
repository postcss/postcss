# PostCSS API

* [`postcss` function](#postcss-function)
* [`Processor` class](#processor-class)
* [`LazyResult` class](#lazy-result-class)
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

### `postcss(plugins)`

Returns a new [`Processor`] instance that will apply `plugins`
as CSS processors.

```js
postcss([autoprefixer, cssnext, cssgrace]).process(css).css;
```

Arguments:

* `plugins (array)`: PostCSS plugins list to set them to new processor.

You can also set plugins with the [`Processor#use`] method.
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
  * `safe`: enable [Safe Mode], in which PostCSS will try
    to fix CSS syntax errors.
  * `map`: an object of [source map options].
    Only `map.prev` is used in `parse`.

### `postcss.plugin(name, initializer)`

Creates PostCSS plugin with standard API.

```js
var remove = postcss.plugin('postcss-remove', function (opts) {
    var filter = opts.prop || 'z-index';
    return function (css, processor) {
        css.eachDecl(filter, function (decl) {
            decl.removeSelf();
        });
    };
});

postcss().use(remove)                    // with default options
postcss().use(remove({ prop: 'color' })) // with options
```

Arguments:

* `name (string)`: PostCSS plugin name. Same as in `name` property
  in `package.json`. It will be saved in `plugin.postcssPlugin` property.
* `initializer  (function)`: will receive plugin options and should return
  functions to modify nodes in input CSS.

Also wrap will save plugin name and plugin PostCSS version:

```js
var processor = postcss([replace]);
processor.plugins[0].postcssPlugin  //=> 'postcss-replace'
processor.plugins[0].postcssVersion //=> '4.1.0'
```

Plugin function receive 2 arguments: [`Root` node] and [`Result`] instance.
Then it should mutate the passed `Root` node, or you can create new `Root` node
and put it to `result.root` property.

```js
postcss.plugin('postcss-cleaner', function () {
    return function (css, result) {
        result.root = postcss.root();
    };
});
```

Asynchronous plugin should return `Promise` instance.

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

You can add warnings by [`Result#warn()`] method.

```js
postcss.plugin('postcss-caniuse-test', function () {
    return function (css, result) {
        css.eachDecl(function (decl) {
            if ( !caniuse.support(decl.prop) ) {
                result.warn(
                    'Some of browsers does not support ' + decl.prop,
                    { node: decl });
            }
        });
    };
});
```

You can send some data to next plugins by [`Result#messages`] array.

### `postcss.root(props)`

Creates a new [`Root` node].

```js
postcss.root({ after: '\n' }).toString() //=> "\n"
```

Arguments:

* `props (object) optional`: properties for new node.

### `postcss.atRule(props)`

Creates a new [`AtRule` node].

```js
postcss.atRule({ name: 'charset' }).toString() //=> "@charset"
```

Arguments:

* `props (object) optional`: properties for new node.

### `postcss.rule(props)`

Creates a new [`Rule` node].

```js
postcss.rule({ selector: 'a' }).toString() //=> "a {\n}"
```

Arguments:

* `props (object) optional`: properties for new node.

### `postcss.decl(props)`

Creates a new [`Declaration` node].

```js
postcss.decl({ prop: 'color', value: 'black' }).toString() //=> "color: black"
```

Arguments:

* `props (object) optional`: properties for new node.

### `postcss.comment(props)`

Creates a new [`Comment` node].

```js
postcss.comment({ text: 'test' }).toString() //=> "/* test */"
```

Arguments:

* `props (object) optional`: properties for new node.

### `postcss.vendor`

Contains [Vendor module](#vendor-module) module.

```js
postcss.vendor.unprefixed('-moz-tab') //=> ['tab']
```

### `postcss.list`

Contains [List module](#list-module) module.

```js
postcss.list.space('5px calc(10% + 5px)') //=> ['5px', 'calc(10% + 5px)']
```

## `Processor` class

A `Processor` instance contains plugins to process CSS. You can create
one `Processor` instance, initialize its plugins, and then use that instance
on many CSS files.

```js
var processor = postcss([autoprefixer, cssnext, cssgrace]);
processor.process(css1).css;
processor.process(css2).css;
```

### `processor.use(plugin)`

Adds a plugin to be used as a CSS processor.

```js
var processor = postcss();
processor.use(autoprefixer).use(cssnext).use(cssgrace);
```

Arguments:

* `plugin (function|#postcss|Processor)`: PostCSS plugin. I can be in three
  formats:
  * A plugin created by [`postcss.plugin()`] method.
  * A function. PostCSS will pass the function a [`Root` node]
    as the first argument and current [`Result`] instance as second.
  * An object with a `postcss` method. PostCSS will use that method
    as described in #2.
  * Another `Processor` instance. PostCSS will copy plugins
    from that instance to this one.

Plugins can also be added by passing them as arguments when creating
a `postcss` instance (see [`postcss(plugins)`]).

Asynchronous plugin should return `Promise` instance.

### `processor.process(css, opts)`

Parses source CSS and returns [`LazyResult`] instance. Because some plugins can
be asynchronous it doesn’t make any transformations. Transformations will
be apply in `LazyResult`’s methods.

```js
processor.process(css, { from: 'a.css', to: 'a.out.css' }).then(function (result) {
    console.log(result.css);
});
```

Arguments:

* `css (string|#toString|Result)`: String with input CSS or any object
  with `toString()` method, like file stream. Also you can send [`Result`]
  instance and processor will take already parser [`Root`] from it.
* `ops (object) optional`: options:
  * `from`: the path of the CSS source file. You should always set `from`,
    because it is used in source map generation and syntax error messages.
  * `to`: the path where you’ll put the output CSS file. You should always set
    `to` to generate correct source maps.
  * `safe`: enable [Safe Mode], in which PostCSS will try
    to fix CSS syntax errors.
  * `map`: an object of [source map options].

### `processor.plugins`

Contains plugins added to this processor.

```js
var processor = postcss([cssnext, cssgrace]);
processor.plugins.length //=> 2
```

### `processor.version`

Contains current version of PostCSS.

```js
postcss().version //=> '4.0.5'
```

## `LazyResult` class

Promise proxy for result of PostCSS transformations.

A `LazyResult` instance is returned by [`Processor#process(css, opts)`].

```js
var lazy = postcss([cssnext]).process(css);
```

### `lazy.then(onFulfilled, onRejected)`

Processes input CSS through synchronous and asynchronous plugins
and call `onFulfilled` with [`Result`] instance. If some plugin will throw
a error, `onRejected` callback will be executed.

```js
postcss([cssnext]).process(css).then(function(result) {
    console.log(result.css);
});
```

This method is a standard [Promise] method.

### `lazy.catch(onRejected)`

Processes input CSS through synchronous and  asynchronous plugins
and call `onRejected` on errors from any plugin.

```js
postcss([cssnext]).process(css).then(function(result) {
    console.log(result.css);
}).catch(function (error) {
    console.error(error);
});
```

This method is a standard [Promise] method.

### `lazy.toString()`

Alias for `LazyResult#css` property.

### `lazy.css`

Processes input CSS through synchronous plugins, convert `Root` to CSS string
and returns [`Result#css`].

```js
processor.process(css).css;
```

This property will work only with synchronous plugins. If processor contains
any asynchronous plugin it will throw a error. You should use
[`LazyResult#then()`] instead.

```js
postcss([cssnext]).then(function (result) {
    console.log(result.css);
});
```

### `lazy.map`

Processes input CSS through synchronous plugins and returns [`Result#map`].

```js
if ( result.map ) {
    fs.writeFileSync(result.opts.to + '.map', result.map.toString());
}
```

This property will work only with synchronous plugins. If processor contains
any asynchronous plugin it will throw a error. You should use
[`LazyResult#then()`] instead.

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

This property will work only with synchronous plugins. If processor contains
any asynchronous plugin it will throw a error. You should use
[`LazyResult#then()`] instead.

```js
postcss([cssnext]).then(function (result) {
    console.log(result.root);
});
```

### `lazy.warnings()`

Processes input CSS through synchronous plugins and call [`Result#warnings()`].

```js
postcss([cssnext]).warnings().forEach(function (message) {
    console.warn(message.text);
});
```

This property will work only with synchronous plugins. If processor contains
any asynchronous plugin it will throw a error. You should use
[`LazyResult#then()`] instead.

```js
postcss([cssnext]).then(function (result) {
    result.warnings().forEach(function (message) {
        console.warn(message.text);
    });
});
```

### `lazy.messages`

Processes input CSS through synchronous plugins and returns [`Result#messages`].

This property will work only with synchronous plugins. If processor contains
any asynchronous plugin it will throw a error. You should use
[`LazyResult#then()`] instead.

### `lazy.processor`

Returns a [`Processor`] instance, that will be used for CSS transformations.

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

Provides result of PostCSS transformations.

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

Creates [`Warning`] and adds it to [`Result#messages`].

```js
var plugin = postcss.plugin('postcss-important', function () {
    return function (css, result) {
        css.eachDecl(function (decl) {
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

* `text (string)`: warning message. It will be used in `text` property of
  message object.
* `opts (object) optional`: properties to message object.
  * `node`: CSS node, that was a source of warning.
  * `plugin`: name of plugin created this warning. `Result#warn()` will fill it
    automatically by `plugin.postcssPlugin` value.

### `result.warnings()`

Returns warnings from plugins. It just a filters [`Warning`] instances
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

### `result.map`

An instance of the `SourceMapGenerator` class from the [`source-map`] library,
representing changes to the `Result`’s `Root` instance.

```js
result.map.toJSON() //=> { version: 3, file: 'a.css', sources: ['a.css'], … }
```

This property will has a value *only if the user does not want an inline source
map*. By default, PostCSS generates inline source maps, written directly into
the processed CSS; so by default the `map` property will be empty.

An external source map will be generated — and assigned to `map` —
only if the user has set the `map.inline` option to `false`, or if PostCSS
was passed an external input source map.

```js
if ( result.map ) {
    fs.writeFileSync(result.opts.to + '.map', result.map.toString());
}
```

### `result.root`

Contains [`Root` node] after all transformations.

```js
root.toResult().root == root;
```

### `result.messages`

Contains messages from plugins. For example, warnings or custom messages
to plugins communication.

Each message should has `type` and `plugin` properties.

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

You can add warning by [`Result#warn()`] and get all warnings
by [`Result#warnings()`](#resultwarnings) method.

### `result.processor`

Returns a [`Processor`] instance, that was used for this transformations.

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

Warning from plugins. It can be created by [`Result#warn()`].

```js
if ( decl.important ) {
    result.warn('Try to avoid !important', { node: decl });
}
```

### `warning.toString()`

Returns string with error position, message.

```js
warning.toString() //=> 'postcss-important:a.css:10:4: Try to avoid !important'
```

### `warning.text`

Contains warning message.

```js
warning.text //=> 'Try to avoid !important'
```

### `warning.plugin`

Contains plugin name created this warning. When you call [`Result#warn()`],
it will fill this property automatically.

```js
warning.plugin //=> 'postcss-important'
```

### `warning.node`

Contains CSS node, that was a source of warning.

```js
warning.node.toString() //=> 'color: white !important'
```

## `CssSyntaxError` class

CSS parser throw this error on broken CSS.

```js
postcss.parse('a{') //=> CssSyntaxError
```

Custom parsers can throw this error on broken own custom syntax
by [`Node#error()`](#nodeerrormessage) method.

```js
throw node.error('Unknown variable', { plugin: 'postcss-vars' });
```

### `error.toString()`

Returns string with error position, message and source code of broken part.

```js
error.toString() //=> CssSyntaxError: app.css:1:1: Unclosed block
                 //   a {
                 //   ^
```

### `error.showSourceCode(color)`

Returns a few lines of CSS source, which generates this error.

```js
error.showSourceCode() //=>
                       //   a {
                       //     bad
                       //     ^
                       //   }
```

Arguments:

* `color (boolean) optional`: should arrow will be colored to red by terminal
  color codes. By default, PostCSS will use `process.stdout.isTTY` and
  `process.env.NODE_DISABLE_COLORS`.

If CSS has input source map without `sourceContent`, this method will return
empty string.

### `error.message`

Contains full error text by GNU error format.

```js
error.message //=> 'a.css:1:1: Unclosed block'
```

### `error.reason`

Contains only error description.

```js
error.reason //=> 'Unclosed block'
```

### `error.plugin`

Contains PostCSS plugin name if error came not from CSS parser.

```js
error.plugin //=> 'postcss-vars'
```

### `error.file`

Contains absolute path to broken file, if use set `from` option to parser.

```js
error.file //=> 'a.sass'
```

PostCSS will use input source map to detect origin place of error. If you wrote
Sass file, then compile it to CSS and put to PostCSS, PostCSS will show
position in origin Sass file.

If you need position in PostCSS input (for example, to debug previous compiler),
you can use `error.generated.file`.

```js
error.file           //=> 'a.sass'
error.generated.file //=> 'a.css'
```

### `error.line`

Contains source line of error.

```js
error.line //=> 2
```

PostCSS will use input source map to detect origin place of error. If you wrote
Sass file, then compile it to CSS and put to PostCSS, PostCSS will show
position in origin Sass file.

If you need position in PostCSS input (for example, to debug previous compiler),
you can use `error.generated.line`.

```js
error.line           //=> 2
error.generated.line //=> 4
```

### `error.column`

Contains source column of error.

```js
error.column //=> 1
```

PostCSS will use input source map to detect origin place of error. If you wrote
Sass file, then compile it to CSS and put to PostCSS, PostCSS will show
position in origin Sass file.

If you need position in PostCSS input (for example, to debug previous compiler),
you can use `error.generated.column`.

```js
error.column           //=> 1
error.generated.column //=> 4
```

### `error.source`

Contains source code of broken file.

```js
error.source //=> 'a {} b {'
```

PostCSS will use input source map to detect origin place of error. If you wrote
Sass file, then compile it to CSS and put to PostCSS, PostCSS will show
position in origin Sass file.

If you need position in PostCSS input (for example, to debug previous compiler),
you can use `error.generated.source`.

```js
error.source           //=> 'a { b {} }'
error.generated.column //=> 'a b { }'
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

Contains helpers for safely splitting lists of CSS values, preserving parentheses
and quotes.

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

The unique ID of the CSS source. This is used if the user did not enter a `from`
options so PostCSS does not know about a file path.

```js
var root  = postcss.parse(css);
root.source.input.file //=> undefined
root.source.input.id   //=> <input css 1>
```

### `input.from`

The CSS source identifier. Contains [`input.file`](#inputfile) if the user set the
[`from` option], or [`input.id`](#inputid) if she did not.

```js
var root  = postcss.parse(css, { from: 'a.css' });
root.source.input.from //=> '/home/ai/a.css'

var root  = postcss.parse(css);
root.source.input.from //=> <input css 1>
```

### `input.map`

Represents the input source map passed from a compilation step before PostCSS
(for example, from the Sass compiler).

`map.consumer()` returns an instance of the `SourceMapConsumer` class
from the [`source-map`] library.

```js
root.source.input.map.consumer().sources //=> ['a.sass']
```

### `input.origin(line, column)`

Reads the input source map and returns a symbol position in the input source
(for example, in a Sass file that was compiled to CSS before being passed
to PostCSS):

```js
root.source.input.origin(1, 1) //=> { source: 'a.css', line: 3, column: 1 }
```

## Nodes: common methods

All node classes have many common methods.

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

If you create a node manually (for example, with `postcss.decl()`),
that node will not have a `source` property and will be absent
from the source map. For this reason, plugin developer should consider
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

### `node.toString()`

Returns a CSS string representing the node.

```js
postcss.rule({ selector: 'a' }).toString() //=> 'a {}''
```

### `node.error(message, opts)`

Returns a [`CssSyntaxError`] instance that presents the original position
of the node in the source, showing line and column numbers and also
a small excerpt to facilitate debugging.

It will use an input source map, if present, to get the original position
of the source, even from a previous compilation step
(for example, from Sass compilation).

This method produces very useful error messages.

```js
if ( !variables[name] ) {
    throw decl.error('Unknown variable ' + name, { plugin: 'postcss-vars' });
    // CssSyntaxError: postcss-vars:a.sass:4:3: Unknown variable $black
    // a
    //   color: $black
    //   ^
    //   background: white
}
```

Arguments:

* `message (string)`: error description.
* `opts (object) optional`: options.
  * `plugin (string)`: plugin name, that created this error.

See also [`Result#warn()`] for warnings.

### `node.next()` and `node.prev()`

Returns the next/previous child of the node’s parent; or returns `undefined`
if the current node is the last/first child.

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

### `node.removeSelf()`

Removes the node from its parent, and cleans the `parent` property in the node
and its children.

```js
if ( decl.prop.match(/^-webkit-/) ) {
    decl.removeSelf();
}
```

### `node.replaceWith(otherNode)`

Inserts another node before the current node, and removes the current node.

```js
if ( atrule.name == 'mixin' ) {
    atrule.replaceWith(mixinRules[atrule.params]);
}
```

Arguments:

* `otherNode: (Node)`: other node to replace current one.

### `node.clone(props)`

Returns a clones of the node.

The resultant clone node and its (clone) children will have clean `parent`
and code style properties.

```js
var clonded = decl.clone({ prop: '-moz-' + decl.prop });
cloned.before     //=> undefined
cloned.parent     //=> undefined
cloned.toString() //=> -moz-transform: scale(0)
```

Arguments:

* `props (object) optional`: new properties to override them in clone.

### `node.cloneBefore(props)` and `node.cloneAfter(props)`

Shortcuts to clone the node and insert the resultant clone node before/after
the current node.

```js
decl.cloneBefore({ prop: '-moz-' + decl.prop });
```

Arguments:

* `props (object) optional`: new properties to override them in clone.

### `node.moveTo(newParent)`

Removes the node from its current parent and inserts it
at the end of `newParent`.

This will clean the `before` and `after` code style properties from the node,
and replace them with the indentation style of `newParent`. It will also clean
the `between` property if `newParent` is in another `Root`.

```js
atrule.moveTo(atrule.parent.parent);
```

Arguments:

* `newParent: (Container)`: container node where current node will be moved.

### `node.moveBefore(otherNode)` and `node.moveAfter(otherNode)`

Removes the node from its current parent and inserts it into a new parent
before/after `otherNode`.

This will also clean the node’s code style properties just
as `node.moveTo(newParent)` does.

Arguments:

* `otherNode (Node)`: node which will be after/before current node after moving.

### `node.style(prop, defaultType)`

Returns a code style property value. If the node is missing the code style
property (because the node was manually built or cloned), PostCSS will try
to autodetect the code style property by looking at other nodes in the tree.

```js
var root = postcss.parse('a { background: white }');
root.nodes[0].append({ prop: 'color', value: 'black' });
root.nodes[0].nodes[1].style('before') //=> ' '
```

Arguments:

* `prop (string)`: name or code style property.
* `defaultType (string)`: name of default value. You can miss it
  if it is same with `prop`.

## Containers: common methods

The `Root`, `AtRule`, and `Rule` container nodes have some common methods
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

Returns `child`’s index within the container’s `nodes` array.

```js
rule.index( rule.nodes[2] ) //=> 2
```

Arguments:

* `child (Node)`: child of current container.

### `container.every(callback)`

Returns `true` if `callback` returns a true for all of the container’s children.

```js
var noPrefixes = rule.every(function (decl) {
    return decl.prop[0] != '-';
});
```

Arguments:

* `callback (function)`: iterator, that returns true of false.

### `container.some(callback)`

Return `true` if `callback` returns a true  value for (at least) one
of the container’s children.

```js
var hasPrefix = rule.some(function (decl) {
    return decl.prop[0] == '-';
});
```

Arguments:

* `callback (function)`: iterator, that returns true of false.

### `container.each(callback)`

Iterates through the container’s immediate children, calling `callback`
for each child.

Returning `false` within `callback` will break iteration.

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

* `callback (function)`: iterator, that will receive node itself and an index.

Unlike the `for {}`-cycle or `Array#forEach()` this iterator is safe
if you are mutating the array of child nodes during iteration.
PostCSS will adjust the current index to match the mutations.

```js
var root = postcss.parse('a { color: black; z-index: 1 }');
var rule = root.first;

for ( var i = 0; i < rule.nodes.length; i++ ) {
    var decl = rule.nodes[i];
    decl.cloneBefore({ prop: '-webkit-' + decl.prop });
    // Cycle will be infinite, because cloneBefore move current node
    // to next index
}

rule.each(function (decl) {
    decl.cloneBefore({ prop: '-webkit-' + decl.prop });
    // Will be executed only for color and z-index
});
```

`container.each()` only iterates through the container’s immediate children.
If you need to recursively iterate through all the container’s nodes,
use `container.eachInside()`.

### `container.eachInside(callback)`

Recursively iterates through the container’s children,
those children’s children, etc., calling `callback` for each.

```js
root.eachInside(function (node) {
    // Will be iterate through all nodes
});
```

Arguments:

* `callback (function)`: iterator, that will receive node itself and an index.

Like `container.each()`, this method is safe to use
if you are mutating arrays during iteration.

If you only need to iterate through the container’s immediate children,
use `container.each()`.

### `container.eachDecl([propFilter,] callback)`

Recursively iterates through all declaration nodes within the container,
calling `callback` for each.

```js
root.eachDecl(function (decl) {
    if ( decl.prop.match(/^-webkit-/) ) {
        decl.removeSelf();
    }
});
```

Arguments:

* `propFilter: (string|RegExp) optional`: string or regular expression
  to filter declarations by property name.
  * `callback (function)`: iterator, that will receive node itself and an index.

If you pass a `propFilter`, only those declarations whose property matches
`propFilter` will be iterated over.

```js
// Make flat design
root.eachDecl('border-radius', function (decl) {
    decl.removeSelf();
});
root.eachDecl(/^background/, function (decl) {
    decl.value = takeFirstColorFromGradient(decl.value);
});
```

Like `container.each()`, this method is safe to use if you are mutating
arrays during iteration.

### `container.eachAtRule([nameFilter,] callback)`

Recursively iterates through all at-rule nodes within the container,
calling `callback` for each.


```js
root.eachAtRule(function (rule) {
    if ( rule.name.match(/^-webkit-/) ) rule.removeSelf();
});
```

Arguments:

* `nameFilter: (string|RegExp) optional`: string or regular expression to filter
  at-rules by name.
  * `callback (function)`: iterator, that will receive node itself and an index.

If you pass a `filter`, only those at-rules whose name matches `filter`
will be iterated over.

```js
var first = false;
root.eachAtRule('charset', function (rule) {
    if ( !first ) {
        first = true;
    } else {
        rule.removeSelf();
    }
});
```

Like `container.each()`, this method is safe to use if you are mutating arrays
during iteration.

### `container.eachRule(callback)`

Recursively iterates through all rule nodes within the container, calling
`callback` for each.

```js
var selectors = [];
root.eachRule(function (rule) {
    selectors.push(rule.selector);
});
console.log('You CSS uses ' + selectors.length + ' selectors');
```

Arguments:

* `callback (function)`: iterator, that will receive node itself and an index.

Like `container.each()`, this method is safe to use if you are mutating arrays
during iteration.

### `container.eachComment(callback)`

Recursively iterates through all comment nodes within the container, calling
`callback` for each.

```js
root.eachComment(function (comment) {
    comment.removeSelf();
});
```

Arguments:

* `callback (function)`: iterator, that will receive node itself and an index.

Like `container.each()`, this method is safe to use if you are mutating arrays
during iteration.

### `container.replaceValues(pattern, opts, callback)`

Passes all declaration values within the container that match `pattern` through
`callback`, replacing those values with the returned result of `callback`.

This method is useful if you are using a custom unit or function,
so need to iterate through all values.

```js
root.replaceValues(/\d+rem/, { fast: 'rem' }, function (string) {
    return 15 * parseInt(string) + 'px';
});
```

Arguments:

* `pattern (string|RegExp)`: pattern, that we need to replace.
* `opts (object) optional`: options to speed up th search:
  * `props`: An array of property names. The method will only search for values
    that match `regexp` within declarations of listed properties.
  * `fast`: A string that will be used to narrow down values and speed up
    the regexp search. Searching every single value with a regexp can be slow;
    so if you pass a `fast` string, PostCSS will first check whether the value
    contains the `fast` string; and only if it does will PostCSS check that
    value against `regexp`. For example, instead of just checking for `/\d+rem/`
    on all values, you can set `fast: 'rem'` to first check whether a value has
    the `rem` unit, and only if it does perform the regexp check.
* `callback (function|string)`: string to replace `pattern` or callback, that
  will return new value. Callback will receive the same arguments as those
  passed to a function parameter of [`String#replace`].

[`String#replace`]: (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter)

### `container.prepend(node)` and `container.append(node)`

Insert a new node to the start/end of the container.

```js
var decl = postcss.decl({ prop: 'color', value: 'black' });
rule.append(decl);
```

Arguments:

* `node (Node|object|string)`: new node.

Because each node class is identifiable by unique properties, you can use
the following shortcuts to create nodes in insert methods:

```js
root.append({ name: '@charset', params: '"UTF-8"' }); // at-rule
root.append({ selector: 'a' });                       // rule
rule.append({ prop: 'color', value: 'black' });       // declaration
rule.append({ text: 'Comment' })                      // comment
```
Also you can use string with CSS of new element. But it will be a little bit
slower, that shortcuts above.

```js
root.append('a {}');
root.first.append('color: black; z-index: 1');
```

### `container.insertBefore(oldNode, newNew)`  and `container.insertAfter(oldNode, newNew)`

Insert `newNode` before/after `oldNode` within the container.

```js
rule.insertBefore(decl, decl.clone({ prop: '-webkit-' + decl.prop }));
```

Arguments:

* `oldNode (Node|number)`: child or child’s index.
* `node (Node|object|string)`: new node.

### `container.remove(node)`

Removes `node` from the container, and the `parent` properties of `node`
and its children.

```js
rule.nodes.length  //=> 5
rule.remove(decl);
rule.nodes.length  //=> 4
decl.parent        //=> undefined
```

Arguments:

* `node (Node|number)`: child or child’s index.

### `container.removeAll()`

Removes all children from the container, and cleans their `parent` properties.

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

### `root.after`

The space symbols after the last child of `root`,
such as `\n` at the end of a file.

```js
var root = parse('a {}\nb { color: black }\n');
root.after //=> '\n'
```

This is a code style property.

## `AtRule` node

Represents an at-rule.

This node will have a `nodes` property, representing its children,
if it is followed in the CSS by a `{}` block.


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

This value will be cleaned of comments. If the source at-rule’s prelude
contained comments, those comments will be available
in the `_params.raw` property.

If you have not changed the parameters, calling `atrule.toString()`
will use the original raw value (comments and all).

```js
var root  = postcss.parse('@media print, /**/ screen {}');
var media = root.first;
media.params      //=> '[print,  screen]'
media._params.raw //=> 'print, /**/ screen'
media.toString()  //=> '@media print, /**/ screen {}'
```

### `atrule.before`

The space symbols before the at-rule.

The default value is `\n`, except for the first rule in a `Root`,
whose `before` property is empty.

```js
var root  = postcss.parse('@charset "UTF-8";\n@media print {}\n');
var media = root.last;
media.before //=> '\n'
```

This is a code style property.

### `atrule.afterName`

The space symbols between the at-rule’s name and its parameters.

The default value is ` `.

```js
var root  = postcss.parse('@media\n  print,\n  screen {}\n');
var media = root.first;
media.afterName //=> '\n  '
```

This is a code style property.

### `atrule.between`

The space symbols between the at-rule’s parameters
and `{`, the block-opening curly brace.

The default value is ` `.

```js
var root  = postcss.parse('@media print, screen\n{}\n');
var media = root.first;
media.before //=> '\n'
```

This is a code style property.

### `atrule.after`

The space symbols between the at-rule’s last child and `}`,
the block-closing curly brace.

The default value is `\n` if the at-rule has children,
and an empty string (`''`) if it does not.

```js
var root  = postcss.parse('@media print {\n  a {}\n  }\n');
var media = root.first;
media.after //=> '\n  '
```

This is a code style property.

### `atrule.semicolon`

`true` if at-rule’s last child declaration
is followed by an (optional) semicolon.

`undefined` if the semicolon is omitted.

```js
postcss.parse('@page{color:black}').first.semicolon  //=> undefined
postcss.parse('@page{color:black;}').first.semicolon //=> true
```

This is a code style property.

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

This value will be cleaned of comments. If the source selector contained
comments, those comments will be available in the `_selector.raw` property.

If you have not changed the selector, the result of `rule.toString()`
will include the original raw selector value (comments and all).

```js
var root = postcss.parse('a /**/ b {}');
var rule = root.first;
rule.selector      //=> 'a  b'
rule._selector.raw //=> 'a /**/ b'
rule.toString()    //=> 'a /**/ b {}'
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

### `rule.before`

The space symbols before the rule.

The default value is `\n`, except for first rule in root,
whose `before` property is empty.

```js
var root = postcss.parse('a {}\nb {}\n');
var rule = root.last;
rule.before //=> '\n'
```

This is a code style property.

### `rule.after`

The space symbols between the rule’s last child and `}`,
the block-closing curly brace.

The default value is `\n` if rule has children and an empty string (`''`)
if it does not.

```js
var root = postcss.parse('@a {\n  color: black\n  }\n');
var rule = root.first;
root.after //=> '\n  '
```

This is a code style property.

### `rule.semicolon`

`true` if rule’s last child declaration is followed by an (optional) semicolon.

`undefined` if the semicolon is omitted.

```js
postcss.parse('a{color:black}').first.semicolon  //=> undefined
postcss.parse('a{color:black;}').first.semicolon //=> true
```

This is a code style property.

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

This value will be cleaned of comments. If the source value contained comments,
those comments will be available in the `_value.raw` property.

If you have not changed the value, the result of `decl.toString()` will include
the original raw value (comments and all).

```js
var root = postcss.parse('a { border-radius: 3px /**/ 0 }');
var decl = root.first.first;
decl.value      //=> '3px  0'
decl._value.raw //=> '3px /**/ 0'
decl.toString() //=> ' border-radius: 3px /**/ 0'
```

### `declaration.before`

The space symbols before the declaration.

Default value is `\n    `.

```js
var root = postcss.parse('a {\n  color: black\n}\n');
var decl = root.first.first;
decl.before //=> '\n  '
```

This is a code style property.

### `declaration.between`

The symbols between the declaration’s property and its value.

Default value is `: `.

```js
var root = postcss.parse('a { color/**/: black }');
var decl = root.first.first;
decl.between //=> '/**/: '
```

This is a code style property.

### `declaration.important`

`true` if the declaration has an `!important` annotation.

```js
var root = postcss.parse('a { color: black !important; color: white }');
root.first.first.important //=> true
root.first.last.important  //=> undefined
```

If there are comments between the declaration’s value and its
`!important` annotation, they will be available in the `_important` property.

```js
var root = postcss.parse('a { color: black /**/ !important }');
root.first.first._important //=> ' /**/ !important'
```

## `Comment` node

Represents a comment between declarations or statements (rule and at-rules).
Comments inside selectors, at-rules parameters, or declaration values
will be stored in the raw properties explained above.

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

### `comment.left` and `comment.right`

The space symbols before/after the comment’s text.

Default value is ` `.

```js
var root  = postcss.parse('/* long */ /*short*/');
var long  = root.first;
var short = root.last;

long.left  //=> ' '
short.left //=> ''
```

This is a code style property.

### `comment.before`

The space symbols before the comment.

Default value is `\n`.

```js
var root    = postcss.parse('a {\n  /**/}\n');
var comment = root.first.first;
comment.before //=> '\n  '
```

This is a code style property.

[`source-map`]: https://github.com/mozilla/source-map
[Promise]:      http://www.html5rocks.com/en/tutorials/es6/promises/

[source map options]: https://github.com/postcss/postcss#source-map
[Safe Mode]:          https://github.com/postcss/postcss#safe-mode

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
[`Comment` node]:                 #comment-node
[`AtRule` node]:                  #atrule-node
[`from` option]:                  #processorprocesscss-opts
[`LazyResult`]:                   #lazy-result-class
[`Result#map`]:                   #resultmap
[`Result#css`]:                   #resultcss
[`Root` node]:                    #root-node
[`Rule` node]:                    #rule-node
[`Processor`]:                    #processor-class
[`Warning`]:                      #warning-class
[`Result`]:                       #result-class
[`Input`]:                        #inputclass
