# PostCSS [![Build Status](https://travis-ci.org/postcss/postcss.png)](https://travis-ci.org/postcss/postcss)

<img align="right" width="95" height="95" src="http://postcss.github.io/postcss/logo.png" title="Philosopher's stone, logo of PostCSS">

PostCSS is a framework for CSS postprocessors,
to modify CSS with JavaScript with full source map support.

It takes care of most common CSS tool tasks:

1. parses CSS;
2. gives you usable JS API to edit CSS node tree;
3. dumps modified node tree into CSS string;
4. generates (or modifies existent) source map for your changes;

You can use this framework to write you own:

* CSS minifier or beautifier.
* CSS polyfills.
* Grunt plugin to generate sprites, include `data-uri` images
  or any other works.
* Text editor plugin to automate CSS routine.
* Command-line CSS tool.

Sponsored by [Evil Martians](http://evilmartians.com/).

## Built with PostCSS

### Tools

* [Autoprefixer] adds vendor prefixes by [Can I Use] data.
* [css2modernizr] analyzes your CSS and output only used [Modernizr]’s settings.
* [CSS MQPacker] joins same media queries.
* [CSSWring] and [grunt-csswring] CSS minifier with full source map support.
* [data-separator] splits data-uri into a separate CSS file.
* [grunt-pixrem], `rem` unit polyfill.
* [grunt-webpcss] to duplicate images in CSS to WebP for supported browsers.
* [Pleeease] is a pack of various postprocessors.
* [Pleeease Filters] converts WebKit filters to SVG filter for other browsers.
* [RTLCSS] mirrors styles for right-to-left locales.


[Autoprefixer]:     https://github.com/ai/autoprefixer
  [Can I Use]:      http://caniuse.com/
[css2modernizr]:    https://github.com/vovanbo/css2modernizr
  [Modernizr]:      http://modernizr.com/
[CSS MQPacker]:     https://github.com/hail2u/node-css-mqpacker
[CSSWring]:         https://github.com/hail2u/node-csswring
[data-separator]:   https://github.com/Sebastian-Fitzner/grunt-data-separator
[grunt-csswring]:   https://github.com/princed/grunt-csswring
[grunt-pixrem]:     https://github.com/robwierzbowski/grunt-pixrem
[grunt-webpcss]:    https://github.com/lexich/grunt-webpcss
[Pleeease]:         http://pleeease.io/
[Pleeease Filters]: https://github.com/iamvdo/pleeease-filters
[RTLCSS]:           https://github.com/MohammadYounes/rtlcss

### Plugins

* [postcss-calc] to reduce `calc()` usage (recommanded with
  `postcss-custom-properties`).
* [postcss-custom-properties] to polyfill the W3C-style
  CSS Custom Properties for cascading variables.

[postcss-calc]:              https://github.com/postcss/postcss-calc
[postcss-custom-properties]: https://github.com/postcss/postcss-custom-properties


## Quick Example

Let’s fix forgotten `content` property in `::before` and `::after`:

```js
var postcss = require('postcss');

var contenter = postcss(function (css) {
    css.eachRule(function (rule) {
        if ( rule.selector.match(/::(before|after)/) ) {
            // In every ::before/::after rule

            // Did we forget content property?
            var good = rule.some(function (i) { return i.prop == 'content'; });

            if ( !good ) {
                // Add content: "" if we forget it
                rule.prepend({ prop: 'content', value: '""' });
            }

        }
    });
});
```

And then CSS with forgotten `content`:

```css
a::before {
    width: 10px;
    height: 10px
}
```

will be fixed by our new `contenter`:

```js
var fixed = contenter.process(css).css;
```

to:

```css
a::before {
    content: "";
    width: 10px;
    height: 10px
}
```

## Features

### Source Map

PostCSS generates source map for its changes:

```js
result = processor.process(css, { map: true, from: 'from.css', to: 'to.css' });
result.css // String with processed CSS
result.map // Source map
```

And modifies source map from previous step (like Sass preprocessor):

```js
var sass = compiler.compile(sass);

processor.process(sass.css, {
    map:  { prev: sass.map },
    from: 'from.sass.css',
    to:   'to.css'
});
```

### Preserves code formatting and indentations

PostCSS will not change any byte of a rule if you don’t modify its node:

```js
postcss(function (css) { }).process(css).css == css;
```

And when you modify CSS nodes, PostCSS will try to copy coding style:

```js
contenter.process("a::before{color:black}")
// a::before{content:'';color:black}

contenter.process("a::before {\n  color: black;\n  }")
// a::before {
//   content: '';
//   color: black;
//   }
```

It allows to use PostCSS in text editor plugin and preserve user code style.

## Why PostCSS Better Than …

### Preprocessors

Preprocessors (like Sass or Stylus) give us special language with variables,
mixins, statements and compile it to CSS. Compass, nib and other mixins
libraries use these languages to work with prefixes, sprites and inline images.

But Sass and Stylus languages were created to be syntax-sugar for CSS.
Writing really complicated programs using preporcessor languages
is very difficult. [Autoprefixer] is absolutely impossible to implement
on top of Sass.

PostCSS gives you comfort and power of JS or CoffeeScript to working with CSS.
You can do really magic things with wide range of [npm] libraries.

But postprocessors are not enemies for preprocessors. Sass and Stylus are still
the best way to improve readability and add some syntax sugar to CSS.
You can easily combine preprocessors and postprocessors
(and PostCSS will also update source map from Sass or Stylus).

[Autoprefixer]: https://github.com/ai/autoprefixer
[npm]:          https://npmjs.org/

### RegExp

Some Grunt plugins modify CSS with regular expressions but using a CSS parser
and a node tree is a much safer way to edit CSS. Also, regexps will break
source maps generated by preprocessors.

### CSS Parsers

There are a lot of good CSS parsers, like [Gonzales]. But they help you only
with first step.

Unlike them PostCSS gives you full source map support and useful high level API
(for example, safe iterators).

[Gonzales]: https://github.com/css/gonzales

### Rework

[Rework] and PostCSS are very similar, but they has different targets.

Rework was created to build new CSS sublanguage to replace Stylus (like [Myth]).
PostCSS was created for CSS tools, which works in chain with legacy CSS code
(like Autoprefixer).

Because of this background difference, PostCSS:

* Better works with source map, because it should update map from previous step
  (like Sass compiling).
* Saves all your spaces and code style, because it can be worked in text editor
  plugins.
* Has safer parser, because it can be used for legacy code. Only PostCSS can
  parse all hacks from [Browserhacks.com](http://browserhacks.com/).
* Has high level API to clean your processor from common tasks.

[Myth]:   http://www.myth.io/
[Rework]: https://github.com/visionmedia/rework

## Usage

You can parse CSS by `postcss.parse()` method, which returns CSS AST:

```js
var postcss = require('postcss');

var css = postcss.parse('a { color: black }');
```

Then you can change this AST. Use `css.list` to get childs.
Properties `rule.selector`, `decl.prop`, `decl.value`, `atrule.name`
and `atrule.params` contain data.

Don’t use underscore properties (like `_selector`, `_params` and `_value`),
because they are only for comments save magic
(See [Raw Properties](#raw-properties) below). Use getters and setters instead
(like `selector`, `selectors`, `params` and `value`).

```js
css.list[0].value = 'white';
```

After changes you can get new CSS and modification’s source map:

```js
var result = css.toResult(options);

result.css //=> 'a { color: white }'
result.map //=> '{"version":3, … }'
```

Methods `postcss.parse()` and `CSS#toResult()` are low level API, for most cases
it will be better to create processors with simplier API and chaining.

### Processor

The function `postcss(fn)` creates a processor from your function:

```js
var postcss = require('postcss');

var processor = postcss(function (css) {
    // Code to modify CSS
});
```

If you want to combine multiple processors (and parse CSS only once),
you can add several functions using the `use(fn)` method:

```js
var all = postcss().
          use(prefixer).
          use(minifing);
```

Processor function can change the current CSS node tree:

```js
postcss(function (css) {
    css.append( /* new rule */ )
});
```

or create a completely new CSS root node and return it instead:

```js
postcss(function (css) {
    var newCSS = postcss.root()
    // Add rules and declarations
    return newCSS;
});
```

This generated processor transforms some CSS using `process(css, opts)` method:

```js
var doubler = postcss(function (css) {
    // Clone each declaration
    css.eachDecl(function (decl) {
        decl.parent.prepend( decl.clone() );
    });
});

var css    = "a { color: black; }";
var result = doubler.process(css);

result.css //=> "a { color: black; color: black; }"
```

You can set the original CSS filename via `from` option and make syntax error
messages much more helpful:

```js
var wrong = "a {";
processor.process(wrong, { from: 'main.css' });
//=> Can't parse CSS: Unclosed block at line 1:1 in main.css
```

You can also use result from previous postprocessor or already parsed `Root`
as argument in next one:

```js
result = processor1.process(css)
processor2.process(result)
```

### Multiple Inputs

The function `postcss()` generates processor only for one input.
If you need to process several inputs (like in files concatenation) you can use
`postcss.parse()`.

Let’s join two CSS with source map support in 5 lines of code:

```js
var file1 = postcss.parse(css1, { from: 'a.css' });
var file2 = postcss.parse(css2, { from: 'b.css' });

file1.append( file2 );

var result = file1.toResult({ to: 'app.css', map: true });
```

### Source Map

With [source maps], browser’s development tools will show you origin position
of your styles. For example, inspector will show position in Sass file,
even if you compile it to CSS, concatenate and minify it.

To generate correct source map every CSS processing step should update map from
previous step. Sass compiler should generate first map, concatenation tool
should update map from Sass step and minifier should update map from concat.

There is 2 way to store map:

* You can put it to separated file and add special annotation comment
  with map path to CSS:

  ```css
 a { }
 /*# sourceMappingURL=main.out.css.map */
  ```
* Or you can inline map to CSS annotation comment by base64:

  ```css
 a { }
 /*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5taW4uY3NzIiwic291cmNlcyI6WyJtYWluLmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFLIn0= */
  ```

PostCSS has great source map support. You must set input and output CSS files
paths (using `from` and `to` options respectively) to generate correct source
map.

To generate new source map with default options just set `map: true` option in
`processor.process(css, opts)`.

```js
var result = processor.process(css, {
    from: 'main.css',
    to:   'main.out.css'
    map:  true,
});

result.map //=> '{"version":3,"file":"main.out.css","sources":["main.css"],"names":[],"mappings":"AAAA,KAAI"}'

fs.writeFileSync('main.out.css',     result.css);
fs.writeFileSync('main.out.css.map', result.map);
```

Or set `from` in `postcss.parse(css, opts)` and `to` in `root.toResult(opts)`:

```js
var root = postcss.parse(css, { from: 'main.css' });
root.last.removeSelf();

var result = root.toResult({ to: 'main.out.css' });
fs.writeFileSync('main.out.css',     result.css);
fs.writeFileSync('main.out.css.map', result.map);
```

If PostCSS will find source map in previous CSS, it will automatically update
it with same options.

```js
// main.sass.css has annotation comment with link to main.sass.css.map
var result = minifier.process(css, { from: 'main.sass.css', to: 'main.min.css' });
result.map //=> Source map from main.sass to main.min.css
```

If you want to control map generation you can set object with parameters
to `map` option:

* `inline` (boolean): should we inline map to CSS annotation comment.
  By default, PostCSS will inline new maps only if map was inlined
  in previous CSS.

  If you inline map, `result.map` will be empty, because map will be
  in `result.css` text.

  You can shortcut `map { inline: true }` to `map: 'inline'`.

* `prev` (strong or object): map content from previous processing step
  (like Sass compilation). PostCSS will try to read previous map automatically
  by annotation comment in origin CSS, but you can set it manually. Also you can
  remove previous map by `prev: false`.

  This option is only one map option, which can be passed
  to `postcss.parse(css, opts)`. Other options is for `toResult(opts)`
  or `process(css, opts)` method.

* `sourcesContent` (boolean): should we set origin content (for example,
  Sass source) to map. By default, PostCSS will add content only if previous map
  contains it.

* `annotation` (boolean or string): should we add annotation comment to CSS.
  By default, PostCSS always adds annotation with path to map. But if all
  previous CSS have not annotation, PostCSS will miss it too.

  By default, PostCSS thinks, that you will save map to `opts.to + '.map'`,
  and uses this path in annotation. But you can set another path as string value
  in `annotation` option.

  If you set `inline: true`, of cource, you will not be able disable annotation.

[source maps]: http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/

### Safe Mode

If you will set `safe: true` option to `process` or `parse` methods,
PostCSS will try to fix any syntax error, that it founds in CSS.
For example, it will parse `a {` as `a {}`.

```js
postcss.parse('a {');                 // will throw "Unclosed block"
postcss.parse('a {', { safe: true }); // will return CSS root for a {}
```

It is useful for legacy code with a lot of hack. Other use case is a interactive
tools with live input, like
[Autoprefixer demo](http://jsfiddle.net/simevidas/udyTs/show/light/).

### Helpers

#### Vendor

PostCSS contains heigh optimized code to split vendor prefix:

```js
var vendor = require('postcss/lib/vendor');

vendor.prefix('-moz-tab-size')     //=> '-moz-'
vendor.unprefixed('-moz-tab-size') //=> 'tab-size'
```

#### List

To safely split comma- or space-separated values (like in `background-image`
or `transform` ) with brackets and quotes support you can use `list` helper:

```js
var list = require('postcss/lib/list');

list.space(image.value)     //=> ['linear-gradient(white, black)', 'blue']
list.comma(transform.value) //=> ['color 200ms', 'background 200ms']
```

### Nodes

Processor function receives `Root` node with CSS node tree inside.

```js
var processor = postcss(function (cssRoot) {
});
```

There are 4 types of child nodes: `Comment`, `AtRule`, `Rule` and `Declaration`.
All nodes have `toString()` and `clone()` methods.

You can parse CSS and get a `Root` node by `postcss.parse(css, opts)` method:

```js
var cssRoot = postcss.parse('a { }');
```

All node‘s methods return current node, so you can build nice method chains:

```js
root.append( rule1 ).append( rule2 ).toString();
```

### Node Source

Every node stores its origin file (if you set `from` option to `process`
or `parse` method) and position:

```js
var root = postcss.parse(css, { from: 'main.css' });
var rule = root.rules[0];

rule.source.file  //=> 'main.css'
rule.source.start //=> { line: 5,  position: 1 }
rule.source.end   //=> { line: 10, position: 5 }
```

### Whitespaces

All nodes (exclude `Root`) have `before` property with indentation
and all earlier spaces.

Nodes with children (`Root`, `AtRule` and `Rule`) contain also `after` property
with spaces after last child and before `}` or end of file.

Every `Declaration` has `between` property with colon, spaces and comments
between property name and value. `Rule` stores spaces and comments between
selector and `{` in `between` property. `AtRule` uses `between` also to store
spaces and comments before `{` or `;` for bodiless at-rule.

```js
var root = postcss.parse("a {\n  color: black;\n}\n");

root.rules[0].between          //=> " " between selector and {
root.rules[0].decls[0].before  //=> "\n  " before color: black
root.rules[0].decls[0].between //=> ": " between property name and value
root.rules[0].after            //=> "\n" before }
root.after                     //=> "\n" from end of file
```

The simplest way to minify CSS is to set `before`, `between` and `after`
properties to an empty string:

```js
var minifier = postcss(function (css) {
    css.eachDecl(function (decl) {
        decl.before  = '';
        decl.between = ':';
    });
    css.eachRule(function (rule) {
        rule.before  = '';
        rule.between = '';
        rule.after   = '';
    });
    css.eachAtRule(function (atRule) {
        atRule.before  = '';
        atRule.between = '';
        atRule.after   = '';
    });
    css.eachComment(function (comment) {
        comment.removeSelf();
    });
});

var css = "a {\n  color:black\n}\n";
minifier.process(css).css //=> "a{color:black}"
```

### Raw Properties

Some CSS values (selectors, comment text, at-rule params and declaration values)
can contain comments. PostCSS will clean them from trailing spaces for you:

```js
var root = postcss.parse("a /**/ b {}");
var rule  = root.rules[0];

rule.selector      //=> 'a  b' trimmed and cleaned from comments
rule._selector.raw //=> 'a /**/ b' original raw value
```

But PostCSS saves raw content to be able to stringify it to CSS, if you don’t
change origin value. As you can remember, PostCSS tries to save origin CSS
byte-to-byte, when it’s possible:

```js
rule.toString() //=> 'a /**/ b {}' with comment

rule.selector = '.link b';
rule.toString() //=> '.link b {}' you change value and origin comment was gone
```

### Containers

`Root`, `AtRule` and `Rule` nodes can contain children in `rules` or `decls`
property.

There are common method to work with children:

* `append(newChild)` to add child at the end of children list.
* `prepend(newChild)` to add child at the beginning of children list.
* `insertBefore(existsChild, newChild)` to insert new child before some
   existent child.
* `insertAfter(existsChild, newChild)` to insert new child after some
   existent child.
* `remove(existsChild)` to remove child.
* `index(existsChild)` to return child index.
* `some(fn)` to return true if `fn` returns true on any child.
* `every(fn)` to return true if `fn` returns true on all children.

Methods `append`, `prepend`, `insertBefore` and `insertAfter` can receive
arrays and `Root` as new child argument.

Methods `insertBefore`, `insertAfter` and `remove` can receive child node
or child index as an `existsChild` argument. Have in mind that child index works
much faster.

There are two shorcuts to get first and last child:

```js
rule.first //=> First declaration in rule
rule.last  //=> Last declaration in rule
```

### Children

`Comment`, `AtRule`, `Rule` and `Declaration` nodes should be wrapped
in other nodes.

All children contain `parent` property with parent node:

```js
rule.decls[0].parent == rule;
```

All children has `removeSelf()` method:

```js
rule.decls[0].removeSelf();
```

But `remove(index)` in parent with child index is much faster:

```js
rule.each(function (decl, i) {
    rule.remove(i);
});
```

### Iterators

All parent nodes have `each` method to iterate over children nodes:

```js
root = postcss.parse('a { color: black; display: none }');

root.each(function (rule, i) {
    if ( rule.type == 'rule' ) {
        console.log(rule.selector, i); // Will log "a 0"
    }
});

root.rules[0].each(function (decl, i) {
    if ( rule.type != 'comment' ) {
        console.log(decl.prop, i); // Will log "color 0" and "display 1"
    }
});
```

Unlike `for {}`-cycle construct or `Array#forEach()` this iterator is safe.
You can mutate children while iteration and it will fix current index:

```js
rule.rules.forEach(function (decl, i) {
    rule.prepend( decl.clone() );
    // Will be infinity cycle, because on prepend current declaration become
    // second and next index will go to current declaration again
});

rule.each(function (decl, i) {
    rule.prepend( decl.clone() );
    // Will work correct (once clone each declaration), because after prepend
    // iterator index will be recalculated
});
```

Because CSS have nested structure, PostCSS also contains recursive iterator
`eachInside`:

```js
root.eachInside(function (node, i) {
    console.log(node.type + ' inside ' + node.parent.type);
});
```

There are also shortcuts to recursive iterate all nodes of specific type:

```js
root.eachDecl(function (decl, i) {
    // Each declaration inside root
});

root.eachRule(function (rule, i) {
    // Each rule inside root and any nested at-rules
});

root.eachAtRule(function (atRule, i) {
    // Each at-rule inside root and any nested at-rules
});

root.eachComment(function (comment, i) {
    // Each comment inside root
})
```

You can break iteration by `return false`.

### Root Node

`Root` node contains entire CSS tree. Its children can be only `Comment`,
`AtRule` or `Rule` nodes in `rules` property.

You can create a new root using shortcut:

```js
var root = postcss.root();
```

Method `toString()` stringifies entire node tree to CSS string:

```js
root = postcss.parse(css);
root.toString() == css;
```

If PostCSS found previous source map, it will save all information
in `Root#prevMap`:

```
root = postcss.parse(css);
if (root.prevMap && root.prevMap.inline) {
    console.log('Inlined map: ' + root.prevMap.annotation)
}
```

### Comment Node

```css
/* Block comment */
```

PostCSS creates `Comment` nodes only for comments between rules or declarations.
Comments inside selectors, at-rules params, declaration values will be stored
in Raw property.

`Comment` has only one property: `text` with trimmed text inside comment.

```js
comment.text //=> "Block comment"
```

You can create a new comment using shortcut:

```js
var comment = postcss.comment({ text: 'New comment' });
```

### AtRule Node

```css
@charset 'utf-8';

@font-face {
    font-family: 'Cool'
}

@media print {
    img { display: none }
}
```

`AtRule` has two own properties: `name` and `params`.

As you see, some at-rules don’t contain any children (like `@charset`
or `@import`), some of at-rules can contain only declarations
(like `@font-face` or `@page`), but most of them can contain rules
and nested at-rules (like `@media`, `@keyframes` and others).

Parser selects `AtRule` content type by its name. If you create `AtRule`
node manually, it will detect own content type with new child type on first
`append` or other add method call:

```js
var atRule = postcss.atRule({ name: '-x-animations' });
atRule.rules        //=> undefined
atRule.decls        //=> undefined

atRule.append( postcss.rule({ selector: 'from' }) );
atRule.rules.length //=> 1
atRule.decls        //=> undefined
```

You can create a new at-rule using shortcut:

```js
var atRule = postcss.atRule({ name: 'charset', params: 'utf-8' });
```

### Rule Node

```css
a {
    color: black;
}
```

`Rule` node has `selector` property and contains `Declaration` and `Comment`
children in `decls` property.

There is `selectors` shortcut, which return array:

```js
rule.selector  //=> "a, b"
rule.selectors //=> ['a', 'b']
```

You can miss `Declaration` constructor in `append` and other insert methods:

```js
rule.append({ prop: 'color', value: 'black' });
```

Property `semicolon` indicates if last declaration in rule has semicolon or not:

```js
var root = postcss.parse('a { color: black }');
root.rules[0].semicolon //=> false

var root = postcss.parse('a { color: black; }');
root.rules[0].semicolon //=> true
```

You can create a new rule using shortcut:

```js
var rule = postcss.rule({ selector: 'a' });
```

### Declaration Node

```css
color: black
```

`Declaration` node has `prop`, `value` and `important` properties.

You can create a new declaration using this shortcut:

```js
var decl = postcss.decl({ prop: 'color', value: 'black' });
```

Or use short form in rule’s `append()` and other add methods:

```js
rule.append({ prop: 'color', value: 'black' });
```
