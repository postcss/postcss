# PostCSS [![Build Status](https://travis-ci.org/postcss/postcss.svg)](https://travis-ci.org/postcss/postcss) [![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/postcss/postcss?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<img align="right" width="95" height="95" src="http://postcss.github.io/postcss/logo.svg" title="Philosopher’s stone, logo of PostCSS">

PostCSS is a tool for transforming CSS with JS plugins. The growing ecosystem
of PostCSS plugins can add vendor prefixes, support variables and mixins,
transpile future CSS syntax, inline images, and more.

PostCSS is used by Google, Twitter, Alibaba, and Shopify.
Its most popular plugin, [Autoprefixer], is one of the most universally
praised CSS processors available.

PostCSS can do the same work as preprocessors like Sass, Less, and Stylus.
But PostCSS is modular, 4-40x faster, and much more powerful.

PostCSS itself is very small. It includes only a CSS parser,
a CSS node tree API, a source map generator, and a node tree stringifier.
All CSS transformations are encapsulated in modular plugins. And these plugins
are themselves small plain JS functions, which receive a CSS node tree,
apply transformations to it, and return a modified tree.

You can use the [cssnext] plugin pack and write future CSS code right now:

```css
:root {
    --row: 1rem;
    --mainColor: #ffbbaaff;
}

@custom-media --mobile (width <= 640px);

@custom-selector --heading h1, h2, h3, h4, h5, h6;

.post-article --heading {
    margin-top: calc(10 * var(--row));
    color: color(var(--mainColor) blackness(+20%));
    font-variant-caps: small-caps;
}
@media (--mobile) {
    .post-article --heading {
        margin-top: 0;
    }
}
```

Or if you like the power provided by preprocessors like Sass,
you could combine [postcss-nested], [postcss-mixins], [postcss-easings]
and [postcss-media-minmax]:

```css
$mobile: width <= 640px;

@define-mixin social-icon $color {
    background: $color;
    &:hover {
        background: color($color whiteness(+10%));
    }
}

.social-icon {
    transition: background 200ms ease-in-sine;
    &.is-twitter {
        @mixin social-icon #55acee;
    }
    &.is-facebook {
        @mixin social-icon #3b5998;
    }
}

.post-article {
    padding: 10px 5px;
    @media ($mobile) {
        padding: 0;
    }
}
```

Twitter account for articles, releases, and new plugins: [@postcss].
Weibo account: [postcss].

<a href="https://evilmartians.com/?utm_source=postcss">
<img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg" alt="Sponsored by Evil Martians" width="236" height="54">
</a>

[@postcss]:     https://twitter.com/postcss
[postcss]:      http://weibo.com/postcss

## How PostCSS differs from Preprocessors

Sass, Less and Stylus provide specialized languages that you can use to write
CSS templates. These languages and their compilers are defined together
in large codebases. Tools and libraries for preprocessors must work within
each preprocessor’s limitations: usually they can only offer sets
of pre-defined mixins, functions, and variables.

In contrast, PostCSS provides a simple API that modular plugins can use
to understand, transform, and create CSS. PostCSS plugins, therefore,
can be created, maintained, and implemented independently. And they can perform
many different tasks, not just compile special syntaxes to CSS.
Each plugin does one thing well.

## Features

### Modularity

Without any plugins, PostCSS will parse your CSS and stringify it back
to you without changing a single byte. All of the processing that enables
special features and syntax in your stylesheets is made possible
by PostCSS plugins, which are nothing more than JS functions.

Because each PostCSS plugin is an independent module, different plugins can take
different approaches. This flexibility allows plugin authors to create whatever
features they can imagine, while empowering PostCSS users to add only
those features that they want to their workflow.

Some plugins, like [postcss-custom-properties], [postcss-media-minmax],
and [postcss-calc], implement syntax from present and future W3C specs,
transpiling it to cross-browser-compatible output. Other plugins,
like [postcss-mixins] and [postcss-simple-extend], add new powers
to your stylesheets that are not yet part of any spec. With PostCSS,
you can decide for yourself which plugins match your own needs and preferences.

