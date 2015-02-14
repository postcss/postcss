# PostCSS [![Build Status](https://travis-ci.org/postcss/postcss.svg)](https://travis-ci.org/postcss/postcss) [![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/postcss/postcss?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<img align="right" width="95" height="95" src="http://postcss.github.io/postcss/logo.svg" title="Philosopher’s stone, logo of PostCSS">

PostCSS is a tool to transform CSS by JS plugins. This plugins can add vendor
prefixes, polyfill CSS 4 features, inline images, add variables
and mixins support. PostCSS with most popular [Autoprefixer] plugin
is used by Google, Twitter, Alibaba and Shopify.

PostCSS does same work as Sass, LESS or Stylus. But, instead of preprocessors,
PostCSS is modular, 4—40 times faster and much powerful
(Autoprefixer is impossible on preprocessors).

PostCSS is very small. It contains only CSS parser, CSS node tree API,
source map generator and node tree stringifier. All features (like variables
or nesting) are made by plugins. PostCSS plugin is just a JS function, that
accepts CSS node tree, reads and transforms some of nodes in tree.

For example, with [Autoprefixer], [cssnext], [CSS Grace],
[postcss-nested], [postcss-mixins] and [postcss-easings] plugins
you will be able to write this CSS:

```css
@define-mixin social-icon $color {
    & {
        background: $color;
        &:hover {
            background: color($color whiteness(+10%))
        }
    }
}

.social-icon {
    transition: background 200ms ease-in-sine;
    font-variant-caps: small-caps;
    &.is-twitter {
        @mixin social-icon #55acee;
    }
    &.is-facebook {
        @mixin social-icon #3b5998;
    }
    &:active {
        opacity: 0.6;
    }
}

@custom-media --mobile (width <= 640px);

@custom-selector --heading h1, h2, h3, h4, h5, h6;

.post-article --heading {
    margin-top: 10rem;
    @media (--mobile) {
        margin-top: 0;
    }
}
```

Twitter account for articles, releases and new plugins: [@postcss].
Weibo account: [postcss].

<a href="https://evilmartians.com/?utm_source=postcss">
<img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg" alt="Sponsored by Evil Martians" width="236" height="54">
</a>

[Autoprefixer]: https://github.com/postcss/autoprefixer
[CSS Grace]:    https://github.com/cssdream/cssgrace
[@postcss]:     https://twitter.com/postcss
[postcss]:      http://weibo.com/postcss
[cssnext]:      https://github.com/cssnext/cssnext

## Differences with preprocessors

1. With preprocessors you write your CSS on special programming language.
   It is like a PHP, but you mix control statement with styles. As result your
   styles is slow, because programming language is too compilcated. With PostCSS
   you write styles on normal CSS, just with custom at-rules and functions.
2. Preprocessors tools (like Compass) is written mainly in same
   preprocessors language. As result this tools is very limited. The libraries
   adds only a custom functions, variables or mixins. There is no way to add new
   syntax for CSS 4 polyfills. In PostCSS all magic is written on JS and uses
   big universe of npm packages. So you have better and smarter tools.
3. All features is built in this preprocessor’s language. Adding new features
   is very difficult for developers, so languages develop slow. All features
   of PostCSS is just a small JS functions, which transform CSS nodes tree.
   Many developers create new features and you have bigger choice.

## Features

### Modularity

Without a plugins, PostCSS just parse your CSS and stringify it back without
change of any byte. All features is made by small JS funcions
from PostCSS plugins. You can choose only features, that you need.

Variables is a nice example. There are 2 different plugins for variables.
[postcss-simple-vars] has Sass like syntax:

```css
a {
    color: $link-color;
}
```

[postcss-custom-properties] is a polyfill for [W3C CSS Custom Properties] draft:

```css
a {
    color: var(--link-color);
}
```

In PostCSS you can choose what variables syntax you want or even take both.

[W3C CSS Custom Properties]: http://www.w3.org/TR/css-variables/
[postcss-custom-properties]: https://github.com/postcss/postcss-custom-properties
[postcss-simple-vars]:       https://github.com/postcss/postcss-simple-vars

### Perfomance

PostCSS is one of the fastest CSS parsers written on JS. Only [CSSOM] is 10%
faster and only because it parses CSS not so accurate as PostCSS does.
Modular architecture makes PostCSS code is simple and easy to maintain.

As result PostCSS is incredible fast. PostCSS is written on JS, but even with
big [cssnext] plugin pack, it is 4 times faster than [libsass] written on C++.

If you uses Ruby Sass right now, you will be excited with PostCSS developing
process, because PostCSS is 40 times faster that Ruby Sass.

[cssnext]: https://github.com/cssnext/cssnext
[libsass]: https://github.com/sass/libsass
[CSSOM]:   https://github.com/NV/CSSOM

