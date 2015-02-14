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

[`PostCSS#use`]: https://github.com/postcss/postcss#useplugin

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

* `from`: the path to the source CSS file. You should always set `from`, because
  it is used in map generation and in syntax error messages.
* `safe`: enable [Safe Mode], in which PostCSS will try
  to fix CSS syntax errors.
* `map`: an object of [source map options]. Only `map.prev` is used in
  `parse`.

[source map options]: https://github.com/postcss/postcss#source-map
[Safe Mode]:          https://github.com/postcss/postcss#safe-mode

### `postcss.root(props)`

Creates a new [`Root` node](#root-node).

```js
postcss.root({ after: '\n' }).toString() //=> "\n"
```

### `postcss.atRule(props)`

Creates a new [`AtRule` node](#atrule-node).

```js
postcss.atRule({ name: 'charset' }).toString() //=> "@charset"
```

### `postcss.rule(props)`

Creates a new [`Rule` node](#rule-node).

```js
postcss.rule({ selector: 'a' }).toString() //=> "a {\n}"
```

### `postcss.decl(props)`

Creates a new [`Declaration` node](#declaration-node).

```js
postcss.decl({ prop: 'color', value: 'black' }).toString() //=> "color: black"
```

### `postcss.comment(props)`

Creates a new [`Comment` node](#comment-node).

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

### `use(plugin)`

Adds a plugin to be used as a CSS processor.

```js
var processor = postcss();
processor.use(autoprefixer).use(cssnext).use(cssgrace);
```

Plugins can also be added by passing them as arguments when creating
a `postcss` instance (cf. [`postcss(plugins)`](#postcssplugins)).

Plugins can come in three formats:

1. A function. PostCSS will pass the function a `Root` node
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

### `process(css, opts)`

This is the main method of PostCSS. It will parse the source CSS
and create a `Root` node; send this `Root` to each plugin successively,
for transformations; and then return a `Result` instance created
from the transformed `Root`.

```js
var result = processor.process(css, { from: 'a.css', to: 'a.out.css' });
```

Input CSS formats are:

* A string of CSS.
* A `Result` instance from another PostCSS processor. PostCSS will accept
  the already parsed `Root` from it.
* Any object with a `toString()` method -- for example, a file stream.

Options:

* `from`: the path of the CSS source file. You should always set `from`,
  because it is used in source map generation and syntax error messages.
* `to`: the path where you’ll put the output CSS file. You should always set
  `to` to generate correct source maps.
* `safe`: enable [Safe Mode], in which PostCSS will try
  to fix CSS syntax errors.
* `map`: an object of [source map options].

[Safe Mode]:          https://github.com/postcss/postcss#safe-mode
[source map options]: https://github.com/postcss/postcss#source-map

## `Result` class

There is a two way to get `Result` instance. `PostCSS#process(css, opts)`
returns it or you can call `Root#toResult(opts)`.

```js
var result1 = postcss().process(css);
var result2 = postcss.parse(css).toResult();
```

### `root`

This property contains source `Root` instance.

```js
root.toResult().root == root;
```

### `opts`

Options from `PostCSS#process(css, opts)` or `Root#toResult(opts)` call.

```js
postcss().process(css, opts).opts == opts;
```

### `css`

Lazy method, that will stringify `Root` instance to CSS string on first call
and generates source map to `map` property if it is necessary.

```js
postcss().process('a{}').css //=> "a{}"
```

### `map`

Lazy method, that will generates source map for `Root` changes and stringify
CSS to `css` property.

It contains instance of `SourceMapGenerator` class from [source-map] library.

```js
result.map.toJSON() //=> { version: 3, file: 'a.css', sources: ['a.css'], … }
```

`Result` instance will contain `map` property only if PostCSS decide, that
source map should be in separated file. If source map will be inlined to CSS,
`Result` instance will not have this property.

```js
if ( result.map ) {
    fs.writeFileSync(to + '.map', result.map.toString());
}
```

By default, PostCSS will inline map to CSS, so in most cases this property will
be empty. PostCSS will create it only if user set `map.inline = false`
option or if input source map was in separated file.

[source-map]: https://github.com/mozilla/source-map

## Vendor module

Contains helpers to work with vendor prefixes.

### `prefix`

Returns vendor prefix.

```js
vendor.prefix('-moz-tab-size') //=> '-moz-'
```

### `unprefixed`

Returns value without vendor prefix.

```js
vendor.unprefixed('-moz-tab-size') //=> 'tab-size'
```

## List module

Contains helpers to safely split CSS values with brackets and quotes detection.

```js
var list = require('postcss/lib/list');
```

### `list.space`

Safely splits space-separated values (like `background`).

```js
list.split('1px calc(10% + 1px) "border radius"')
//=> ['1px', 'calc(10% + 1px)', '"border radius"']
```

### `list.comma`

Safely splits comma-separated values (like `transition`).

```js
list.split('1px 2px, rgba(255, 0, 0, 0.9), "border, top"')
//=> ['1px 2px', 'rgba(255, 0, 0, 0.9)', '"border, top"']
```

## `Input` class

Represents input source of CSS.

```js
var root  = postcss.parse(css, { from: file });
var input = root.source.input;
```

### `file`

Absolute path to CSS source file from `from` option.

```js
var root  = postcss.parse(css, { from: 'a.css' });
root.source.input.file //=> '/home/ai/a.css'
```

### `id`

Unique ID of CSS source if user missed `from` and we didn’t know file path.

```js
var root  = postcss.parse(css);
root.source.input.file //=> undefined
root.source.input.id   //=> <input css 1>
```

### `from`

Contains `file` if user set `from` option or `id` if he or she didn’t.

```js
var root  = postcss.parse(css, { from: 'a.css' });
root.source.input.file //=> '/home/ai/a.css'

var root  = postcss.parse(css);
root.source.input.from //=> <input css 1>
```

### `map`

Represents input source map from compilation step before PostCSS,
(from example, from Sass compiler).

`map.consumer()` returns instance of `SourceMapConsumer` class
from [source-map] library.

```js
root.source.input.map.consumer().sources //=> ['a.sass']
```

[source-map]: https://github.com/mozilla/source-map

### `origin(line, column)`

Uses input source map and returns symbol position in origin source
(for example, in Sass file):

```js
root.source.input.origin(1, 1) //=> { source: 'a.css', line: 3, column: 1 }
```

## Nodes common methods

All node classes have many common methods.

### `type`

String with node’s type. It can be `root`, `atrule`, `rule`, `decl`
or `comment`.

```js
postcss.decl({ prop: 'color', value: 'black' }).type //=> 'decl'
```

### `parent`

Link to parent node.

```js
root.nodes[0].parent == root;
```

### `source`

Origin source of node. It contains start and end positions and `Input` instance
in `source.input` property.

```js
decl.source.input.from //=> '/home/ai/a.sass'
decl.source.start      //=> { line: 10, column: 2 }
decl.source.end        //=> { line: 10, column: 12 }
```

The property is used in map generation. If you will create node manually
(for example, by `postcss.decl`) node will not have a `source` property
and will be missed in source map. So plugin developer should clone nodes
(it saves `source`) or set `source` manually:

```js
var rule = postcss.rule({ selector: 'a', source, atrule.source });
atrule.parent.insertBefore(atrule, rule);
```

### `toString()`

Stringifys node to CSS string.

```js
postcss.rule({ selector: 'a' }) //=> 'a {}''
```

### `error(message)`

Returns `CssSyntaxError` instance with position of current node. It will use
input source map to get origin position even from compiltion step before PostCSS
(for example, in Sass file). Error message with also contains small example of
source code.

```js
if ( !variables[name] ) {
    throw decl.error('Unknown variable ' + name);
    // CssSyntaxError: a.sass:4:3: Unknown variable $black
    // a
    //   color: $black
    //   ^
    //   background: white
}
```

You can also use this method for better warning messages:

```js
if ( oldSyntax.check(decl) ) {
    console.warn( decl.error('Old syntax for variables').message );
    // a.sass:4:3: Old syntax for variables
}
```

### `next()` and `prev()`

Return next/previous children of node’s parent. Return `undefined`
for first/last child.

```js
var annotation = decl.prev();
if ( annotation.type == 'comment' ) {
    readAnnotation( annotation.text );
}
```

### `root()`

Returns `Root` instance of current nodes tree.

```js
root.nodes[0].nodes[0].root() == root
```

### `removeSelf()`

Removes current node from parent and cleans `parent` property in this node
and node’s children.

```js
if ( decl.prop.match(/^-webkit-/) ) {
    decl.removeSelf();
}
```

### `replaceWith(otherNode)`

Inserts other node before and removes current node.

```js
if ( atrule.name == 'mixin' ) {
    atrule.replaceWith(mixinRules[atrule.params]);
}
```

### `clone(props)`

Clones node, cleans `parent` and code style propeties in current node
and node’s children.. You can override some properties in clone by `props`
argument.


```js
var clonded = decl.clone({ prop: '-moz-' + decl.prop });
cloned.before     //=> undefined
cloned.parent     //=> undefined
cloned.toString() //=> -moz-transform: scale(0)
```

### `cloneBefore(props)` and `cloneAfter(props)`

Shortcuts to clone node and insert clone before/after current node.

```js
decl.cloneBefore({ prop: '-moz-' + decl.prop });
```

### `moveTo(newParent)`

Removes node from current parent and inserts node to the end of `newParent`.

It will clean `before` and `after` code style properties to use new indentation
in new parent. If will clean `between` property if new parent is in other root.

```js
atrule.moveTo(atrule.parent.parent);
```

### `moveBefore(otherNode)` and `moveAfter(otherNode)`

Remove node from current parent and insert it to new parent
before/after `otherNode`.

It will also clean code style properties as `moveTo(newParent)` does.

### `style(prop, defaultType)`

Returns code style property value. If node code style property will be missed
(like from manually built nodes or from clones), PostCSS will try to autodetect
it by other nodes in tree.

```js
var root = postcss.parse('a { background: white }');
root.nodes[0].append({ prop: 'color', value: 'black' });
root.nodes[0].nodes[1].style('before') //=> ' '
```

If PostCSS can’t find any nodes to copy a code style, it will use `defaultType`
value from `node.defaultStyle` object.

```js
postcss.decl({ prop: 'color', value: 'black' }).style('before') //=> '\n    '
```

## Containers common methods

`Root`, `AtRule` and `Rule` classes has some common methods
to works with children.

Note, that all containers can store any content. If you will write rule inside
rule, PostCSS will parse it.

### `nodes`

Array with node’s children.

```js
var root = postcss.parse('a { color: black }');
root.nodes.length           //=> 1
root.nodes[0].selector      //=> 'a'
root.nodes[0].nodes[0].prop //=> 'color'
```

### `first`

Shortcut to get first child.

```js
rule.first == rules.nodes[0];
```

### `last`

Shortcut to get last child.

```js
rule.last == rule.nodes[rule.nodes.length - 1];
```

### `index(child)`

Returns child’d index in parent `nodes`:

```js
rule.index( rule.nodes[2] ) //=> 2
```

### `every(callback)` and `some(callback)`

Return `true` if `callback` will return `true` on all/one children.

```js
var noPrefixes = rule.every(function (decl) {
    return decl.prop[0] != '-';
});
var hasPrefix = rule.some(function (decl) {
    return decl.prop[0] == '-';
});
```

### `each(callback)`

Iterates through container’s children. Returning `false` will break iteration.

```js
var color;
rule.each(function (decl) {
    if ( decl.prop == 'color' ) {
        color = decl.value;
        return false;
    }
});
```

Unlike `for {}`-cycle or `Array#forEach()` this iterator is safe.
So you can mutate the children during iteration and PostCSS will fix
the current index:

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

Callback will receive 2 arguments with child instance and child index number.

### `eachInside(callback)`

Recursive iterates through children and children of children.

```js
root.eachInside(function (node) {
    // Will be iterate through all nodes
});
```

This method is also safe as `each()` method.

### `eachDecl(prop, callback)`

Recursive iterates through all declaration inside container.

```js
root.eachDecl(function (decl) {
    if ( decl.prop.match(/^-webkit-/) ) {
        decl.removeSelf();
    }
});
```

You can filter declarations by property name with string or regexp.

```js
// Make flat design
root.eachDecl('border-radius', function (decl) {
    decl.removeSelf();
});
root.eachDecl(/^background/, function (decl) {
    decl.value = takeFirstColorFromGradient(decl.value);
});
```

This method is also safe as `each()` method.

### `eachAtRule(name, calllback)`

Recursive iterates through all at-rules inside container.

```js
root.eachAtRule(function (rule) {
    if ( rule.name.match(/^-webkit-/) ) rule.removeSelf();
});
```

You can filter at-rules by name with string or regexp.

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

This method is also safe as `each()` method.

### `eachRule(callback)`

Recursive iterates through all rules inside container.

```js
var selectors = [];
root.eachRule(function (rule) {
    selectors.push(rule.selector);
});
console.log('You CSS uses ' + selectors.length + ' selectors');
```

This method is also safe as `each()` method.

### `eachComment(callback)`

Recursive iterates through all comments inside container.

```js
root.eachComment(function (comment) {
    comment.removeSelf();
})
```

This method is also safe as `each()` method.

### `replaceValues(regexp, opts, callback)`

Replaces regexp in all declaration’s values inside container.
It is useful to add some custom unit or function. Callback will receive
same arguments as in `String#replace`.

You can make it faster by `fast` option. PostCSS will execute slow
regexp only after fast `value.indexOf(opts.fast)` check.
Also you can set a property names array in `props` option.

```js
root.replaceValues(/\d+rem/, { fast: 'rem' }, function (string) {
    return 15 * parseInt(string) + 'px';
});
```

### `prepend(node)` and `append(node)`

Insert a new node to start/end.

```js
var decl = postcss.decl({ prop: 'color', value: 'black' });
rule.append(decl);
```

Because each node class has unique properties, you can use these shortcuts:

```js
root.append({ name: '@charset', params: '"UTF-8"' }); // at-rule
root.append({ selector: 'a' });                       // rule
rule.append({ prop: 'color', value: 'black' });       // declaration
rule.append({ text: 'Comment' })                      // comment
```

### `insertBefore(oldNode, newNew)` and `insertAftr(oldNode, newNew)`

Insert `newNode` before/after `oldNode` (index or node instance).

```js
rule.insertBefore(decl, decl.clone({ prop: '-webkit-' + decl.prop }));
```

You can also use shortcuts here like in `append()` method.

```js
rule.insertBefore(decl, { prop: 'color', value: 'black' });
```

### `remove(node)`

Removes `node` from container and clean `parent` properties in node
and node’s children.

```js
rule.nodes.length  //=> 5
rule.remove(decl);
rule.nodes.length  //=> 4
decl.parent        //=> undefined
```

You can use node instance or node index in `node` argument.

### `removeAll()`

Removes all children from container and cleans their `parent` properties.

```js
rule.removeAll();
rule.nodes.length //=> 0
```

## `Root` node

Represents CSS file and contains all nodes inside.

```js
var root = postcss.parse('a{color:black} b{z-index:2}');
root.type         //=> 'root'
root.nodes.length //=> 2
```

### `after`

Stores space symbols after last child like `\n` from end of the file.

```js
var root = parse('a {}\nb { color: black }\n');
root.after //=> '\n'
```

## `AtRule` node

Represents at-rule. Node will have `nodes` property if it have `{}` in CSS.


```js
var root = postcss.parse('@charset "UTF-8"; @media print {}');

var charset = root.first;
charset.type  //=> 'atrule'
charset.nodes //=> undefined

var media = root.last;
media.nodes   //=> []
```

### `name`

Stores at-rule name.

```js
var root  = postcss.parse('@media print {}');
var media = root.first;
media.name //=> 'media'
```

### `params`

Stores at-rule parameters.

```js
var root  = postcss.parse('@media print, screen {}');
var media = root.first;
media.params //=> 'print, screen'
```

Value will be cleaned from inner comments. Origin value with comments will be
in `_params.raw` property.

```js
var root  = postcss.parse('@media print, /**/ screen {}');
var media = root.first;
media.params      //=> 'print,  screen'
media._params.raw //=> 'print, /**/ screen'
media.toString()  //=> '@media print, /**/ screen {}'
```

If you will not change parameters, PostCSS will stringify origin raw value.

### `before`

Code style property with space symbols before at-rule.

```js
var root  = postcss.parse('@charset "UTF-8";\n@media print {}\n');
var media = root.last;
media.before //=> '\n'
```

Default value is `\n`, except first rule in root where `before` will be empty.

### `afterName`

Code style property with space symbols between at-rule name and parameters.

```js
var root  = postcss.parse('@media\n  print,\n  screen {}\n');
var media = root.first;
media.afterName //=> '\n  '
```

Default value is ` `.

### `between`

Code style property with spaces between parametes and `{`.

```js
var root  = postcss.parse('@media print, screen\n{}\n');
var media = root.first;
media.before //=> '\n'
```

Default value is ` `.

### `after`

Code style property with spaces between last child and `}`.

```js
var root  = postcss.parse('@media print {\n  a {}\n  }\n');
var media = root.first;
media.after //=> '\n  '
```

Default value is `\n` if at-rule has children and empty string if it doesn’t.

### `semicolon`

Code style property for at-rules with declarations, that last children
has optional `;`.

```js
postcss.parse('@page{color:black}').first.semicolon  //=> undefined
postcss.parse('@page{color:black;}').first.semicolon //=> true
```

## `Rule` node

Represents CSS rule with selector.

```js
var root = postcss.parse('a{}');
var rule = root.first;
rule.type       //=> 'rule'
rule.toString() //=> 'a{}'
```

### `selector`

Stores rule’s selector string.

```js
var root = postcss.parse('a, b { }');
var rule = root.first;
rule.selector //=> 'a, b'
```

Value will be cleaned from inner comments. Origin value with comments will be
in `_selector.raw` property.

```js
var root = postcss.parse('a /**/ b {}');
var rule = root.first;
rule.selector      //=> 'a  b'
rule._selector.raw //=> 'a /**/ b'
rule.toString()    //=> 'a /**/ b {}'
```

If you will not change selector, PostCSS will stringify origin raw value.

### `selectors`

Dynamic property that will split `selector` by comma and return array.

```js
var root = postcss.parse('a, b { }');
var rule = root.first;

rule.selector  //=> 'a, b'
rule.selectors //=> ['a', 'b']

rule.selectors = ['a', 'strong'];
rule.selector //=> 'a, strong'
```

### `before`

Code style property with space symbols before rule.

```js
var root = postcss.parse('a {}\nb {}\n');
var rule = root.last;
rule.before //=> '\n'
```

Default value is `\n`, except first rule in root where `before` will be empty.

### `after`

Code style property with spaces between last child and `}`.

```js
var root = postcss.parse('@a {\n  color: black\n  }\n');
var rule = root.first;
root.after //=> '\n  '
```

Default value is `\n` if rule has children and empty string if it doesn’t.

### `semicolon`

Code style property, that last children has optional `;`.

```js
postcss.parse('a{color:black}').first.semicolon  //=> undefined
postcss.parse('a{color:black;}').first.semicolon //=> true
```

## `Declaration` node

Represents CSS declaration.

```js
var root = postcss.parse('a { color: black }');
var decl = root.first.first;
decl.type       //=> 'decl'
decl.toString() //=> ' color: black'
```

### `prop`

Stores property name.

```js
var root = postcss.parse('a { color: black }');
var decl = root.first.first;
decl.prop //=> 'color'
```

### `value`

Stores declaration value.

```js
var root = postcss.parse('a { color: black }');
var decl = root.first.first;
decl.value //=> 'black'
```

Value will be cleaned from inner comments. Origin value with comments will be
in `_value.raw` property.

```js
var root = postcss.parse('a { border-radius: 3px /**/ 0 }');
var decl = root.first.first;
decl.value      //=> '3px  0'
decl._value.raw //=> '3px /**/ 0'
decl.toString() //=> ' border-radius: 3px /**/ 0'
```

If you will not change value, PostCSS will stringify origin raw value.

### `before`

Code style property with space symbols before declaration.

```js
var root = postcss.parse('a {\n  color: black\n}\n');
var decl = root.first.first;
decl.before //=> '\n  '
```

Default value is `\n    `.

### `between`

Code style property with symbols between property and value.

```js
var root = postcss.parse('a { color/**/: black }');
var decl = root.first.first;
decl.between //=> '/**/: '
```

Default value is `: `.

### `important`

Property is `true` if declaration has `!important` statement.

```js
var root = postcss.parse('a { color: black !important; color: white }');
root.first.first.important //=> true
root.first.last.important  //=> undefined
```

If value has comments before `!important` statement, they will be stored
in `_important` property.

```js
var root = postcss.parse('a { color: black /**/ !important }');
root.first.first._important //=> ' /**/ !important'
```

## `Comment` node

Represents comment between declarations or rules.
Comments inside selectors, at-rules params, or declaration values
will be stored in the raw properties.

```js
var root    = postcss.parse('a { color: /* inner */ black; /* outer */ }');
var decl    = root.first.first;
var comment = root.first.last;

comment.type //=> 'comment'
decl.between //=> ': /* inner */'
```

### `text`

Stores comment text.

```js
var root    = postcss.parse('/* Empty file */');
var comment = root.first;
var comment.text //=> 'Empty file'
```

### `left` and `right`

Code style properties with spaces before/after comment’s text.

```js
var root  = postcss.parse('/* long */ /*short*/');
var long  = root.first;
var short = root.last;

long.left  //=> ' '
short.left //=> ''
```

Default value is ` `.

### `before`

Code style property with space symbols before comment.

```js
var root    = postcss.parse('a {\n  /**/}\n');
var comment = root.first.first;
comment.before //=> '\n  '
```

Default value is `\n`.
