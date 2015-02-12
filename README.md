# PostCSS [![Build Status](https://travis-ci.org/postcss/postcss.svg)](https://travis-ci.org/postcss/postcss) [![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/postcss/postcss?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<img align="right" width="95" height="95" src="http://postcss.github.io/postcss/logo.svg" title="Philosopher’s stone, logo of PostCSS">

PostCSS is a framework for CSS postprocessors,
to modify CSS with JavaScript with full source map support.

It takes care of the most common CSS tool tasks:

1. parses CSS;
2. provides a usable JS API to edit CSS node trees;
3. dumps the modified node tree into a CSS string;
4. generates a source map (or modifies an pre-existing source map) containing
   your changes;

You can use this framework to write your own:

* CSS minifier or beautifier.
* CSS polyfills.
* Grunt plugin to generate sprites, include `data-uri` images
  or any other work.
* Text editor plugin to automate CSS routines.
* Command-line CSS tool.

Twitter account for news, releases and new plugins: [@postcss].
Weibo account: [postcss].

<a href="https://evilmartians.com/?utm_source=postcss">
<img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg" alt="Sponsored by Evil Martians" width="236" height="54">
</a>

[@postcss]: https://twitter.com/postcss
[postcss]:  http://weibo.com/postcss

## Built with PostCSS

### Tools

* [Autoprefixer] adds vendor prefixes by Can I Use data.
* [BEM linter] lints CSS for SUIT CSS methodology.
* [CSS MQPacker] joins same media queries.
* [css2modernizr] analyzes your CSS and output only used Modernizr’s settings.
* [cssnext] is a transpiler (CSS 4+ to CSS 3) that allow you to use tomorrow’s
  CSS syntax today.
* [CSSWring] is a CSS minifier with full source map support.
* [data-separator] splits data-uri into a separate CSS file.
* [pixrem] is a `rem` unit polyfill.
* [webpcss] to duplicate images in CSS to WebP for supported browsers.
* [Pleeease] is a pack of various postprocessors.
* [Pleeease Filters] converts WebKit filters to SVG filter for other browsers.
* [RTLCSS] mirrors styles for right-to-left locales.
* [CSS Byebye] explicitly removes the CSS rules that you don’t want.
* [postcss-epub] to prefix ePub3 properties.
* [doiuse] to lint your CSS on unsupported properties by Can I Use.
* [postcss-assets] to inline files and insert image width and height.
* [ACSS] Annotations based CSS processor.
* [CSS Grace] to CSS 3 polyfills for IE and other old browsers.
* [mq4-hover-hover-shim] is a shim for the `hover` media feature from Media
  Queries Level 4.

[Autoprefixer]:         https://github.com/postcss/autoprefixer
[BEM linter]:           https://github.com/necolas/postcss-bem-linter
[CSS MQPacker]:         https://github.com/hail2u/node-css-mqpacker
[css2modernizr]:        https://github.com/vovanbo/css2modernizr
[cssnext]:              https://github.com/putaindecode/cssnext
[CSSWring]:             https://github.com/hail2u/node-csswring
[data-separator]:       https://github.com/Sebastian-Fitzner/grunt-data-separator
[pixrem]:               https://github.com/robwierzbowski/node-pixrem
[webpcss]:              https://github.com/lexich/webpcss
[Pleeease]:             http://pleeease.io/
[Pleeease Filters]:     https://github.com/iamvdo/pleeease-filters
[RTLCSS]:               https://github.com/MohammadYounes/rtlcss
[CSS Byebye]:           https://github.com/AoDev/css-byebye
[postcss-epub]:         https://github.com/Rycochet/postcss-epub
[doiuse]:               https://github.com/anandthakker/doiuse
[postcss-assets]:       https://github.com/borodean/postcss-assets
[ACSS]:                 https://github.com/morishitter/acss
[CSS Grace]:            https://github.com/cssdream/cssgrace
[mq4-hover-hover-shim]: https://github.com/cvrebert/mq4-hover-hover-shim

### Plugins

