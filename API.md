# PostCSS API

## `postcss` function

It is a main enter point of PostCSS:

```js
var postcss = require('postcss');
```

#### `postcss(plugins)`

Returns new `PostCSS` instance and sets plugins from `plugins` array
as CSS processors.

```js
postcss([autoprefixer, cssnext, cssgrace]).process(css).css;
```

Also you can create empty `PostCSS` and set plugins by `PostCSS#use` method.
See `PostCSS#use` docs below for plugin formats.

### `postcss.parse(css, opts)`

Parses CSS and returns `Root` with CSS nodes inside.

```js
// Simple CSS concatenation with source map support
var root1 = postcss.parse(css1, { from: file1 });
var root2 = postcss.parse(css2, { from: file2 });
root1.append(root2).toResult().css;
```

Options:

* `from` is a path to CSS file. You should always set `from`, because it is used
  in map generation and in syntax error messages.
* `safe` enables [Safe Mode] when PostCSS will try to fix CSS syntax errors.
* `map` is a object with [source map options]. Only `map.prev` is used in
  `parse` function.

[source map options]: https://github.com/postcss/postcss#source-map-1
[Safe Mode]:          https://github.com/postcss/postcss#safe-mode

#### `postcss.root(props)`

Creates new `Root` instance:

```js
postcss.root({ after: '\n' }).toString() //=> "\n"
```

#### `postcss.atRule(props)`

Creates new `AtRule` node:

```js
postcss.atRule({ name: 'charset' }).toString() //=> "@charset"
```

#### `postcss.rule(props)`

Creates new `Rule` node:

```js
postcss.rule({ selector: 'a' }).toString() //=> "a {\n}"
```

#### `postcss.decl(props)`

Creates new `Declaration` node:

```js
postcss.decl({ prop: 'color', value: 'black' }).toString() //=> "color: black"
```

#### `postcss.comment(props)`

Creates new `Comment` node:

```js
postcss.comment({ text: 'test' }).toString() //=> "/* test */"
```

## `PostCSS` class

`PostCSS` instance contains plugin to process CSS. You can create one `PostCSS`
instance and use it on many CSS files to initialize plugins only once.

```js
var processor = postcss([autoprefixer, cssnext, cssgrace]);
processor.process(css1).css;
processor.process(css2).css;
```

#### `use(plugin)`

Add plugin to CSS processors.

```js
var processor = postcss();
processor.use(autoprefixer).use(cssnext).use(cssgrace);
```

There is three format of plugin:

1. Function. PostCSS will send a `Root` instance as first argument.
2. An object with `postcss` method. PostCSS will use this method
   as function format below.
3. Other `PostCSS` instance. PostCSS will copy plugins from there.

Plugin function should change `Root` from first argument or return new `Root`.

```js
processor.use(function (css) {
    css.prepend({ name: 'charset', params: '"UTF-8"' });
});
processor.use(function (css) {
    return postcss.root();
});
```

#### `process(css, opts)`

This is a main method of PostCSS. It will parse CSS to `Root`, send this root
to each plugin and then return `Result` object from transformed root.

```js
var result = processor.process(css, { from: 'a.css', to: 'a.out.css' });
```

Input CSS formats are:

* String with CSS.
* `Result` instance from other PostCSS processor. PostCSS will take already
  parsed root from it.
* Any object with `toString()` method. For example, file stream.

Options:

* `from` is a path to input CSS file. You should always set `from`,
  because it is used in map generation and in syntax error messages.
* `to` is a path to output CSS file. You should always set `to` to generates
  correct source map.
* `safe` enables [Safe Mode] when PostCSS will try to fix CSS syntax errors.
* `map` is a object with [source map options].

[source map options]: https://github.com/postcss/postcss#source-map-1

## `Result` class

There is a two way to get `Result` instance. `PostCSS#process(css, opts)`
returns it or you can call `Root#toResult(opts)`.

```js
var result1 = postcss().process(css);
var result2 = postcss.parse(css).toResult();
```

#### `root`

This property contains source `Root` instance.

```js
root.toResult().root == root;
```

#### `opts`

Options from `PostCSS#process(css, opts)` or `Root#toResult(opts)` call.

```js
postcss().process(css, opts).opts == opts;
```

#### `css`

Lazy method, that will stringify `Root` instance to CSS string on first call
and generates source map to `map` property if it is necessary.

```js
postcss().process('a{}').css //=> "a{}"
```

#### `map`

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

## List module

Contains helper to split CSS values.

```js
var list = require('postcss/lib/list');
```

#### `list.space`

Splits values by space with brackets and quotes:

```js
list.split('1px calc(10% + 1px) "border radius"')
//=> ['1px', 'calc(10% + 1px)', '"border radius"']
```

#### `list.comma`

