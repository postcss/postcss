# PostCSS [![Build Status](https://travis-ci.org/postcss/postcss.png)](https://travis-ci.org/postcss/postcss)

<img align="right" width="95" height="95" src="http://postcss.github.io/postcss/logo.png" title="Philosopher’s stone, logo of PostCSS">

PostCSS is a framework for CSS postprocessors,
to modify CSS with JavaScript with full source map support.

It takes care of the most common CSS tool tasks:

1. parses CSS;
2. provides a usable JS API to edit CSS node trees;
3. dumps the modified node tree into a CSS string;
4. generates a source map (or modifies an pre-existing source map) containing your changes;

You can use this framework to write your own:

* CSS minifier or beautifier.
* CSS polyfills.
* Grunt plugin to generate sprites, include `data-uri` images
  or any other work.
* Text editor plugin to automate CSS routines.
* Command-line CSS tool.

Sponsored by [Evil Martians](http://evilmartians.com/).

## Built with PostCSS

### Tools

* [Autoprefixer] adds vendor prefixes by Can I Use data.
* [BEM linter] lints CSS for SUIT CSS methodology.
* [CSS MQPacker] joins same media queries.
* [css2modernizr] analyzes your CSS and output only used Modernizr’s settings.
* [cssnext] is a transpiler (CSS4+ to CSS3) that allow you to use tomorrow’s
  CSS syntax today.
* [CSSWring] is a CSS minifier with full source map support.
* [data-separator] splits data-uri into a separate CSS file.
* [pixrem] is a `rem` unit polyfill.
* [webpcss] to duplicate images in CSS to WebP for supported browsers.
* [Pleeease] is a pack of various postprocessors.
* [Pleeease Filters] converts WebKit filters to SVG filter for other browsers.
* [RTLCSS] mirrors styles for right-to-left locales.
* [CSS Byebye] explicitly removes the CSS rules that you don't want.

[Autoprefixer]:      https://github.com/postcss/autoprefixer
[BEM linter]:        https://github.com/necolas/postcss-bem-linter
[CSS MQPacker]:      https://github.com/hail2u/node-css-mqpacker
[css2modernizr]:     https://github.com/vovanbo/css2modernizr
[cssnext]:           https://github.com/putaindecode/cssnext
[CSSWring]:          https://github.com/hail2u/node-csswring
[data-separator]:    https://github.com/Sebastian-Fitzner/grunt-data-separator
[pixrem]:            https://github.com/robwierzbowski/node-pixrem
[webpcss]:           https://github.com/lexich/webpcss
[Pleeease]:          http://pleeease.io/
[Pleeease Filters]:  https://github.com/iamvdo/pleeease-filters
[RTLCSS]:            https://github.com/MohammadYounes/rtlcss
[CSS Byebye]:        https://github.com/AoDev/css-byebye

### Plugins

* [postcss-calc] to reduce `calc()` usage
  (recommanded with `postcss-custom-properties`).
* [postcss-color-function] to transform `color()` function.
* [postcss-color-gray] to transform `gray()` function.
* [postcss-color-hex-alpha] to transform hexadecimal notations with alpha
  (`#rrggbbaa` or `#rgba`).
* [postcss-color-hwb] to transform `hwb()` function.
* [postcss-color-rebeccapurple] to transform `rebeccapurple` color.
* [postcss-import] to transform `@import` rules by inlining content.
* [postcss-custom-media] to add names for Media Queries.
* [postcss-custom-properties] to transform Custom Properties
  for cascading variables.
* [postcss-url] to rebase or inline on `url()`.

[postcss-calc]:                 https://github.com/postcss/postcss-calc
[postcss-color-function]:       https://github.com/postcss/postcss-color-function
[postcss-color-gray]:           https://github.com/postcss/postcss-color-gray
[postcss-color-hex-alpha]:      https://github.com/postcss/postcss-color-hex-alpha
[postcss-color-hwb]:            https://github.com/postcss/postcss-color-hwb
[postcss-color-rebeccapurple]:  https://github.com/postcss/postcss-color-rebeccapurple
[postcss-import]:               https://github.com/postcss/postcss-import
[postcss-custom-media]:         https://github.com/postcss/postcss-custom-media
[postcss-custom-properties]:    https://github.com/postcss/postcss-custom-properties
[postcss-url]:                  https://github.com/postcss/postcss-url


## Quick Example

Let’s fix a forgotten `content` property in `::before` and `::after`:

```js
var postcss = require('postcss');

var contenter = postcss(function (css) {
    css.eachRule(function (rule) {
        if ( rule.selector.match(/::(before|after)/) ) {
            // In each ::before/::after rule

            // Did we forget the content property?
            var good = rule.some(function (i) { return i.prop == 'content'; });

            if ( !good ) {
                // Add content: "" if we forget it
                rule.prepend({ prop: 'content', value: '""' });
            }

        }
    });
});
```

And the CSS with a forgotten `content` property:

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

PostCSS generates a source map of its changes:

```js
result = processor.process(css, { map: true, from: 'from.css', to: 'to.css' });
result.css // String with processed CSS
result.map // Source map
```

And modifies a source map from previous steps (for example, a Sass preprocessor):

```js
var sass = compiler.compile(sass);

processor.process(sass.css, {
    map:  { prev: sass.map },
    from: 'from.sass.css',
    to:   'to.css'
});
```

### Preserves code formatting and indentations

PostCSS will not change any byte of a rule, if you do not modify its node:

```js
postcss(function (css) { }).process(css).css == css;
```

And when you modify CSS nodes, PostCSS will try to copy the coding style:

```js
contenter.process("a::before{color:black}")
// a::before{content:'';color:black}

contenter.process("a::before {\n  color: black;\n  }")
// a::before {
//   content: '';
//   color: black;
//   }
```

Which allows you to use PostCSS in text editor plugins while preserving
the user’s code style.

## Why PostCSS Better Than …

### Preprocessors

Preprocessors (like Sass or Stylus) give us special languages with variables,
mixins, and statements, which are compiled to CSS. Compass, nib and other mixins
libraries use these languages to work with prefixes, sprites and inline images.

But the Sass and Stylus languages were created to be syntax-sugar for CSS.
Writing complicated programs using preprocessor languages can be very difficult.
For example, it would be impossible to implement [Autoprefixer] on top of Sass.

PostCSS gives you the comfort and power of JS or CoffeeScript while you are working
with CSS. Applying the depth and variety of [npm]’s libraries allows you to perform
quite magical things using PostCSS.

An important point is that postprocessors are not the enemies of preprocessors.
Preprocessors and postprocessors can be easily combined, so that you can take
advantage of the readability and syntactical sugar offered by Sass and Stylus;
and PostCSS will preserve their source maps.

[Autoprefixer]: https://github.com/postcss/autoprefixer
[npm]:          https://npmjs.org/

### Regular Expressions

Some Grunt plugins modify CSS with regular expressions, however a parser
and its node tree provide a much safer interface to edit CSS. Furthermore,
regular expressions typically break the source maps generated by preprocessors.

### CSS Parsers

There are a lot of good CSS parsers, such as [Gonzales], but they only help you
to read in the CSS. PostCSS provides you with full source map support and a
high level API. Safe iterators, and other features, are unique to PostCSS.

[Gonzales]: https://github.com/css/gonzales

### Rework

[Rework] and PostCSS are very similar, but they have different targets.

Rework was created to build a new CSS sublanguage that replaced Stylus (like [Myth]).
PostCSS was created for CSS tools which work with legacy CSS code (one such
tool is Autoprefixer).

Because of this fundamental difference, PostCSS:

* Handles source map better, because it updates the map from the previous step
  (for example, Sass compilation).
* Preserves all your spaces and code style, so that it can function in text editor
  plugins.
* Has a safer parser, so that it can be used for legacy code. Only PostCSS can
  parse all of the hacks from [Browserhacks.com](http://browserhacks.com/).
* Has a high level API to provide an simple interface for your processor to
  perform typical tasks.

[Myth]:   http://www.myth.io/
[Rework]: https://github.com/visionmedia/rework

## Usage

### Grunt

Grunt plugin [grunt-postcss] allows you to pipe your CSS files through
an array of PostCSS processors.

```js
grunt.initConfig({
    postcss: {
        options: {
            map: true,
            processors: [
                require('autoprefixer-core').postcss,
                require('csswring').postcss
            ]
        },
        dist: {
            src: 'css/*.css'
        }
    }
});

grunt.loadNpmTasks('grunt-postcss');
```

[grunt-postcss]: https://github.com/nDmitry/grunt-postcss

### Gulp

There is a Gulp plugin for PostCSS called [gulp-postcss] that allows you
to pipe your CSS files through an array of PostCSS processors.

Support for external source maps is provided by [gulp-sourcemaps].

```js
var postcss    = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('css', function () {
    var processors = [
        require('autoprefixer-core'),
        require('csswring')
     ];
     return gulp.src('./src/style.css')
        .pipe(sourcemaps.init())
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dest'));
});
```

[gulp-postcss]:    https://github.com/w0rm/gulp-postcss
[gulp-sourcemaps]: https://github.com/floridoo/gulp-sourcemaps

### Webpack

In [webpack] you can use [postcss-loader] to process CSS files through
an array of PostCSS processors.

```js
module.exports = {
    module: {
        loaders: [
            {
                test:   /\.css$/,
                loader: "style-loader!css-loader!postcss-loader"
            }
        ]
    },
    postcss: [require('autoprefixer-core'), require('csswring')]
}
```

[postcss-loader]: https://github.com/postcss/postcss-loader
[webpack]:        http://webpack.github.io/

## Write Own Processor

You can parse CSS with the `postcss.parse()` method, which returns a CSS AST:

```js
var postcss = require('postcss');

var css = postcss.parse('a { color: black }');
```

You can easily make changes to this AST. Use `css.list` to get children.
Properties `rule.selector`, `decl.prop`, `decl.value`, `atrule.name`
and `atrule.params` contain data.

Try to avoid using underscore-prefixed properties (such as `_selector`, `_params` and `_value`),
as they are used for comment-preserving magic
(See [Raw Properties](#raw-properties) below). Use the getters and setters instead
(for example, `selector`, `selectors`, `params` and `value`).

```js
css.list[0].value = 'white';
```

After changes have been made you can get the new CSS and a source map reflecting
the modifications:

```js
var result = css.toResult(options);

result.css //=> 'a { color: white }'
result.map //=> '{"version":3, … }'
```

The methods `postcss.parse()` and `CSS#toResult()` are part of a low level API, and -
in most cases - it will be better to create processors with a simpler API and chaining.

### Processor

The function `postcss(fn)` creates a processor from your function:

```js
var postcss = require('postcss');

var processor = postcss(function (css, opts) {
    // Code to modify CSS
});
```

If you want to combine multiple processors (and parse the CSS only once),
you can add several functions using the `use(fn)` method:

```js
var all = postcss().
          use(prefixer).
          use(minifing);
```

You can also add processor objects with the `postcss` function:

```js
postcss().use( autoprefixer.postcss ); // via function
postcss().use( autoprefixer );         // via object
```

A processor function can change the current CSS node tree:

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

This generated processor transforms some CSS using the `process(css, opts)` method:

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

You can change the original CSS filename via the `from` option, which
can make syntax error more helpful:

```js
var wrong = "a {";
processor.process(wrong, { from: 'main.css' });
//=> Can't parse CSS: Unclosed block at line 1:1 in main.css
```

Options from `process(css, opts)` will be sent to processors
as the second argument.

You can also use the result from a previous postprocessor, or
an already-parsed `Root`, as an argument to the next one:

```js
result = processor1.process(css)
processor2.process(result)
```

### Multiple Inputs

The function `postcss()` generates a processor for only one input.
If you need to process several inputs (for example, when concatenating files)
you can use `postcss.parse()`.

Let’s join two CSS strings with full source map support in only 5 lines of code:

```js
var file1 = postcss.parse(css1, { from: 'a.css' });
var file2 = postcss.parse(css2, { from: 'b.css' });

file1.append( file2 );

var result = file1.toResult({ to: 'app.css', map: true });
```

### Source Map

By using [source maps], a browser’s development tools can indicate the
original position of your styles before the css file was transformed.
For example, an inspector will show the position in a Sass file, even if
the file has been compiled to CSS, concatenated, and minified.

To ensure a correct source map is generated, every CSS processing step should update
the map generated by the previous step. For example, a Sass compiler will generate
the first map, a concatenation tool should update the Sass step’s map, and a minifier
should update the map generated by the concatenation tool.

There are two ways to store a source map:

* You can place it in a separate file which contains a special annotation comment
  pointing to another file:

  ```css
 a { }
 /*# sourceMappingURL=main.out.css.map */
  ```
* Or you can inline a base64-encoded source map within a CSS comment:

  ```css
 a { }
 /*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5taW4uY3NzIiwic291cmNlcyI6WyJtYWluLmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFLIn0= */
  ```

PostCSS has great source map support. To ensure that you generate the correct
source map, you must indicate the input and output CSS files
paths (using the options `from` and `to` respectively).

To generate a new source map with the default options, provide `map: true` in the
options passed to `processor.process(css, opts)`.

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
root.last.removeSelf(); // Example transformation

var result = root.toResult({ to: 'main.out.css' });
fs.writeFileSync('main.out.css',     result.css);
fs.writeFileSync('main.out.css.map', result.map);
```

If PostCSS is handling CSS and finds source maps from previous transformations, it will
automatically update the CSS with the same options.

```js
// main.sass.css has an annotation comment with a link to main.sass.css.map
var result = minifier.process(css, { from: 'main.sass.css', to: 'main.min.css' });
result.map //=> Source map from main.sass to main.min.css
```

If you want more control over source map generation, you can define the `map` option
as an object with the following parameters:

* `inline` (boolean): indicates the source map should be inserted into the CSS string as
  a comment. By default, PostCSS will inline new source maps only if the source map from
  a previous step inserted an inline source map.

  If you inline a source map, `result.map` will be empty, as the source map will be
  contained within the text of `result.css`.

  As a shortcut, `map { inline: true }` is equivalent to `map: 'inline'`.

* `prev` (string, object, or boolean): map content from a previous processing step
  (for example, Sass compilation). PostCSS will try to read the previous source map
  automatically from the comment within origin CSS, but you can also set manually.
  If desired, you can omit the previous map with `prev: false`.

  This is a source map option which can be passed to `postcss.parse(css, opts)`.
  Other options can be passed to the `toResult(opts)` or `process(css, opts)` methods.

* `sourcesContent` (boolean): indicates that we should set the origin content
  (for example, Sass source) of the source map. By default, PostCSS will add
  content only if previous map contains it.

* `annotation` (boolean or string): indicates if we should add annotation comments
  to the CSS. By default, PostCSS will always add a comment with a path to the source
  map. But if the previous CSS does not have an annotation comment, PostCSS will
  omit it too.

  By default, PostCSS presumes that you want to save the source map as
  `opts.to + '.map'` and will use this path in the annotation comment. But you can
  set another path by providing a string value as the `annotation` option.

  If you set `inline: true`, annotation cannot be disabled.

[source maps]: http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/

### Safe Mode

If you provide a `safe: true` option to the `process` or `parse` methods,
PostCSS will try to correct any syntax error that it finds in the CSS.
For example, it will parse `a {` as `a {}`.

```js
postcss.parse('a {');                 // will throw "Unclosed block"
postcss.parse('a {', { safe: true }); // will return CSS root for a {}
```

This is useful for legacy code filled with plenty of hacks. Another use case
is interactive tools with live input, for example,
the [Autoprefixer demo](http://jsfiddle.net/simevidas/udyTs/show/light/).

### Helpers

#### Vendor

PostCSS contains height optimized code to split vendor prefix:

```js
var vendor = require('postcss/lib/vendor');

vendor.prefix('-moz-tab-size')     //=> '-moz-'
vendor.unprefixed('-moz-tab-size') //=> 'tab-size'
```

#### List

To safely split comma- or space-separated values (such as those in `background-image`
or `transform`) with brackets and quotes support, you can use the `list` helper:

```js
var list = require('postcss/lib/list');

list.space(image.value)     //=> ['linear-gradient(white, black)', 'blue']
list.comma(transform.value) //=> ['color 200ms', 'background 200ms']
```

### Nodes

Processor functions receive a `Root` node which contains the CSS node tree.

```js
var processor = postcss(function (cssRoot) {
});
```

There are 4 types of child nodes: `Comment`, `AtRule`, `Rule` and `Declaration`.
All nodes possess `toString()` and `clone()` methods.

You can parse CSS and get a `Root` node by calling the `postcss.parse(css, opts)` method:

```js
var cssRoot = postcss.parse('a { }');
```

Many of the methods on a node will return the current node, which enables
you to build method chains:

```js
root.append( rule1 ).append( rule2 ).toString();
```

### Node Source

Every node stores its origin file (if you provide the `from` option to the `process`
or `parse` methods) and position:

```js
var root = postcss.parse(css, { from: 'main.css' });
var rule = root.rules[0];

rule.source.file  //=> 'main.css'
rule.source.start //=> { line: 5,  position: 1 }
rule.source.end   //=> { line: 10, position: 5 }
```

### Whitespace

All nodes (excluding the `Root`) have a `before` property which contains
the indentation and any previous whitespace.

Nodes with children (`Root`, `AtRule` and `Rule`) also contain an `after`
property which indicates the spaces after the last child and before a `}`
character or the end of the file.

Every `Declaration` has a `between` property with colon, spaces and comments
between the property name and value. `Rule` stores the spaces and comments between
the selector and `{` in the `between` property. `AtRule` uses `between` to
indicate the spaces and comments before either a `{` or `;`, if the at-rule
is bodiless.

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

Note that nodes may have not `before` or `between` properties:

* If node was created by hand via `postcss.rule()`.
* `node.clone()` will clean all style properties to use the style for a new CSS root.

### Raw Properties

Some CSS values (selectors, comment text, at-rule params and declaration values)
can contain comments. PostCSS will clean them to remove trailing spaces:

```js
var root = postcss.parse("a /**/ b {}");
var rule  = root.rules[0];

rule.selector      //=> 'a  b' trimmed and cleaned from comments
rule._selector.raw //=> 'a /**/ b' original raw value
```

But PostCSS preservers the raw content in order to stringify it back to CSS,
in case you don’t change the original value. In general, PostCSS tries to preserve
the original CSS byte-to-byte whenever possible:

```js
rule.toString() //=> 'a /**/ b {}' with comment

rule.selector = '.link b';
rule.toString() //=> '.link b {}' you change value and origin comment was gone
```

### Containers

`Root`, `AtRule` and `Rule` nodes can contain children in `rules` or `decls`
properties.

There are some common methods to perform work on children:

* `append(newChild)` adds a child at the end of the children list.
* `prepend(newChild)` adds a child at the beginning of the children list.
* `insertBefore(existsChild, newChild)` inserts a new child before a
   pre-existing child.
* `insertAfter(existsChild, newChild)` inserts a new child after some
   pre-existing child.
* `remove(existsChild)` removes a child.
* `index(existsChild)` returns a child’s index.
* `some(fn)` returns true if `fn` returns true for any child.
* `every(fn)` returns true if `fn` returns true for all children.

Methods `append`, `prepend`, `insertBefore` and `insertAfter` will also accept
arrays and `Root` nodes as an argument.

Methods `insertBefore`, `insertAfter` and `remove` will accept child nodes
or indexes as the `existsChild` argument. Note that providing a child index will
result in the method completing much faster.

There are two shortcuts to provide the first and last child of a node:

```js
rule.first //=> First declaration in rule
rule.last  //=> Last declaration in rule
```

### Children

`Comment`, `AtRule`, `Rule` and `Declaration` nodes should be wrapped
in other nodes.

All children contain a `parent` property which indicates the parent node:

```js
rule.decls[0].parent == rule;
```

All children have a `removeSelf()` method:

```js
rule.decls[0].removeSelf();
```

But invoking the `remove(index)` method on the parent is much faster:

```js
rule.each(function (decl, i) {
    rule.remove(i);
});
```

### Iterators

All parent nodes have an `each` method which allows you to iterate over
its child nodes:

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
So you can mutate the children during iteration and PostCSS will fix the current index:

```js
rule.rules.forEach(function (decl, i) {
    rule.prepend( decl.clone() );
    // Will infinitely cycle as prepending the current declaration will
    // cause the second and successive indexes to interact with the
    // current declaration endlessly
});

rule.each(function (decl, i) {
    rule.prepend( decl.clone() );
    // Will work correctly (each declaration will be cloned only once),
    // because the iterator index will be recalculated only after the prepend
});
```

Because CSS has a nested structure, PostCSS also features a recursive iterator
`eachInside`:

```js
root.eachInside(function (node, i) {
    console.log(node.type + ' inside ' + node.parent.type);
});
```

There are also shortcuts so that you can recursively iterate over nodes of
a specific type:

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

You can break out from the iteration by returning `false`.

### Root Node

`Root` node contains the entire CSS tree. Its children can only be `Comment`,
`AtRule`, or `Rule` nodes in the `rules` property.

You can create a new root using the shortcut:

```js
var root = postcss.root();
```

Method `toString()` stringifies the entire node tree and returns a CSS string:

```js
root = postcss.parse(css);
root.toString() == css;
```

If PostCSS found previous source map, it will save all the relevant information
within `Root#prevMap`:

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

PostCSS creates `Comment` nodes only for comments found between rules or declarations.
Comments found within selectors, at-rules params, or declaration values will be stored
in the Raw property.

`Comment` has only one property: `text` which contains the trimmed text inside the comment.

```js
comment.text //=> "Block comment"
```

You can create a new comment using a shortcut:

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

As illustrated above, some at-rules do not contain any children
(for example, `@charset` or `@import`), some at-rules can only contain
declarations (for example, `@font-face` or `@page`), but most of them
can contain rules and nested at-rules (for example, `@media`, `@keyframes`
and others).

The parser selects `AtRule` content type by its name. If you create an `AtRule`
node manually, it will infer its content type by the first child added via
the `append` or other methods:

```js
var atRule = postcss.atRule({ name: '-x-animations' });
atRule.rules        //=> undefined
atRule.decls        //=> undefined

atRule.append( postcss.rule({ selector: 'from' }) );
atRule.rules.length //=> 1
atRule.decls        //=> undefined
```

You can create a new at-rule using a shortcut:

```js
var atRule = postcss.atRule({ name: 'charset', params: 'utf-8' });
```

### Rule Node

```css
a {
    color: black;
}
```

`Rule` nodes have a `selector` property and contain their `Declaration`
and `Comment` children within the `decls` property.

They also possess a `selectors` shortcut, which returns an array:

```js
rule.selector  //=> "a, b"
rule.selectors //=> ['a', 'b']
```

You can avoid using the `Declaration` constructor for `append` and other insert methods, by:

```js
rule.append({ prop: 'color', value: 'black' });
```

The property `semicolon` indicates if the last declaration within the rule has a semicolon or not:

```js
var root = postcss.parse('a { color: black }');
root.rules[0].semicolon //=> false

var root = postcss.parse('a { color: black; }');
root.rules[0].semicolon //=> true
```

You can create a new rule using a shortcut:

```js
var rule = postcss.rule({ selector: 'a' });
```

### Declaration Node

```css
color: black
```

`Declaration` nodes have `prop`, `value` and `important` properties.

You can create a new declaration using a shortcut:

```js
var decl = postcss.decl({ prop: 'color', value: 'black' });
```

Or you can use the short form available via a rule’s `append()` and other add methods:

```js
rule.append({ prop: 'color', value: 'black' });
```