### Powerful Tools

PostCSS plugins can read and rebuild entire CSS node tree.
As result PostCSS has many powerful tools that would be impossible
on preprocessors. Autoprefixer is a good example of how PostCSS plugin could
be useful.

PostCSS allows you to build linters (like [doiuse] or [BEM Linter]),
code review tools (like [list-selectors]) or minifiers (like [CSSWring]).
With [postcss-data-packer] plugin you can create a “sprite” from inlined images
by moving all `data:uri` values to separated file.

But my favorite example of PostCSS power is [RTLCSS]. As you know Jews and Arabs
has right-to-left writing. Because writing affects to people perspective
you need to change your site design (check out [Arabic Wikipedia]).
RTLCSS plugin mirrors you design, replace `left` to `right` in your styles,
change values order in `margin`, etc.

[postcss-data-packer]: https://github.com/Ser-Gen/postcss-data-packer
[Arabic Wikipedia]:    https://ar.wikipedia.org/wiki/%D9%84%D8%BA%D8%A9_%D8%B9%D8%B1%D8%A8%D9%8A%D8%A9
[list-selectors]:      https://github.com/davidtheclark/list-selectors
[BEM Linter]:          https://github.com/necolas/postcss-bem-linter
[CSSWring]:            https://github.com/hail2u/node-csswring
[doiuse]:              https://github.com/anandthakker/doiuse
[RTLCSS]:              https://github.com/MohammadYounes/rtlcss

## Quick Start

1. Add PostCSS to your build tool. See [Grunt], [Gulp] and [webpack] plugins
   for further instructions.
2. Select plugins from list below and add them to your PostCSS.
3. Make awesome products.

[webpack]: https://github.com/postcss/postcss-loader
[Grunt]:   https://github.com/nDmitry/grunt-postcss
[Gulp]:    https://github.com/w0rm/gulp-postcss

## Plugins Packs

* [cssnext] is a pack of CSS 4 polyfills plugins.
* [ACSS] contains plugins to control your CSS by special annotation comments.

[cssnext]:  https://github.com/putaindecode/cssnext
[ACSS]:     https://github.com/morishitter/acss

## Plugins

* [Autoprefixer] adds vendor prefixes to rules by Can I Use.
* [cssgrace] with helpers and CSS 3 polyfills for IE and other old browsers.
* [csswring] is a CSS minifier.
* [rtlcss] mirrors styles for right-to-left locales.
* [pixrem] is a `rem` unit polyfill.
* [css-mqpacker] joins same CSS media queries into one rule.
* [postcss-assets] inlines files and inserts image width and height.
* [css2modernizr] analyzes your CSS and output only used Modernizr’s settings.
* [postcss-bem-linter] lints CSS for SUIT CSS methodology.
* [pleeease-filters] converts WebKit filters to SVG filter for other browsers.
* [postcss-custom-selectors] to add custom alias for selectors.
* [doiuse] lints CSS for browser support against Can I Use database.
* [webpcss] adds links to WebP images for browsers that support it.
* [postcss-import] inlines `@import` rules content.
* [postcss-nested] unwraps nested rules.
* [postcss-media-minmax] adds `<=` and `=>` statements to CSS media queries.
* [postcss-mixins] to use mixins.
* [postcss-easings] replaces easing name to `cubic-bezier()`.
* [postcss-url] rebases or inlines `url()`.
* [postcss-epub] adds `-epub-` prefix.
* [postcss-custom-properties] is a polyfill for W3C CSS variables spec.
* [mq4-hover-shim] is a shim for the `@media (hover: hover)` feature.
* [postcss-color-palette] transforms CSS 2 color keywords to a custom palette.
* [postcss-custom-media] to add custom alias for media queries.
* [css-byebye] removes CSS rules by some criteria.
* [postcss-simple-vars] adds Sass-style variables support.
* [postcss-data-packer] moves an inlined data into a separate file.
* [postcss-color-gray] adds `gray()` function.
* [postcss-brand-colors] inserts branding colors by companies name.
* [list-selectors] is a code review tool for your CSS.
* [postcss-calc] reduce `calc()` with same units.
* [postcss-font-variant] adds readable front variant properies support.
* [postcss-simple-extend] adds `@extend` support.
* [postcss-size] adds `size` shorcut to set width and height in one property.
* [postcss-color-hex] transforms `rgb()` and `rgba()` to hex.
* [postcss-host] make `:host` selectors work properly with pseudo-classes.
* [postcss-color-rebeccapurple] is a `rebeccapurple` color polyfill.
* [postcss-color-function] adds functions to transform colors.
* [postcss-color-hex-alpha] adds `#rrggbbaa` and `#rgba` notation support.
* [postcss-color-hwb] transforms `hwb()` to `rgb()`.
* [postcss-single-charset] pops first `@charset` rule.