Splits values by comma with brackets and quotes:

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

#### `file`

Absolute path to CSS source file from `from` option.

```js
var root  = postcss.parse(css, { from: 'a.css' });
root.source.input.file //=> '/home/ai/a.css'
```

#### `id`

Unique ID of CSS source if user missed `from` and we didn’t know file path.

```js
var root  = postcss.parse(css);
root.source.input.file //=> undefined
root.source.input.id   //=> <input css 1>
```

#### `from`

Contains `file` if user set `from` option or `id` if he didn’t.

```js
var root  = postcss.parse(css, { from: 'a.css' });
root.source.input.file //=> '/home/ai/a.css'

var root  = postcss.parse(css);
root.source.input.from //=> <input css 1>
```

#### `map`

Represents input source map from compilation step before PostCSS, which
generated input CSS (from example, from Sass compiler).

It is used in PostCSS map generator, but `consumer()` method will be helpful
for plugin developer, because it returns instance of `SourceMapConsumer` class
from [source-map] library.

```js
root.source.input.map.consumer().sources //=> ['a.sass']
```

[source-map]: https://github.com/mozilla/source-map

#### `origin(line, column)`

Use input source map to get symbol position in first source
(for example, in Sass):

```js
root.source.input.origin(1, 1) //=> { source: 'a.css', line: 3, column: 1 }
```

## Nodes common methods

All node classes has many common methods.

#### `type`

Return string with node’s type. It can be `root`, `atrule`, `rule`, `decl`
or `comment`.

```js
postcss.decl({ prop: 'color', value: 'black' }).type //=> 'decl'
```

#### `parent`

Link to parent node.

```js
root.nodes[0].parent == root;
```

#### `source`

Represents origin source of node and used in map generation.
It contains `Input` instance in `source.input` property.

```js
decl.source //=> { input: { … }, line: 10, column: 4 }
```

If you will create node manually (for example, by `postcss.decl()`) it will not
have a `source` property and will be missed in source map.
So plugin developer should clone nodes (it saves `source`)
or set `source` manually:

```js
var rule = postcss.rule({ selector: 'a', source, atrule.source });
atrule.parent.insertBefore(atrule, rule);
```

#### `toString()`

Stringify node to CSS string.

```js
postcss.decl({ prop: 'color', value: 'black' }) //=> color: black
```

#### `error(message)`

Returns `CssSyntaxError` instance with position of current node. It will use
input source map to get origin position even from compiltion step before PostCSS
(for example, in Sass file). Error message with also contains small example of
source code.

```js
if ( !variables[name] ) {
    throw decl.error('Unknown variable ' + name);
    // CssSyntaxError: a.sass:4:1: Unknown variable $black
    // a
    //   color: $black
    //   ^
    //   background: white
}
```

You can use this method also for warnings:

```js
if ( oldSyntax.check(decl) ) {
    console.warn( decl.error('Old syntax for variables').message );
    // a.sass:4:1: Old syntax for variables
}
```

#### `next()` and `prev()`

Return next/previous children of node parent. Return `undefined` if there
is not child there.

```js
var annotation = decl.prev();
if ( annotation.type == 'comment' ) {
    readAnnotation( annotation.text );
}
```

#### `root()`

Return `Root` instance of current nodes tree.

```js
node.root().type //=> 'root'
```

#### `removeSelf()`

Remove self from parent and clean `parent` property in it and children.

```js
if ( decl.prop.match(/^-webkit-/) ) {
    decl.removeSelf();
}
```

#### `replaceWith(otherNode)`

Insert other node before and remove self.

```js
if ( atrule.name == 'mixin' ) {
    atrule.replaceWith(mixinRules[atrule.params]);
}
```

#### `clone(props)`

Clone node, clean `parent` and code style propeties in it and children
and set new values to propeties from `props` object.


```js
var clonded = decl.clone({ prop: '-moz-' + decl.prop });
cloned.before     //=> undefined
cloned.parent     //=> undefined
cloned.toString() //=> -moz-transform: scale(0)
```

#### `cloneBefore(props)` and `cloneAfter(props)`

Shortcut to clone node and insert clone before/after current node.

```js
decl.cloneBefore({ prop: '-moz-' + decl.prop });
```

#### `moveTo(newParent)`

Remove node from current parent and insert it to the end
of `newParent` children.

It will cleans `before` and `after` code style properties to use new indentation in new parent. If will clean `between` property if new parent is in other root.

```js
atrule.moveTo(atrule.parent.parent);
```

#### `moveBefore(otherNode)` and `moveAfter(otherNode)`

Remove node from current parent and insert it to new parent
before/after `otherNode`.

It will also clean code style properties as `moveTo(newParent)` did.

#### `style(prop)`

