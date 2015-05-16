# PostCSS [![Build Status][ci-img]][ci] [![Gitter][chat-img]][chat]

<img align="right" width="95" height="95"
     title="Philosopher’s stone, logo of PostCSS"
     src="http://postcss.github.io/postcss/logo.svg">

PostCSS is a tool for transforming CSS with JS plugins.
These plugins can support variables and mixins, transpile future CSS syntax,
inline images, and more.

PostCSS is used by Google, Twitter, Alibaba, and Shopify.
Its plugin, [Autoprefixer], is one of the most popular CSS processors.

PostCSS can do the same work as preprocessors like Sass, Less, and Stylus.
But PostCSS is modular, 3-30 times faster, and much more powerful.

Twitter account: [@postcss](https://twitter.com/postcss).
Weibo account:   [postcss](http://weibo.com/postcss).
VK.com page:     [postcss](https://vk.com/postcss).

[chat-img]: https://badges.gitter.im/Join%20Chat.svg
[ci-img]:   https://travis-ci.org/postcss/postcss.svg
[chat]:     https://gitter.im/postcss/postcss
[ci]:       https://travis-ci.org/postcss/postcss

[Examples](#what-is-postcss) | [Features](#features) | [Usage](#usage) | [Plugins](#plugins) | [Write Own Plugin](#how-to-develop-postcss-plugin) | [Options](#options)
--- | --- | --- | --- | --- | ---

<a href="https://evilmartians.com/?utm_source=postcss">
<img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg" alt="Sponsored by Evil Martians" width="236" height="54">
</a>

[Autoprefixer]: https://github.com/postcss/autoprefixer

## What is PostCSS

PostCSS itself is very small. It includes only a CSS parser,
a CSS node tree API, a source map generator, and a node tree stringifier.

All CSS transformations are made by plugins. And these plugins are just
small plain JS functions, which receive a CSS node tree, transform it,
and return a modified tree.

You can use the [cssnext] plugin pack and write future CSS code right now:

```css
:root {
    --mainColor: #ffbbaaff;
}
@custom-media    --mobile (width <= 640px);
@custom-selector --heading h1, h2, h3, h4, h5, h6;

.post-article --heading {
    color: color( var(--mainColor) blackness(+20%) );
}
@media (--mobile) {
    .post-article --heading {
        margin-top: 0;
    }
}
```

Or if you like the Sass syntax, you could combine
[`postcss-nested`] and [`postcss-mixins`]:

```css
@define-mixin social-icon $network $color {
    &.is-$network {
        background: $color;
    }
}

.social-icon {
    @mixin social-icon twitter  #55acee;
    @mixin social-icon facebook #3b5998;

    padding: 10px 5px;
    @media (max-width: 640px) {
        padding: 0;
    }
}
```

[cssnext]: https://cssnext.github.io/

## Features

Preprocessors are template languages, where you mix styles with code
(like PHP does with HTML).
In contrast, in PostCSS you write a custom subset of CSS.
All code can only be in JS plugins.

As a result, PostCSS offers three main benefits:

* **Performance:** PostCSS, written in JS, is [3 times faster] than libsass,
  which is written in C++.
* **Future CSS:** PostCSS plugins can read and rebuild an entire document,
  meaning that they can provide new language features. For example, [cssnext]
  transpiles the latest W3C drafts to current CSS syntax.
* **New abilities:** PostCSS plugins can read and change every part of CSS.
  It makes many new classes of tools possible. [Autoprefixer], [`rtlcss`],
  [`doiuse`] or [`postcss-colorblind`] are good examples.

[3 times faster]: https://github.com/postcss/benchmark

## Usage

You just need to follow these two steps to use PostCSS:

1. Add PostCSS to your build tool.
2. Select plugins from the list below and add them to your PostCSS process.

There are plugins for [Grunt], [Gulp], [webpack], [Broccoli] and [Brunch].

```js
gulp.task('css', function () {
    var postcss = require('gulp-postcss');
    return gulp.src('src/**/*.css')
        .pipe( postcss([ require('cssnext'), require('cssgrace') ]) )
        .pipe( gulp.dest('build/') );
});
```

For other environments you can use the [CLI tool] or the JS API:

```js
var postcss = require('postcss');
postcss([ require('cssnext'), require('cssgrace') ])
    .process(css, { from: 'src/app.css', to: 'app.css' })
    .then(function (result) {
        fs.writeFileSync('app.css', result.css);
        if ( result.map ) fs.writeFileSync('app.css.map', result.map);
    });
```

Read the [PostCSS API] for more details about the JS API.

[PostCSS API]: https://github.com/postcss/postcss/blob/master/docs/api.md
[CLI tool]:    https://github.com/code42day/postcss-cli
[Broccoli]:    https://github.com/jeffjewiss/broccoli-postcss
[webpack]:     https://github.com/postcss/postcss-loader
[Brunch]:      https://github.com/iamvdo/postcss-brunch
[Grunt]:       https://github.com/nDmitry/grunt-postcss
[Gulp]:        https://github.com/postcss/gulp-postcss

## Plugins

### Control

With [`postcss-plugin-context`] you can run different plugins
on different parts of CSS.

```css
.css-example.is-test-for-css4-browsers {
    color: gray(255, 50%);
}
@context cssnext {
    .css-example.is-fallback-for-all-browsers {
        color: gray(255, 50%);
    }
}
```

[`postcss-plugin-context`]: https://github.com/postcss/postcss-plugin-context

### Packs

* [`cssnano`] contains plugins that optimise CSS size for use in production.
* [`cssnext`] contains plugins that allow you to use future CSS features today.
* [`atcss`] contains plugins that transform your CSS according
  to special annotation comments.

[`cssnano`]:  https://github.com/ben-eb/cssnano
[`cssnext`]:  https://cssnext.github.io/
[`atcss`]:    https://github.com/morishitter/atcss

### Future CSS Syntax

* [`postcss-color-function`] supports functions to transform colors.
* [`postcss-color-gray`] supports the `gray()` function.
* [`postcss-color-hex-alpha`] supports `#rrggbbaa` and `#rgba` notation.
* [`postcss-color-hwb`] transforms `hwb()` to widely compatible `rgb()`.
* [`postcss-color-rebeccapurple`] supports the `rebeccapurple` color.
* [`postcss-custom-media`] supports custom aliases for media queries.
* [`postcss-custom-properties`] supports variables, using syntax from
  the W3C Custom Properties.
* [`postcss-css-variables`] supports variables for descendant/nested rules and at-rules
* [`postcss-custom-selectors`] adds custom aliases for selectors.
* [`postcss-font-variant`] transpiles human-readable `font-variant` to more
  widely supported CSS.
* [`postcss-host`] makes the Shadow DOM’s `:host` selector work properly
  with pseudo-classes.
* [`postcss-media-minmax`] adds `<=` and `=>` statements to media queries.
* [`postcss-selector-not`] transforms CSS4 `:not()` to CSS3 `:not()`.
* [`mq4-hover-shim`] supports the `@media (hover)` feature.

### Fallbacks

* [`postcss-color-rgba-fallback`] transforms `rgba()` to hexadecimal.
* [`postcss-epub`] adds the `-epub-` prefix to relevant properties.
* [`postcss-image-set`] adds `background-image` with first image for `image-set()`
* [`postcss-opacity`] adds opacity filter for IE8.
* [`postcss-pseudoelements`] Convert `::` selectors into `:` selectors
  for IE 8 compatibility.
* [`postcss-vmin`] generates `vm` fallback for `vmin` unit in IE9.
* [`postcss-will-change`] inserts 3D hack before `will-change` property.
* [`autoprefixer`] adds vendor prefixes for you, using data from Can I Use.
* [`cssgrace`] provides various helpers and transpiles CSS 3 for IE
  and other old browsers.
* [`pixrem`] generates pixel fallbacks for `rem` units.

### Language Extensions

* [`postcss-color-alpha`] transforms `#hex.a`, `black(alpha)` and `white(alpha)`
  to `rgba()`.
* [`postcss-for`] adds `@for` loops.
* [`postcss-conditionals`] adds `@if` statements.
* [`postcss-mixins`] enables mixins more powerful than Sass’s,
  defined within stylesheets or in JS.
* [`postcss-map`] enables configuration maps.
* [`postcss-neat`] is a semantic and fluid grid framework.
* [`postcss-nested`] unwraps nested rules.
* [`postcss-quantity-queries`] enables quantity queries.
* [`postcss-simple-extend`] supports extending of silent classes,
  like Sass’s `@extend`.
* [`postcss-simple-vars`] supports for Sass-style variables.
* [`csstyle`] adds components workflow to your styles.
* [`lost`] feature rich `calc()` grid system by Jeet author.

### Optimizations

* [`postcss-assets`] allows you to simplify URLs, insert image dimensions,
  and inline files.
* [`postcss-at2x`] handles retina background images via use of `at-2x` keyword.
* [`postcss-calc`] reduces `calc()` to values
  (when expressions involve the same units).
* [`postcss-colormin`] reduces color values to their smallest representations.
* [`postcss-convert-values`] reduces length and time values (e.g. ms -> s).
* [`postcss-data-packer`] moves embedded Base64 data out of the stylesheet
  and into a separate file.
* [`postcss-discard-duplicates`] removes duplicate declarations and rules.
* [`postcss-discard-empty`] removes empty rules and declarations.
* [`postcss-discard-font-face`] removes unused `@font-face` declarations.
* [`postcss-font-family`] optimises `font` and `font-family` declarations.
* [`postcss-import`] inlines the stylesheets referred to by `@import` rules.
* [`postcss-merge-idents`] merges duplicated `@keyframes` with different names.
* [`postcss-merge-rules`] merges adjacent rules when
  selectors/properties overlap.
* [`postcss-minify-font-weight`] compresses `font-weight` values.
* [`postcss-minify-selectors`] normalizes selectors for better compression.
* [`postcss-normalize-url`] normalizes `url()`s and trims quotes
  where they are unnecessary.
* [`postcss-reduce-idents`] compresses `@keyframes`, `@counter-style` &
  `counter` identifiers.
* [`postcss-url`] rebases or inlines `url()`s.
* [`postcss-zindex`] rebases positive `z-index` values.
* [`csswring`] is a CSS minifier.
* [`css-byebye`] removes the CSS rules that you don’t want.
* [`css-mqpacker`] joins matching CSS media queries into a single statement.
* [`webpcss`] adds URLs for WebP images, so they can be used by browsers
  that support WebP.
* [`postcss-single-charset`] ensures that there is one
  and only one `@charset` rule at the top of file.

### Shortcuts

* [`postcss-default-unit`] adds default unit to numeric CSS properties.
* [`postcss-easings`] replaces easing names from easings.net
  with `cubic-bezier()` functions.
* [`postcss-focus`] adds `:focus` selector to every `:hover`.
* [`postcss-generate-preset`] allows quick generation of rules.
  Useful for creating repetitive utilities.
* [`postcss-size`] adds a `size` shortcut that sets width and height
  with one declaration.

### Others

* [`postcss-brand-colors`] inserts company brand colors
  in the `brand-colors` module.
* [`postcss-color-palette`] transforms CSS 2 color keywords to a custom palette.
* [`postcss-colorblind`] transforms colors using filters to simulate
  colorblindness
* [`postcss-discard-comments`] removes comments based on rules you specify.
* [`postcss-log-warnings`] logs warnings messages from other plugins
  in the console.
* [`postcss-messages`] displays warning messages from other plugins
  right in your browser.
* [`postcss-pxtorem`] convert pixel units to `rem`.
* [`postcss-style-guide`] generate a style guide automatically.
* [`rtlcss`] mirrors styles for right-to-left locales.

### Analysis

* [`postcss-bem-linter`] lints CSS for conformance to SUIT CSS methodology.
* [`postcss-cssstats`] returns an object with CSS statistics.
* [`css2modernizr`] creates a Modernizr config file
  that requires only the tests that your CSS uses.
* [`doiuse`] lints CSS for browser support, using data from Can I Use.
* [`list-selectors`] lists and categorizes the selectors used in your CSS,
  for code review.

### Fun

* [`postcss-australian-stylesheets`] Australian Style Sheets.
* [`postcss-canadian-stylesheets`] Canadian Style Sheets.
* [`postcss-spiffing`] lets you use British English in your CSS.

[`postcss-australian-stylesheets`]: https://github.com/dp-lewis/postcss-australian-stylesheets
[`postcss-canadian-stylesheets`]:   https://github.com/chancancode/postcss-canadian-stylesheets
[`postcss-color-rgba-fallback`]:    https://github.com/postcss/postcss-color-rgba-fallback
[`postcss-color-rebeccapurple`]:    https://github.com/postcss/postcss-color-rebeccapurple
[`postcss-discard-duplicates`]:     https://github.com/ben-eb/postcss-discard-duplicates
[`postcss-minify-font-weight`]:     https://github.com/ben-eb/postcss-minify-font-weight
[`postcss-discard-font-face`]:      https://github.com/ben-eb/postcss-discard-font-face
[`postcss-custom-properties`]:      https://github.com/postcss/postcss-custom-properties
[`postcss-custom-selectors`]:       https://github.com/postcss/postcss-custom-selectors
[`postcss-discard-comments`]:       https://github.com/ben-eb/postcss-discard-comments
[`postcss-minify-selectors`]:       https://github.com/ben-eb/postcss-minify-selectors
[`postcss-quantity-queries`]:       https://github.com/pascalduez/postcss-quantity-queries
[`postcss-generate-preset`]:        https://github.com/simonsmith/postcss-generate-preset
[`postcss-color-hex-alpha`]:        https://github.com/postcss/postcss-color-hex-alpha
[`postcss-color-function`]:         https://github.com/postcss/postcss-color-function
[`postcss-convert-values`]:         https://github.com/ben-eb/postcss-convert-values
[`postcss-pseudoelements`]:         https://github.com/axa-ch/postcss-pseudoelements
[`postcss-single-charset`]:         https://github.com/hail2u/postcss-single-charset
[`postcss-normalize-url`]:          https://github.com/ben-eb/postcss-normalize-url
[`postcss-color-palette`]:          https://github.com/zaim/postcss-color-palette
[`postcss-discard-empty`]:          https://github.com/ben-eb/postcss-discard-empty
[`postcss-reduce-idents`]:          https://github.com/ben-eb/postcss-reduce-idents
[`postcss-simple-extend`]:          https://github.com/davidtheclark/postcss-simple-extend
[`postcss-css-variables`]:          https://github.com/MadLittleMods/postcss-css-variables
[`postcss-conditionals`]:           https://github.com/andyjansson/postcss-conditionals
[`postcss-selector-not`]:           https://github.com/postcss/postcss-selector-not
[`postcss-default-unit`]:           https://github.com/antyakushev/postcss-default-unit
[`postcss-media-minmax`]:           https://github.com/postcss/postcss-media-minmax
[`postcss-merge-idents`]:           https://github.com/ben-eb/postcss-merge-idents
[`postcss-custom-media`]:           https://github.com/postcss/postcss-custom-media
[`postcss-log-warnings`]:           https://github.com/davidtheclark/postcss-log-warnings
[`postcss-brand-colors`]:           https://github.com/postcss/postcss-brand-colors
[`postcss-font-variant`]:           https://github.com/postcss/postcss-font-variant
[`postcss-style-guide`]:            https://github.com/morishitter/postcss-style-guide
[`postcss-will-change`]:            https://github.com/postcss/postcss-will-change
[`postcss-merge-rules`]:            https://github.com/ben-eb/postcss-merge-rules
[`postcss-simple-vars`]:            https://github.com/postcss/postcss-simple-vars
[`postcss-data-packer`]:            https://github.com/Ser-Gen/postcss-data-packer
[`postcss-font-family`]:            https://github.com/ben-eb/postcss-font-family
[`postcss-color-alpha`]:            https://github.com/avanes/postcss-color-alpha
[`postcss-bem-linter`]:             https://github.com/necolas/postcss-bem-linter
[`postcss-color-gray`]:             https://github.com/postcss/postcss-color-gray
[`postcss-colorblind`]:             https://github.com/btholt/postcss-colorblind
[`postcss-color-hwb`]:              https://github.com/postcss/postcss-color-hwb
[`postcss-image-set`]:              https://github.com/alex499/postcss-image-set
[`postcss-colormin`]:               https://github.com/ben-eb/colormin
[`pleeease-filters`]:               https://github.com/iamvdo/pleeease-filters
[`postcss-messages`]:               https://github.com/postcss/postcss-messages
[`postcss-spiffing`]:               https://github.com/HashanP/postcss-spiffing
[`postcss-cssstats`]:               https://github.com/cssstats/postcss-cssstats
[`postcss-easings`]:                https://github.com/postcss/postcss-easings
[`postcss-opacity`]:                https://github.com/iamvdo/postcss-opacity
[`postcss-pxtorem`]:                https://github.com/cuth/postcss-pxtorem
[`postcss-assets`]:                 https://github.com/borodean/postcss-assets
[`postcss-import`]:                 https://github.com/postcss/postcss-import
[`postcss-nested`]:                 https://github.com/postcss/postcss-nested
[`postcss-zindex`]:                 https://github.com/ben-eb/postcss-zindex
[`postcss-mixins`]:                 https://github.com/postcss/postcss-mixins
[`mq4-hover-shim`]:                 https://github.com/twbs/mq4-hover-shim
[`list-selectors`]:                 https://github.com/davidtheclark/list-selectors
[`css2modernizr`]:                  https://github.com/vovanbo/css2modernizr
[`postcss-focus`]:                  https://github.com/postcss/postcss-focus
[`postcss-at2x`]:                   https://github.com/simonsmith/postcss-at2x
[`postcss-neat`]:                   https://github.com/jo-asakura/postcss-neat
[`autoprefixer`]:                   https://github.com/postcss/autoprefixer
[`css-mqpacker`]:                   https://github.com/hail2u/node-css-mqpacker
[`postcss-epub`]:                   https://github.com/Rycochet/postcss-epub
[`postcss-calc`]:                   https://github.com/postcss/postcss-calc
[`postcss-size`]:                   https://github.com/postcss/postcss-size
[`postcss-host`]:                   https://github.com/vitkarpov/postcss-host
[`postcss-vmin`]:                   https://github.com/iamvdo/postcss-vmin
[`postcss-url`]:                    https://github.com/postcss/postcss-url
[`postcss-map`]:                    https://github.com/pascalduez/postcss-map
[`postcss-for`]:                    https://github.com/antyakushev/postcss-for
[`css-byebye`]:                     https://github.com/AoDev/css-byebye
[`cssgrace`]:                       https://github.com/cssdream/cssgrace
[`csswring`]:                       https://github.com/hail2u/node-csswring
[`csstyle`]:                        https://github.com/geddski/csstyle
[`webpcss`]:                        https://github.com/lexich/webpcss
[`rtlcss`]:                         https://github.com/MohammadYounes/rtlcss
[`pixrem`]:                         https://github.com/robwierzbowski/node-pixrem
[`doiuse`]:                         https://github.com/anandthakker/doiuse
[`lost`]:                           https://github.com/corysimmons/lost

## How to Develop PostCSS Plugin

* [Plugin Guidelines](https://github.com/postcss/postcss/blob/master/docs/guidelines/plugin.md)
* [Plugin Boilerplate](https://github.com/postcss/postcss-plugin-boilerplate)
* [PostCSS API](https://github.com/postcss/postcss/blob/master/docs/api.md)
* [Ask questions](https://gitter.im/postcss/postcss)

## Options

### Source Map

PostCSS has great [source maps] support. It can read and interpret maps
from previous transformation steps, autodetect the format that you expect,
and output both external and inline maps.

To ensure that you generate an accurate source map, you must indicate the input
and output CSS files paths — using the options `from` and `to`, respectively.

To generate a new source map with the default options, simply set `map: true`.
This will generate an inline source map that contains the source content.
If you don’t want the map inlined, you can use set `map.inline: false`.

```js
processor
    .process(css, {
        from: 'app.sass.css',
        to:   'app.css',
        map: { inline: false },
    })
    .then(function (result) {
        result.map //=> '{ "version":3,
                   //      "file":"app.css",
                   //      "sources":["app.sass"],
                   //       "mappings":"AAAA,KAAI" }'
    });
```

If PostCSS finds source maps from a previous transformation,
it will automatically update that source map with the same options.

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