Another advantage of PostCSS’s modularity is that anybody can contribute easily
to the PostCSS ecosystem. Plugins are simple npm packages;
so there are no barriers to writing your own plugins, or contributing ideas
and bug fixes to the plugins that you use.

### Perfomance

PostCSS is one of the fastest CSS parsers written in JS. (Only [CSSOM] is
faster, and only because it is less accurate.) So PostCSS will read your CSS
and apply transformations faster than any other stylesheet processor out there.

If you use Ruby Sass now, PostCSS could significantly improve your development
process: PostCSS processing is *40 times faster* than Ruby Sass compilation.
And even if you throw in the entire [cssnext] plugin pack, PostCSS,
written in JS, is still *4 times faster* than [libsass], written on C++.

[libsass]: https://github.com/sass/libsass
[CSSOM]:   https://github.com/NV/CSSOM

### Powerful Tools

PostCSS plugins can read and rebuild an entire CSS node tree. With this power,
plugin authors are able to create tools that would be impossible
to build into preprocessors (like [Autoprefixer]).

PostCSS-powered tools can do much more than transform special syntax into
browser-friendly CSS. PostCSS plugin authors have built linters
(like [doiuse] and [postcss-bem-linter]), code review tools
(like [list-selectors]), and minifiers (like [csswring]).
With [postcss-data-packer], you can create a cacheable “sprite”
by moving all `data:uri` values to separate file.

One unique example of PostCSS’s power is [RTLCSS]. As you know,
in Arabic and Hebrew, writing moves from right-to-left (RTL), instead
of the more widespread left-to-right convention. Because a language’s
directionality affects its readers’ perspective, an international site’s layout
needs to change for RTL users, not just its text. (Check out [Arabic Wikipedia]
as an example.) The [RTLCSS] plugin effectively “mirrors” your stylesheet
by swapping `left` and `right`, changing the value order in `margin` shorthands,
and more.

[Arabic Wikipedia]: https://ar.wikipedia.org/wiki/%D9%84%D8%BA%D8%A9_%D8%B9%D8%B1%D8%A8%D9%8A%D8%A9

### Use the CSS of the Future

CSS3 added valuable features, but some of them are not yet available in all
of the browsers that developers need to support. And exciting future CSS modules
are being drafted now — some even implemented in cutting-edge browsers —
that will not be widely available for quite a while. But PostCSS plugins
can allow us to write this CSS of the future, then transpile it to code usable
in all the browsers we must support.

[Autoprefixer] exemplifies this power: you write spec-compliant, future-friendly
CSS, pretending that vendor prefixes don’t exist, and it does the dirty work
of inserting the prefixes you’ll need. All of the plugins bundled into [cssnext]
do similar work, allowing authors to use syntax and functions
from the latest W3C specs without worrying about the fallbacks they’ll need.

As more CSS specs are drafted, more PostCSS plugins will be written. Users will
be able to write stylesheets using standard, interoperable syntax, instead of
a specialized language for a specialized tool (as with preprocessors).

## Quick Start

1. Implement PostCSS with your build tool of choice. See the PostCSS [Grunt],
   [Gulp], and [webpack] plugins more detailed instructions.
2. Select plugins from the list below and add them to your PostCSS process.
3. Make awesome products.

[webpack]: https://github.com/postcss/postcss-loader
[Grunt]:   https://github.com/nDmitry/grunt-postcss
[Gulp]:    https://github.com/w0rm/gulp-postcss

## Plugins Packs

* [cssnext] contains plugins that allow you to use future CSS features today.
* [ACSS] contains plugins that transform your CSS according
  to special annotation comments.

[cssnext]:  https://github.com/putaindecode/cssnext
[ACSS]:     https://github.com/morishitter/acss

## Plugins

### Future CSS Syntax

* [postcss-color-function] supports functions to transform colors.
* [postcss-color-gray] supports the `gray()` function.
* [postcss-color-hex] transforms `rgb()` and `rgba()` to hex.
* [postcss-color-hex-alpha] supports `#rrggbbaa` and `#rgba` notation.
* [postcss-color-hwb] transforms `hwb()` to widely compatible `rgb()`.
* [postcss-color-rebeccapurple] supports the `rebeccapurple` color.
* [postcss-custom-media] supports custom aliases for media queries.
* [postcss-custom-properties] supports variables, using syntax from
  the W3C Custom Properties.
