# PostCSS API

* [postcss function](#postcss-function)
* [PostCSS class](#postcss-class)
* [Result class](#result-class)
* [Vendor module](#vendor-module)
* [List module](#list-module)
* [Input class](#input-class)
* [Nodes common methods](#nodes-common-methods)
* [Containers common methods](#containers-common-methods)
* [Root node](#root-node)
* [AtRule node](#atrule-node)
* [Rule node](#rule-node)
* [Declaration node](#declaration-node)
* [Comment node](#comment-node)

## `postcss` function

The `postcss` function is the main entry point for PostCSS.

```js
var postcss = require('postcss');
```

### `postcss(plugins)`

Returns a new `PostCSS` instance that will apply `plugins`
as CSS processors.

```js
postcss([autoprefixer, cssnext, cssgrace]).process(css).css;
```

You can also set plugins with the [`PostCSS#use`] method.

See [`PostCSS#use`] below for details about plugin formats.

### `postcss.parse(css, opts)`

Parses source `css` and returns a new `Root` node, which contains
the source CSS nodes.

```js
// Simple CSS concatenation with source map support
var root1 = postcss.parse(css1, { from: file1 });
var root2 = postcss.parse(css2, { from: file2 });
root1.append(root2).toResult().css;
```

Options:

* `from`: the path to the source CSS file. You should always set `from`,
  because it is used in map generation and in syntax error messages.
* `safe`: enable [Safe Mode], in which PostCSS will try
  to fix CSS syntax errors.
* `map`: an object of [source map options].
  Only `map.prev` is used in `parse`.

### `postcss.root(props)`

Creates a new [`Root` node].

```js
postcss.root({ after: '\n' }).toString() //=> "\n"
```

### `postcss.atRule(props)`

Creates a new [`AtRule` node].

```js
postcss.atRule({ name: 'charset' }).toString() //=> "@charset"
```

### `postcss.rule(props)`

Creates a new [`Rule` node].

```js
postcss.rule({ selector: 'a' }).toString() //=> "a {\n}"
```

### `postcss.decl(props)`

Creates a new [`Declaration` node].

```js
postcss.decl({ prop: 'color', value: 'black' }).toString() //=> "color: black"
```

### `postcss.comment(props)`

Creates a new [`Comment` node].

```js
postcss.comment({ text: 'test' }).toString() //=> "/* test */"
```

## `PostCSS` class

A `PostCSS` instance contains plugins to process CSS. You can create
one `PostCSS` instance, initialize its plugins, and then use that instance
on many CSS files.

```js
var processor = postcss([autoprefixer, cssnext, cssgrace]);
processor.process(css1).css;
processor.process(css2).css;
```

### `p.use(plugin)`

Adds a plugin to be used as a CSS processor.

```js
var processor = postcss();
processor.use(autoprefixer).use(cssnext).use(cssgrace);
```

Plugins can also be added by passing them as arguments when creating
a `postcss` instance (cf. [`postcss(plugins)`]).

Plugins can come in three formats:

1. A function. PostCSS will pass the function a [`Root` node]
   as the first argument.
2. An object with a `postcss` method. PostCSS will use that method
   as described in #1.
3. Another `PostCSS` instance. PostCSS will copy plugins
   from that instance to this one.

Plugin functions should mutate the passed `Root` node and return nothing,
or return a new `Root` node.

```js
processor.use(function (css) {
    css.prepend({ name: 'charset', params: '"UTF-8"' });
});
processor.use(function (css) {
    return postcss.root();
});
```

### `p.process(css, opts)`

This is the main method of PostCSS. It will parse the source CSS
and create a [`Root` node]; send this `Root` to each plugin successively,
for transformations; and then return a `Result` instance created
from the transformed `Root`.

```js
var result = processor.process(css, { from: 'a.css', to: 'a.out.css' });
```

Input CSS formats are:

* A string of CSS.
* A `Result` instance from another PostCSS processor. PostCSS will accept
  the already parsed `Root` from it.
* Any object with a `toString()` method — for example, a file stream.

Options:

* `from`: the path of the CSS source file. You should always set `from`,
  because it is used in source map generation and syntax error messages.
* `to`: the path where you’ll put the output CSS file. You should always set
  `to` to generate correct source maps.
* `safe`: enable [Safe Mode], in which PostCSS will try
  to fix CSS syntax errors.
* `map`: an object of [source map options].

## `Result` class

Provides result of PostCSS transformations.

A `Result` instance is returned
by [`PostCSS#process(css, opts)`] and [`Root#toResult(opts)`].

```js
var result1 = postcss().process(css);
var result2 = postcss.parse(css).toResult();
```

### `result.root`

The source `Root` instance.

```js
root.toResult().root == root;
```

### `result.opts`

Options from the [`PostCSS#process(css, opts)`] or
[`Root#toResult(opts)`] call that produced
this `Result` instance.

```js
postcss().process(css, opts).opts == opts;
```

### `result.css`

A CSS string representing this `Result`’s '`Root` instance.

```js
postcss().process('a{}').css //=> "a{}"
```

This property is generated *lazily*: `Root` is not stringified until
the first request for the `css` property (or the [`result.map`] property).
That initial request for `css` will also generate a source map.
Source map will inlined into CSS or assigned to the [`result.map`] property,
if user ask to save map to separated file.

### `result.map`

An instance of the `SourceMapGenerator` class from the [`source-map`] library,
representing changes to the `Result`’s `Root` instance.

```js
result.map.toJSON() //=> { version: 3, file: 'a.css', sources: ['a.css'], … }
```

This property is generated *lazily*: the source map for `Root` is not generated
until the first request for the `map` property (or the [`result.css`] property).
That initial request will also stringify `Root` and assign the generated
CSS string to the [`result.css`] property.

Additionally, *this property will receive a value only if the user does not wan
an inline source map*. By default, PostCSS generates inline source maps,
written directly into the processed CSS; so by default the `map` property
will be empty.

An external source map will be generated — and assigned to `map` — only if the
user has set the `map.inline` option to `false`, or if PostCSS was passed
an external input source map.

```js
if ( result.map ) {
    fs.writeFileSync(to + '.map', result.map.toString());
}
```

## Vendor module

Contains helpers for working with vendor prefixes.

### `vendor.prefix(string)`

Returns the vendor prefix extracted from an input string.

```js
vendor.prefix('-moz-tab-size') //=> '-moz-'
```

### `vendor.unprefixed(string)`

Returns the input string stripped of its vendor prefix.

```js
vendor.unprefixed('-moz-tab-size') //=> 'tab-size'
```

## List module

Contains helpers for safely splitting lists of CSS values, preserving parentheses
and quotes.

```js
var list = require('postcss/lib/list');
```

### `list.space(string)`

Safely splits space-separated values (such as those for `background`,
`border-radius`, and other shorthand properties).

```js
list.space('1px calc(10% + 1px)')
//=> ['1px', 'calc(10% + 1px)']
```

### `list.comma(string)`

Safely splits comma-separated values (such as those
for `transition-*` and `background` properties).

```js
list.comma('black, linear-gradient(white, black)')
//=> ['black', 'linear-gradient(white, black)']
```

## `Input` class

Represents the source CSS.

```js
var root  = postcss.parse(css, { from: file });
var input = root.source.input;
```

### `input.file`

The absolute path to the CSS source file defined with
the [`from` option](#pprocesscss-opts).

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
[`from` option](#pprocesscss-opts), or [`input.id`](#inputid) if she did not.

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

### `node.error(message)`

Returns a `CssSyntaxError` instance that presents the original position
of the node in the source, showing line and column numbers and also
a small excerpt to facilitate debugging.

It will use an input source map, if present, to get the original position
of the source, even from a previous compilation step
(for example, from Sass compilation).

This method produces very useful error messages.

```js
if ( !variables[name] ) {
    throw decl.error('Unknown variable ' + name);
    // CssSyntaxError: a.sass:4:3: Unknown variable $black
    // a
    //   color: $black
    //   ^
    //   background: white
}

if ( oldSyntax.check(decl) ) {
    console.warn( decl.error('Old syntax for variables').message );
    // a.sass:4:3: Old syntax for variables
}
```

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

### `node.clone(props)`

Returns a clones of the node.

The resultant clone node and its (clone) children will have clean `parent`
and code style properties. You can override properties in the clone node
by passing a `props` argument.

```js
var clonded = decl.clone({ prop: '-moz-' + decl.prop });
cloned.before     //=> undefined
cloned.parent     //=> undefined
cloned.toString() //=> -moz-transform: scale(0)
```

### `node.cloneBefore(props)` and `node.cloneAfter(props)`

Shortcuts to clone the node and insert the resultant clone node before/after
the current node.

```js
decl.cloneBefore({ prop: '-moz-' + decl.prop });
```

### `node.moveTo(newParent)`

Removes the node from its current parent and inserts it
at the end of `newParent`.

This will clean the `before` and `after` code style properties from the node,
and replace them with the indentation style of `newParent`. It will also clean
the `between` property if `newParent` is in another `Root`.

```js
atrule.moveTo(atrule.parent.parent);
```

### `node.moveBefore(otherNode)` and `node.moveAfter(otherNode)`

Removes the node from its current parent and inserts it into a new parent
before/after `otherNode`.

This will also clean the node’s code style properties just
as `node.moveTo(newParent)` does.

### `node.style(prop, defaultType)`

Returns a code style property value. If the node is missing the code style
property (because the node was manually built or cloned), PostCSS will try
to autodetect the code style property by looking at other nodes in the tree.

```js
var root = postcss.parse('a { background: white }');
root.nodes[0].append({ prop: 'color', value: 'black' });
root.nodes[0].nodes[1].style('before') //=> ' '
```

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

### `container.every(callback)`

Returns `true` if `callback` returns a truthy value for all
of the container’s children.

```js
var noPrefixes = rule.every(function (decl) {
    return decl.prop[0] != '-';
});
```

### `container.some(callback)`

Return `true` if `callback` returns a truthy value
for (at least) one of the container’s children.

```js
var hasPrefix = rule.some(function (decl) {
    return decl.prop[0] == '-';
});
```

### `container.each(callback)`

Iterates through the container’s immediate children, calling `callback`
for each child.

`callback` receives 2 arguments: the node itself and an index.

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
If you need to recursively iterate through all the container’s descendents,
use `container.eachInside()`.

### `container.eachInside(callback)`

Recursively iterates through the container’s children,
those children’s children, etc., calling `callback` for each.

`callback` receives 2 arguments: the node itself and an index.

```js
root.eachInside(function (node) {
    // Will be iterate through all nodes
});
```

Like `container.each()`, this method is safe to use
if you are mutating arrays during iteration.

If you only need to iterate through the container’s immediate children,
use `container.each()`.

### `container.eachDecl([propFilter,] callback)`

Recursively iterates through all declaration nodes within the container,
calling `callback` for each.

`callback` receives 2 arguments: the node itself and an index.

```js
root.eachDecl(function (decl) {
    if ( decl.prop.match(/^-webkit-/) ) {
        decl.removeSelf();
    }
});
```

If you pass a string or regular expression as `filter`, only those declarations whose
property matches`filter` will be iterated over.

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

`callback` receives 2 arguments: the node itself and an index.


```js
root.eachAtRule(function (rule) {
    if ( rule.name.match(/^-webkit-/) ) rule.removeSelf();
});
```

If you pass a string or regular expression as `filter`, only those at-rules whose name
matches `filter` will be iterated over.

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

`callback` receives 2 arguments: the node itself and an index.

```js
var selectors = [];
root.eachRule(function (rule) {
    selectors.push(rule.selector);
});
console.log('You CSS uses ' + selectors.length + ' selectors');
```

Like `container.each()`, this method is safe to use if you are mutating arrays
during iteration.

### `container.eachComment(callback)`

Recursively iterates through all comment nodes within the container, calling
`callback` for each.

```js
root.eachComment(function (comment) {
    comment.removeSelf();
})
```

Like `container.each()`, this method is safe to use if you are mutating arrays
during iteration.

### `container.replaceValues(regexp, opts, callback)`

Passes all declaration values within the container that match `regexp` through
`callback`, replacing those values with the returned result of `callback`.

`callback` will receive the same arguments as those passed to a function
parameter of [`String#replace`].

You can speed up the search by passing `opts`:

- `props`: An array of property names. The method will only search for values
  that match `regexp` within declarations of listed properties.
- `fast`: A string that will be used to narrow down values and speed up
  the regexp search. Searching every single value with a regexp can be slow;
  so if you pass a `fast` string, PostCSS will first check whether the value
  contains the `fast` string; and only if it does will PostCSS check that value
  against `regexp`. For example, instead of just checking for `/\d+rem/` on
  all values, you can set `fast: 'rem'` to first check whether a value has
  the `rem` unit, and only if it does perform the regexp check.

This method is useful if you are using a custom unit or function,
so need to iterate through all values.

```js
root.replaceValues(/\d+rem/, { fast: 'rem' }, function (string) {
    return 15 * parseInt(string) + 'px';
});
```

[`String#replace`]: (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter)

### `container.prepend(node)` and `container.append(node)`

Insert a new node to the start/end of the container.

```js
var decl = postcss.decl({ prop: 'color', value: 'black' });
rule.append(decl);
```

Because each node class is identifiable by unique properties, you can use
the following shortcuts to create nodes to prepend/append:

```js
root.append({ name: '@charset', params: '"UTF-8"' }); // at-rule
root.append({ selector: 'a' });                       // rule
rule.append({ prop: 'color', value: 'black' });       // declaration
rule.append({ text: 'Comment' })                      // comment
```

### `container.insertBefore(oldNode, newNew)`  and `container.insertAftr(oldNode, newNew)`

Insert `newNode` before/after `oldNode` within the container.

`oldNode` can be a node or a node’s index.

```js
rule.insertBefore(decl, decl.clone({ prop: '-webkit-' + decl.prop }));
```

You can also use the same shorcuts available to `container.append()`.

```js
rule.insertBefore(decl, { prop: 'color', value: 'black' });
```

### `container.remove(node)`

Removes `node` from the container, and the `parent` properties of `node`
and its children.

`node` can be a node or a node’s index.

```js
rule.nodes.length  //=> 5
rule.remove(decl);
rule.nodes.length  //=> 4
decl.parent        //=> undefined
```

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

Returns a [`Result`] instance representing the root's CSS.

```js
var root1 = postcss.parse(css1, { from: 'a.css' });
var root2 = postcss.parse(css2, { from: 'b.css' });

root1.append(root2);
var result = root1.toResult({ to: 'all.css', map: true });
```

Options:

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
will stringify the original raw value (comments and all).

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

[source map options]: https://github.com/postcss/postcss#source-map
[Safe Mode]:          https://github.com/postcss/postcss#safe-mode

[`PostCSS#process(css, opts)`]: #pprocesscss-opts
[`Root#toResult(opts)`]:        #roottoresult-opts
[`postcss(plugins)`]:           #postcssplugins
[`Declaration` node]:           #declaration-node
[`Comment` node]:               #comment-node
[`PostCSS#use`]:                #puseplugin
[`AtRule` node]:                #atrule-node
[`result.map`]:                 #resultmap
[`result.css`]:                 #resultcss
[`Root` node]:                  #root-node
[`Rule` node]:                  #rule-node
[`Input`]:                      #inputclass
[`Result`]:                     #result-class