* [postcss-calc] to reduce `calc()` usage
  (recommended with `postcss-custom-properties`).
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
* [postcss-font-variant] to set `font-feature-settings` by readable properties.
* [postcss-nested] to unwrap rules in other rules, like you can write in Sass.
* [postcss-custom-selector] to add custom alias for selectors.
* [postcss-media-minmax] to use `<=` or `>=` in CSS Media Queries.
* [postcss-data-packer] to move an embedded data into a separate file.
* [postcss-color-palette] to transform CSS2 color keywords to a custom palette.
* [postcss-color-hex] to transform rgb() and rgba() to hex.
* [postcss-single-charset] to pop first `@charset` rule.
* [postcss-simple-extend] to add selectors to a previously defined rule set.
* [postcss-simple-vars] for Sass-like variables.
* [postcss-mixins] for mixins.
* [postcss-size] for `size` shortcut to set `width` and `height` properties.
* [postcss-brand-colors] to insert branding colors by company name.
* [postcss-easings] to replace easing name to `cubic-bezier()`.
* [postcss-host] to make :host selector works properly with pseudo-classes

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
[postcss-font-variant]:         https://github.com/postcss/postcss-font-variant
[postcss-nested]:               https://github.com/postcss/postcss-nested
[postcss-custom-selector]:      https://github.com/postcss/postcss-custom-selector
[postcss-media-minmax]:         https://github.com/postcss/postcss-media-minmax
[postcss-data-packer]:          https://github.com/Ser-Gen/postcss-data-packer
[postcss-color-palette]:        https://github.com/zaim/postcss-color-palette
[postcss-color-hex]:            https://github.com/TrySound/postcss-color-hex
[postcss-single-charset]:       https://github.com/hail2u/postcss-single-charset
[postcss-simple-extend]:        https://github.com/davidtheclark/postcss-simple-extend
[postcss-simple-mixin]:         https://github.com/davidtheclark/postcss-simple-mixin
[postcss-simple-vars]:          https://github.com/postcss/postcss-simple-vars
[postcss-mixins]:               https://github.com/postcss/postcss-mixins
[postcss-size]:                 https://github.com/postcss/postcss-size
[postcss-brand-colors]:         https://github.com/postcss/postcss-brand-colors
[postcss-easings]:              https://github.com/postcss/postcss-easings
[postcss-host]:                 https://github.com/vitkarpov/postcss-host

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
result.css // String with processed CSS and inlined source map
```

And modifies a source map from previous steps (for example, Sass preprocessor):

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

PostCSS gives you the comfort and power of JS or CoffeeScript while
you are working with CSS. Applying the depth and variety of [npm]’s libraries
allows you to perform quite magical things using PostCSS.

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

Rework was created to build a new CSS sublanguage that replaced Stylus
(like [Myth]). PostCSS was created for CSS tools which work with legacy CSS code
(one such tool is Autoprefixer).

Because of this fundamental difference, PostCSS:

* Handles source map better, because it updates the map from the previous step
  (for example, Sass compilation).
* Preserves all your spaces and code style, so that it can function
  in text editor plugins.
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
     return gulp.src('./src/*.css')
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

You can easily make changes to this AST. Use `css.nodes` to get children.
Properties `rule.selector`, `decl.prop`, `decl.value`, `atrule.name`
and `atrule.params` contain data.

```js
css.nodes[0].value = 'white';
```

After changes have been made you can get the new CSS and a source map reflecting
the modifications:

```js
var result = css.toResult(options);

result.css //=> 'a { color: white }'
result.map //=> '{"version":3, … }'
```

The methods `postcss.parse()` and `CSS#toResult()` are part of a low level API,
and - in most cases - it will be better to create processors with a simpler API
and chaining.

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

This generated processor transforms some CSS using
the `process(css, opts)` method:

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

To ensure a correct source map is generated, every CSS processing step should
update the map generated by the previous step. For example, a Sass compiler
will generate the first map, a concatenation tool should update the Sass step’s
map, and a minifier should update the map generated by the concatenation tool.

There are two ways to store a source map:

* You can place it in a separate file which contains a special annotation
  comments pointing to another file:

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

To generate a new source map with the default options, provide `map: true`.
This will inline sourcemap with source content.

If you don't want the map inlined, you can use `inline: false`
in the options passed to `processor.process(css, opts)`.

```js
var result = processor.process(css, {
    from: 'main.css',
    to:   'main.out.css'
    map: { inline: false },
});

result.map //=> '{"version":3,"file":"main.out.css","sources":["main.css"],"names":[],"mappings":"AAAA,KAAI"}'

fs.writeFileSync('main.out.css',     result.css);
fs.writeFileSync('main.out.css.map', result.map);
```

Or set `from` in `postcss.parse(css, opts)` and `to` in `root.toResult(opts)`:

```js
var root = postcss.parse(css, { from: 'main.css', { inline: false } });
root.last.removeSelf(); // Example transformation

var result = root.toResult({ to: 'main.out.css' });
fs.writeFileSync('main.out.css',     result.css);
fs.writeFileSync('main.out.css.map', result.map);
```

If PostCSS is handling CSS and finds source maps from previous transformations,
it will automatically update the CSS with the same options.

```js
// main.sass.css has an annotation comment with a link to main.sass.css.map
var result = minifier.process(css, { from: 'main.sass.css', to: 'main.min.css' });
result.map //=> Source map from main.sass to main.min.css
```

If you want more control over source map generation, you can define the `map`
option as an object with the following parameters:

* `inline` (boolean): indicates the source map should be inserted into the CSS
  base64 string as a comment. By default it is `true`. But if all previous map
  are in separated too, PostCSS will not inline map too.

  If you inline a source map, `result.map` will be empty, as the source map
  will be contained within the text of `result.css`.

* `prev` (string, object, or boolean): map content from a previous processing
  step (for example, Sass compilation). PostCSS will try to read the previous
  source map automatically from the comment within origin CSS, but you can also
  set manually. If desired, you can omit the previous map with `prev: false`.

  This is a source map option which can be passed to `postcss.parse(css, opts)`.
  Other options can be passed to the `toResult(opts)` or `process(css, opts)`
  methods.

* `sourcesContent` (boolean): indicates that we should set the origin content
  (for example, Sass source) of the source map. By default it is `true`.
  But if all previous map do not contain sources content,
  PostCSS will miss it too.

* `annotation` (boolean or string): indicates if we should add annotation
  comments to the CSS. By default, PostCSS will always add a comment with a path
  to the source map. But if the previous CSS does not have an annotation
  comment, PostCSS will omit it too.

  By default, PostCSS presumes that you want to save the source map as
  `opts.to + '.map'` and will use this path in the annotation comment.
  But you can set another path by providing a string value as the `annotation`
  option.

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

## PostCSS Plugin Developing

* [PostCSS API](https://github.com/postcss/postcss/blob/master/API.md)
* [Plugin Boilerplate](https://github.com/postcss/postcss-plugin-boilerplate)