* [postcss-custom-selectors] adds custom aliases for selectors.
* [postcss-font-variant] transpiles human-readable `font-variant` to more widely
  supported CSS.
* [postcss-host] makes the Shadow DOM’s `:host` selector work properly
  with pseudo-classes.
* [postcss-media-minmax] adds `<=` and `=>` statements to media queries.
* [mq4-hover-shim] supports the `@media (hover)` feature.

### Fallbacks

* [postcss-epub] adds the `-epub-` prefix to relevant properties.
* [postcss-opacity] adds opacity filter for IE8.
* [postcss-vmin] generates `vm` fallback for `vmin` unit in IE9.
* [postcss-will-change] inserts 3D hack before `will-change` property.
* [Autoprefixer] adds vendor prefixes for you, using data from Can I Use.
* [cssgrace] provides various helpers and transpiles CSS3 for IE
  and other old browsers.
* [pixrem] generates pixel fallbacks for `rem` units.
* [pleeease-filters] converts WebKit filters to SVG filters,
  for cross-browser compatibility.

### Language Extensions

* [postcss-mixins] enables mixins more powerful than Sass’s,
  defined within stylesheets or in JS.
* [postcss-nested] unwraps nested rules, as Sass does.
* [postcss-simple-extend] supports extending of silent classes,
  like Sass’s `@extend`.
* [postcss-simple-vars] supports for Sass-style variables.
* [csstyle] adds components workflow to your styles.

### Optimizations

* [postcss-assets] allows you to simplify URLs, insert image dimensions,
  and inline files.
* [postcss-calc] reduces `calc()` to values
  (when expressions involve the same units).
* [postcss-data-packer] moves embedded Base64 data out of the stylesheet
  and into a separate file.
* [postcss-import] inlines the stylesheets referred to by `@import` rules.
* [postcss-url] rebases or inlines `url()`s.
* [csswring] is a CSS minifier.
* [css-byebye] removes the CSS rules that you don’t want.
* [css-mqpacker] joins matching CSS media queries into a single statement.
* [webpcss] adds URLs for WebP images, so they can be used by browsers
  that support WebP.

### Shortcuts

* [postcss-easings] replaces easing names from easings.net
  with `cubic-bezier()` functions.
* [postcss-size] adds a `size` shortcut that sets width and height
  with one declaration.

### Others

* [postcss-brand-colors] inserts company brand colors
  in the `brand-colors` module.
* [postcss-color-palette] transforms CSS2 color keywords to a custom palette.
* [postcss-single-charset] ensures that there is one
  and only one `@charset` rule at the top of file.
* [rtlcss] mirrors styles for right-to-left locales.

### Analysis

* [postcss-bem-linter] lints CSS for conformance to SUIT CSS methodology.
* [css2modernizr] creates a Modernizr config file
  that requires only the tests that your CSS uses.
* [doiuse] lints CSS for browser support, using data from Can I Use.
* [list-selectors] lists and categorizes the selectors used in your CSS,
  for code review and analysis.

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
[postcss-will-change]:         https://github.com/postcss/postcss-will-change
[postcss-simple-vars]:         https://github.com/postcss/postcss-simple-vars
[postcss-data-packer]:         https://github.com/Ser-Gen/postcss-data-packer
[postcss-bem-linter]:          https://github.com/necolas/postcss-bem-linter
[postcss-color-gray]:          https://github.com/postcss/postcss-color-gray
[postcss-color-hex]:           https://github.com/TrySound/postcss-color-hex
[postcss-color-hwb]:           https://github.com/postcss/postcss-color-hwb
[pleeease-filters]:            https://github.com/iamvdo/pleeease-filters
[postcss-easings]:             https://github.com/postcss/postcss-easings
[postcss-opacity]:             https://github.com/iamvdo/postcss-opacity
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
[postcss-vmin]:                https://github.com/iamvdo/postcss-vmin
[postcss-url]:                 https://github.com/postcss/postcss-url
[css-byebye]:                  https://github.com/AoDev/css-byebye
[cssgrace]:                    https://github.com/cssdream/cssgrace
[csswring]:                    https://github.com/hail2u/node-csswring
[csstyle]:                     https://github.com/geddski/csstyle
[webpcss]:                     https://github.com/lexich/webpcss
[rtlcss]:                      https://github.com/MohammadYounes/rtlcss
[RTLCSS]:                      https://github.com/MohammadYounes/rtlcss
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