[postcss-color-rebeccapurple]: https://github.com/postcss/postcss-color-rebeccapurple
[postcss-custom-properties]:   https://github.com/postcss/postcss-custom-properties
[postcss-custom-selectors]:    https://github.com/postcss/postcss-custom-selectors
[postcss-color-hex-alpha]:     https://github.com/postcss/postcss-color-hex-alpha
[postcss-color-function]:      https://github.com/postcss/postcss-color-function
[postcss-single-charset]:      https://github.com/hail2u/postcss-single-charset
[postcss-color-palette]:       https://github.com/zaim/postcss-color-palette
[postcss-simple-extend]:       https://github.com/davidtheclark/postcss-simple-extend
[postcss-media-minmax]:        https://github.com/postcss/postcss-media-minmax
[postcss-custom-media]:        https://github.com/postcss/postcss-custom-media
[postcss-brand-colors]:        https://github.com/postcss/postcss-brand-colors
[postcss-font-variant]:        https://github.com/postcss/postcss-font-variant
[postcss-simple-vars]:         https://github.com/postcss/postcss-simple-vars
[postcss-data-packer]:         https://github.com/Ser-Gen/postcss-data-packer
[postcss-bem-linter]:          https://github.com/necolas/postcss-bem-linter
[postcss-color-gray]:          https://github.com/postcss/postcss-color-gray
[postcss-color-hex]:           https://github.com/TrySound/postcss-color-hex
[postcss-color-hwb]:           https://github.com/postcss/postcss-color-hwb
[pleeease-filters]:            https://github.com/iamvdo/pleeease-filters
[postcss-easings]:             https://github.com/postcss/postcss-easings
[postcss-assets]:              https://github.com/borodean/postcss-assets
[postcss-import]:              https://github.com/postcss/postcss-import
[postcss-nested]:              https://github.com/postcss/postcss-nested
[postcss-mixins]:              https://github.com/postcss/postcss-mixins
[mq4-hover-shim]:              https://github.com/twbs/mq4-hover-shim
[list-selectors]:              https://github.com/davidtheclark/list-selectors
[css2modernizr]:               https://github.com/vovanbo/css2modernizr
[Autoprefixer]:                https://github.com/postcss/autoprefixer
[css-mqpacker]:                https://github.com/hail2u/node-css-mqpacker
[postcss-epub]:                https://github.com/Rycochet/postcss-epub
[postcss-calc]:                https://github.com/postcss/postcss-calc
[postcss-size]:                https://github.com/postcss/postcss-size
[postcss-host]:                https://github.com/vitkarpov/postcss-host
[postcss-url]:                 https://github.com/postcss/postcss-url
[css-byebye]:                  https://github.com/AoDev/css-byebye
[cssgrace]:                    https://github.com/cssdream/cssgrace
[csswring]:                    https://github.com/hail2u/node-csswring
[webpcss]:                     https://github.com/lexich/webpcss
[rtlcss]:                      https://github.com/MohammadYounes/rtlcss
[pixrem]:                      https://github.com/robwierzbowski/node-pixrem
[doiuse]:                      https://github.com/anandthakker/doiuse

## Usage

### JavaScript API

```js
var postcss   = require('postcss');
var processor = postcss([require('cssnext'), require('cssgrace')]);

var result = processor.process(css, { from: 'app.css', to: 'app.out.css' });
console.log(result.css);
```

Read [postcss function], [processor] and [Result] API docs for more details.

[postcss function]: https://github.com/postcss/postcss/blob/master/API.md#postcss-function
[processor]:        https://github.com/postcss/postcss/blob/master/API.md#postcss-class
[Result]:           https://github.com/postcss/postcss/blob/master/API.md#result-class

### Source Maps

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
This will inline sourcemap with source content. If you don’t want the map
inlined, you can use `map.inline: false` option.

```js
var result = processor.process(css, {
    from: 'main.css',
    to:   'main.out.css'
    map: { inline: false },
});

result.map //=> '{"version":3,"file":"main.out.css","sources":["main.css"],"names":[],"mappings":"AAAA,KAAI"}'
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

```js
postcss.parse('a {');                 // will throw "Unclosed block"
postcss.parse('a {', { safe: true }); // will return CSS root for a {}
```

This is useful for legacy code filled with plenty of hacks. Another use case
is interactive tools with live input, for example,
the [Autoprefixer demo](http://jsfiddle.net/simevidas/udyTs/show/light/).

## How to Develop PostCSS Plugin

* [PostCSS API](https://github.com/postcss/postcss/blob/master/API.md)
* [Plugin Boilerplate](https://github.com/postcss/postcss-plugin-boilerplate)