Return code style property value. If node code style properties will be missed
(like from manually built nodes or from clones), PostCSS will try to autodetect
it by other nodes.

```js
var root = postcss.parse('a { background: white }');
root.nodes[0].append({ prop: 'color', value: 'black' });
root.nodes[0].nodes[1].style('before') //=> ' '
```

If PostCSS can’t find any nodes to take a code style, it will use default
values from `node.defaultStyle` object.

```js
postcss.decl({ prop: 'color', value: 'black' }).style('before') //=> '\n    '
```

## Containers common methods

`Root`, `AtRule` and `Rule` classes has some common methods
to works with children.

#### `nodes`

Array with node children.

```js
var root = postcss.parse('a { color: black }');
root.nodes.length           //=> 1
root.nodes[0].selector      //=> 'a'
root.nodes[0].nodes[0].prop //=> 'color'
```

#### `first`

Shortcut to get first child.

```js
rule.first == rules.nodes[0];
```

#### `last`

Shortcut to get last child.

```js
rule.last == rule.nodes[rule.nodes.length - 1];
```

#### `index(child)`

Returns index in `nodes` of container’s child:

```js
rule.index( rule.nodes[2] ) //=> 2
```

#### `every(callback)` and `some(callback)`

Return `true` if `callback` will return `true` on all/one children.

```js
var noPrefixes = rule.every(function (decl) {
    return decl.prop[0] != '-';
});
var hasPrefix = rule.some(function (decl) {
    return decl.prop[0] == '-';
});
```

#### `each(callback)`

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

Iteration is safe for node array changes by container’s method:

```js
var root = postcss.parse('a { color: black; z-index: 1 }');
var rule = root.first;

for ( var i = 0; i < rule.nodes.length; i++ ) {
    var decl = rule.nodes[0];
    decl.cloneBefore({ prop: '-webkit-' + decl.prop });
    // Cycle will be infinite, because cloneBefore move current node
    // to next index
}

rule.each(function (decl) {
    decl.cloneBefore({ prop: '-webkit-' + decl.prop });
    // Will be executed only for color and z-index
});
```

Callback will receive 2 arguments with child instance and node index number.

#### `eachInside(callback)`

Recursive iterates through children and children of children.

```js
root.eachInside(function (node) {
    // Will be iterate through all nodes
});
```

Is is also safe as `each` method.

#### `eachDecl(prop, callback)`

Recursive iterates through all declaration inside container.

```js
root.eachDecl(function (decl) {
    if ( decl.prop.match(/^-webkit-/) ) decl.removeSelf();
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

Is is also safe as `each` method.

#### `eachAtRule(name, calllback)`

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
    if ( first ) {
        rule.removeSelf();
    } else {
        first = true;
    }
});
```

Is is also safe as `each` method.

#### `eachRule(callback)`

Recursive iterates through all rules inside container.

```js
var selectors = [];
root.eachRule(function (rule) {
    selectors.push(rule.selector);
});
console.log('You CSS uses ' + selectors.length + ' selectors');
```

Is is also safe as `each` method.

#### `eachComment(callback)`

Recursive iterates through all comments inside container.

```js
root.eachComment(function (comment) {
    comment.removeSelf();
})
```

Is is also safe as `each` method.

#### `replaceValues(regexp, opts, callback)`

Replaces some regexp in all declaration’s values inside container.
It is useful to add some custom unit for function. Callback will receive
same argument as in `String#replace`.

You can make it faster by `fast` option. PostCSS will execute slow
regexp only if `value.indexOf(opts.fast) != -1` will return `true`.
Also you can set a declaration properties array in `props` option.

```js
root.replaceValues(/\d+rem/, { fast: 'rem' }, function (string) {
    return 15 * parseInt(string) + 'px';
});
```

#### `prepend(node)` and `append(node)`

Inserts a new node to start/end.

```js
var decl = postcss.decl({ prop: 'color', value: 'black' });
rule.append(decl);
```

Because node typs has unique property, you can use shortcut.

```js
rule.append({ prop: 'color', value: 'black' });
```

#### `insertBefore(oldNode, newNew)` and `insertAftr(oldNode, newNew)`

Inserts `newNode` before/after `oldNode`. Old node can be index or node instance.

```js
rule.insertBefore(decl, decl.clone({ prop: '-webkit-' + decl.prop }));
```

You can also use shortcut-style here like in `prepend()` method.

#### `remove(node)`

Removes `node` from container and clean `parent` properties in node
and node’s children.

```js
rule.nodes.length  //=> 5
rule.remove(decl);
rule.nodes.length  //=> 4
decl.parent        //=> undefined
```

You can use node instance or node index in `node`.

#### `removeAll()`

Removes all children from contain and clean their `parent` properties.

```js
rule.removeAll();
rule.nodes.length //=> 0
```