Read the [postcss function], [processor], and [Result] API docs for more details.

[postcss function]: https://github.com/postcss/postcss/blob/master/API.md#postcss-function
[processor]:        https://github.com/postcss/postcss/blob/master/API.md#postcss-class
[Result]:           https://github.com/postcss/postcss/blob/master/API.md#result-class

### Source Maps

PostCSS has great [source maps] support. It can read and interpret maps
from previous transformation steps, autodetect the format that you expect,
and output both external and inline maps.

To ensure that you generate an accurate source map, you must indicate the input
and output CSS files paths — using the options `from` and `to`, respectively.

To generate a new source map with the default options, simply set `map: true`.
This will generate an inline source map that contains the source content.
If you don’t want the map inlined, you can use set `map.inline: false`.

```js
var result = processor.process(css, {
    from: 'main.css',
    to:   'main.out.css',
    map: { inline: false },
});

result.map //=> '{"version":3,"file":"main.out.css","sources":["main.css"],"names":[],"mappings":"AAAA,KAAI"}'
```

If PostCSS finds source maps from a previous transformation,
it will automatically update that source map with the same options.

```js
// main.sass.css has an annotation comment with a link to main.sass.css.map
var result = minifier.process(css, { from: 'main.sass.css', to: 'main.min.css' });
result.map //=> Source map from main.sass to main.min.css
```

If you want more control over source map generation, you can define the `map`
option as an object with the following parameters:

* `inline` boolean: indicates that the source map should be embedded
  in the output CSS as a Base64-encoded comment. By default it is `true`.
  But if all previous maps are external, not inline, PostCSS will not embed
  the map even if you do not set this option.

  If you have an inline source map, the `result.map` property will be empty,
  as the source map will be contained within the text of `result.css`.

* `prev` string, object or boolean: source map content from
  a previous processing step (for example, Sass compilation).
  PostCSS will try to read the previous source map automatically
  (based on comments within the source CSS), but you can use this option
  to identify it manually. If desired, you can omit the previous map
  with `prev: false`.

* `sourcesContent` boolean: indicates that PostCSS should set the origin
  content (for example, Sass source) of the source map. By default it is `true`.
  But if all previous maps do not contain sources content, PostCSS will also
  leave it out even if you do not set this option.

* `annotation` boolean or string: indicates that PostCSS should add annotation
  comments to the CSS. By default, PostCSS will always add a comment with a path
  to the source map. But if the input CSS does not have any annotation
  comment, PostCSS will omit it, too, even if you do not set this option.

  By default, PostCSS presumes that you want to save the source map as
  `opts.to + '.map'` and will use this path in the annotation comment.
  But you can set another path by providing a string value for `annotation`.

  If you have set `inline: true`, annotation cannot be disabled.

[source maps]: http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/

### Safe Mode

If you provide a `safe: true` option to the `process` or `parse` methods,
PostCSS will try to correct any syntax errors that it finds in the CSS.

```js
postcss.parse('a {');                 // will throw "Unclosed block"
postcss.parse('a {', { safe: true }); // will return CSS root for a {}
```

This is useful for legacy code filled with hacks. Another use-case
is interactive tools with live input — for example,
the [Autoprefixer demo](http://jsfiddle.net/simevidas/udyTs/show/light/).

## How to Develop PostCSS Plugin

* [PostCSS API](https://github.com/postcss/postcss/blob/master/API.md)
* [Plugin Boilerplate](https://github.com/postcss/postcss-plugin-boilerplate)
