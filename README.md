# PostCSS [![Build Status][ci-img]][ci] [![Gitter][chat-img]][chat]

<img align="right" width="95" height="95"
     title="Philosopher’s stone, logo of PostCSS"
     src="http://postcss.github.io/postcss/logo.svg">

PostCSS is a tool for transforming CSS with JS plugins.
These plugins can support variables and mixins, transpile future CSS syntax,
inline images, and more.

Google, Twitter, Alibaba, and Shopify uses PostCSS.
Its plugin, [Autoprefixer], is one of the most popular CSS processors.

PostCSS can do the same work as preprocessors like Sass, Less, and Stylus.
But PostCSS is modular, 3-30 times faster, and much more powerful.

Twitter account: [@postcss](https://twitter.com/postcss).
Weibo account:   [postcss](http://weibo.com/postcss).
VK.com page:     [postcss](https://vk.com/postcss).

[chat-img]: https://img.shields.io/badge/Gitter-Join_the_PostCSS_chat-brightgreen.svg
[ci-img]:   https://img.shields.io/travis/postcss/postcss.svg
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

.post-article :--heading {
    color: color( var(--mainColor) blackness(+20%) );
}
@media (--mobile) {
    .post-article :--heading {
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

[cssnext]: http://cssnext.io/

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

There are plugins for [Grunt], [Gulp], [webpack], [Broccoli],
[Brunch] and [ENB].

```js
gulp.task('css', function () {
    var postcss = require('gulp-postcss');
    return gulp.src('src/**/*.css')
        .pipe( postcss([ require('cssnext')(), require('cssnano')() ]) )
        .pipe( gulp.dest('build/') );
});
```

For other environments, you can use the [CLI tool] or the JS API:

```js
var postcss = require('postcss');
postcss([ require('cssnext')(), require('cssnano')() ])
    .process(css, { from: 'src/app.css', to: 'app.css' })
    .then(function (result) {
        fs.writeFileSync('app.css', result.css);
        if ( result.map ) fs.writeFileSync('app.css.map', result.map);
    });
```

You can also use PostCSS plugins with the Stylus by using [`poststylus`].

Read the [PostCSS API] for more details about the JS API.

[`poststylus`]: https://github.com/seaneking/poststylus
[PostCSS API]:  https://github.com/postcss/postcss/blob/master/docs/api.md
[Broccoli]:     https://github.com/jeffjewiss/broccoli-postcss
[CLI tool]:     https://github.com/code42day/postcss-cli
[webpack]:      https://github.com/postcss/postcss-loader
[Brunch]:       https://github.com/iamvdo/postcss-brunch
[Grunt]:        https://github.com/nDmitry/grunt-postcss
[Gulp]:         https://github.com/postcss/gulp-postcss
[ENB]:          https://github.com/theprotein/enb-postcss

## Plugins

### Control

There is two way to make PostCSS magic more explicit.

Define a plugins contexts and switch between them in different parts of CSS
by [`postcss-plugin-context`]:

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

Or to enable plugins right in CSS by [`postcss-use`]:

```css
@use autoprefixer(browsers: ['last 2 versions']);

:fullscreen a {
    display: flex
}
```

[`postcss-plugin-context`]: https://github.com/postcss/postcss-plugin-context
[`postcss-use`]:            https://github.com/postcss/postcss-use

### Packs

* [`atcss`] contains plugins that transform your CSS according
  to special annotation comments.
* [`cssnano`] contains plugins that optimize CSS size for use in production.
* [`cssnext`] contains plugins that allow you to use future CSS features today.

[`cssnano`]:  https://github.com/ben-eb/cssnano
[`cssnext`]:  http://cssnext.io/
[`atcss`]:    https://github.com/morishitter/atcss

### Future CSS Syntax

* [`postcss-color-function`] supports functions to transform colors.
* [`postcss-color-gray`] supports the `gray()` function.
* [`postcss-color-hex-alpha`] supports `#rrggbbaa` and `#rgba` notation.
* [`postcss-color-hwb`] transforms `hwb()` to widely compatible `rgb()`.
* [`postcss-color-rebeccapurple`] supports the `rebeccapurple` color.
* [`postcss-conic-gradient`] supports the `conic-gradient` background.
* [`postcss-css-variables`] supports variables for nested rules,
  selectors, and at-rules
* [`postcss-custom-media`] supports custom aliases for media queries.
* [`postcss-custom-properties`] supports variables, using syntax from
  the W3C Custom Properties.
* [`postcss-custom-selectors`] adds custom aliases for selectors.
* [`postcss-font-variant`] transpiles human-readable `font-variant`
  to more widely supported CSS.
* [`postcss-host`] makes the Shadow DOM’s `:host` selector work properly
  with pseudo-classes.
* [`postcss-media-minmax`] adds `<=` and `=>` statements to media queries.
* [`postcss-pseudo-class-any-link`] adds `:any-link` pseudo-class.
* [`postcss-selector-not`] transforms CSS4 `:not()` to CSS3 `:not()`.
* [`mq4-hover-shim`] supports the `@media (hover)` feature.

See also [`cssnext`] plugins pack to add Future CSS syntax by one line of code.

### Fallbacks

* [`postcss-color-rgba-fallback`] transforms `rgba()` to hexadecimal.
* [`postcss-epub`] adds the `-epub-` prefix to relevant properties.
* [`postcss-image-set`] adds `background-image` with first image
  for `image-set()`.
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

* [`postcss-bem`] adds at-rules for BEM and SUIT style classes.
* [`postcss-conditionals`] adds `@if` statements.
* [`postcss-define-property`] to define properties shortcut.
* [`postcss-each`] adds `@each` statement.
* [`postcss-for`] adds `@for` loops.
* [`postcss-map`] enables configuration maps.
* [`postcss-mixins`] enables mixins more powerful than Sass’s,
  defined within stylesheets or in JS.
* [`postcss-media-variables`] adds support for `var()` and `calc()`
  in `@media` rules
* [`postcss-modular-scale`] adds a modular scale `ms()` function.
* [`postcss-nested`] unwraps nested rules.
* [`postcss-pseudo-class-enter`] transforms `:enter` into `:hover` and `:focus`.
* [`postcss-quantity-queries`] enables quantity queries.
* [`postcss-simple-extend`] supports extending of silent classes,
  like Sass’s `@extend`.
* [`postcss-simple-vars`] supports for Sass-style variables.
* [`postcss-strip-units`] strips units off of property values.
* [`postcss-vertical-rhythm`] adds a vertical rhythm unit
  based on `font-size` and `line-height`.
* [`csstyle`] adds components workflow to your styles.

### Colors

* [`postcss-brand-colors`] inserts company brand colors
  in the `brand-colors` module.
* [`postcss-color-alpha`] transforms `#hex.a`, `black(alpha)` and `white(alpha)`
  to `rgba()`.
* [`postcss-color-hcl`] transforms `hcl(H, C, L)` and `HCL(H, C, L, alpha)`
  to `#rgb` and `rgba()`.
* [`postcss-color-mix`] mixes two colors together.
* [`postcss-color-palette`] transforms CSS 2 color keywords to a custom palette.
* [`postcss-color-pantone`] transforms pantone color to RGB.
* [`postcss-color-scale`] adds a color scale `cs()` function.
* [`postcss-hexrgba`] adds shorthand hex `rgba(hex, alpha)` method.

### Grids

* [`postcss-grid`] adds a semantic grid system.
* [`postcss-neat`] is a semantic and fluid grid framework.
* [`lost`] feature-rich `calc()` grid system by Jeet author.

### Optimizations

* [`postcss-assets`] allows you to simplify URLs, insert image dimensions,
  and inline files.
* [`postcss-at2x`] handles retina background images via use of `at-2x` keyword.
* [`postcss-calc`] reduces `calc()` to values
  (when expressions involve the same units).
* [`postcss-data-packer`] moves embedded Base64 data to a separate file.
* [`postcss-import`] inlines the stylesheets referred to by `@import` rules.
* [`postcss-single-charset`] ensures that there is one and only one
  `@charset` rule at the top of file.
* [`postcss-sprites`] generates CSS sprites from stylesheets.
* [`postcss-url`] rebases or inlines `url()`s.
* [`postcss-zindex`] rebases positive `z-index` values.
* [`css-byebye`] removes the CSS rules that you don’t want.
* [`css-mqpacker`] joins matching CSS media queries into a single statement.
* [`webpcss`] adds URLs for WebP images for browsers that support WebP.

See also plugins in modular minifier [`cssnano`].

### Shortcuts

* [`postcss-border`] adds shorthand declarations for width
  and color of all borders in `border` property.
* [`postcss-clearfix`] adds `fix` and `fix-legacy` properties to the `clear`
  declaration.
* [`postcss-default-unit`] adds default unit to numeric CSS properties.
* [`postcss-easings`] replaces easing names from easings.net
  with `cubic-bezier()` functions.
* [`postcss-focus`] adds `:focus` selector to every `:hover`.
* [`postcss-fontpath`] adds font links for different browsers.
* [`postcss-generate-preset`] allows quick generation of rules.
  Useful for creating repetitive utilities.
* [`postcss-position`] adds shorthand declarations for position attributes.
* [`postcss-property-lookup`] allows referencing property values without
  a variable.
* [`postcss-short`] adds and extends numerous shorthand properties.
* [`postcss-size`] adds a `size` shortcut that sets width and height
  with one declaration.
* [`postcss-verthorz`] adds vertical and horizontal spacing declarations.

### Others

* [`postcss-class-prefix`] adds a prefix/namespace to class selectors.
* [`postcss-colorblind`] transforms colors using filters to simulate
  colorblindness.
* [`postcss-fakeid`] transforms `#foo` IDs to attribute selectors `[id="foo"]`.
* [`postcss-flexboxfixer`] unprefixes `-webkit-` only flexbox in legacy CSS.
* [`postcss-gradientfixer`] unprefixes `-webkit-` only gradients in legacy CSS.
* [`postcss-log-warnings`] logs warnings messages from other plugins
  in the console.
* [`postcss-messages`] displays warning messages from other plugins
  right in your browser.
* [`postcss-pxtorem`] converts pixel units to `rem`.
* [`postcss-style-guide`] generates a style guide automatically.
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
* [`postcss-pointer`] Replaces `pointer: cursor` with `cursor: pointer`.
* [`postcss-spiffing`] lets you use British English in your CSS.

[`postcss-australian-stylesheets`]: https://github.com/dp-lewis/postcss-australian-stylesheets
[`postcss-pseudo-class-any-link`]:  https://github.com/jonathantneal/postcss-pseudo-class-any-link
[`postcss-canadian-stylesheets`]:   https://github.com/chancancode/postcss-canadian-stylesheets
[`postcss-color-rebeccapurple`]:    https://github.com/postcss/postcss-color-rebeccapurple
[`postcss-color-rgba-fallback`]:    https://github.com/postcss/postcss-color-rgba-fallback
[`postcss-discard-duplicates`]:     https://github.com/ben-eb/postcss-discard-duplicates
[`postcss-minify-font-weight`]:     https://github.com/ben-eb/postcss-minify-font-weight
[`postcss-pseudo-class-enter`]:     https://github.com/jonathantneal/postcss-pseudo-class-enter
[`postcss-custom-properties`]:      https://github.com/postcss/postcss-custom-properties
[`postcss-discard-font-face`]:      https://github.com/ben-eb/postcss-discard-font-face
[`postcss-custom-selectors`]:       https://github.com/postcss/postcss-custom-selectors
[`postcss-discard-comments`]:       https://github.com/ben-eb/postcss-discard-comments
[`postcss-minify-selectors`]:       https://github.com/ben-eb/postcss-minify-selectors
[`postcss-quantity-queries`]:       https://github.com/pascalduez/postcss-quantity-queries
[`postcss-color-hex-alpha`]:        https://github.com/postcss/postcss-color-hex-alpha
[`postcss-define-property`]:        https://github.com/daleeidd/postcss-define-property
[`postcss-generate-preset`]:        https://github.com/simonsmith/postcss-generate-preset
[`postcss-media-variables`]:        https://github.com/WolfgangKluge/postcss-media-variables
[`postcss-property-lookup`]:        https://github.com/simonsmith/postcss-property-lookup
[`postcss-vertical-rhythm`]:        https://github.com/markgoodyear/postcss-vertical-rhythm
[`postcss-color-function`]:         https://github.com/postcss/postcss-color-function
[`postcss-conic-gradient`]:         https://github.com/jonathantneal/postcss-conic-gradient
[`postcss-convert-values`]:         https://github.com/ben-eb/postcss-convert-values
[`postcss-pseudoelements`]:         https://github.com/axa-ch/postcss-pseudoelements
[`postcss-single-charset`]:         https://github.com/hail2u/postcss-single-charset
[`postcss-color-palette`]:          https://github.com/zaim/postcss-color-palette
[`postcss-color-pantone`]:          https://github.com/longdog/postcss-color-pantone
[`postcss-css-variables`]:          https://github.com/MadLittleMods/postcss-css-variables
[`postcss-discard-empty`]:          https://github.com/ben-eb/postcss-discard-empty
[`postcss-gradientfixer`]:          https://github.com/hallvors/postcss-gradientfixer
[`postcss-modular-scale`]:          https://github.com/kristoferjoseph/postcss-modular-scale
[`postcss-normalize-url`]:          https://github.com/ben-eb/postcss-normalize-url
[`postcss-reduce-idents`]:          https://github.com/ben-eb/postcss-reduce-idents
[`postcss-simple-extend`]:          https://github.com/davidtheclark/postcss-simple-extend
[`postcss-brand-colors`]:           https://github.com/postcss/postcss-brand-colors
[`postcss-class-prefix`]:           https://github.com/thompsongl/postcss-class-prefix
[`postcss-conditionals`]:           https://github.com/andyjansson/postcss-conditionals
[`postcss-custom-media`]:           https://github.com/postcss/postcss-custom-media
[`postcss-default-unit`]:           https://github.com/antyakushev/postcss-default-unit
[`postcss-flexboxfixer`]:           https://github.com/hallvors/postcss-flexboxfixer
[`postcss-font-variant`]:           https://github.com/postcss/postcss-font-variant
[`postcss-log-warnings`]:           https://github.com/davidtheclark/postcss-log-warnings
[`postcss-media-minmax`]:           https://github.com/postcss/postcss-media-minmax
[`postcss-merge-idents`]:           https://github.com/ben-eb/postcss-merge-idents
[`postcss-selector-not`]:           https://github.com/postcss/postcss-selector-not
[`postcss-color-alpha`]:            https://github.com/avanes/postcss-color-alpha
[`postcss-color-scale`]:            https://github.com/kristoferjoseph/postcss-color-scale
[`postcss-data-packer`]:            https://github.com/Ser-Gen/postcss-data-packer
[`postcss-font-family`]:            https://github.com/ben-eb/postcss-font-family
[`postcss-merge-rules`]:            https://github.com/ben-eb/postcss-merge-rules
[`postcss-simple-vars`]:            https://github.com/postcss/postcss-simple-vars
[`postcss-strip-units`]:            https://github.com/whitneyit/postcss-strip-units
[`postcss-style-guide`]:            https://github.com/morishitter/postcss-style-guide
[`postcss-will-change`]:            https://github.com/postcss/postcss-will-change
[`postcss-bem-linter`]:             https://github.com/necolas/postcss-bem-linter
[`postcss-color-gray`]:             https://github.com/postcss/postcss-color-gray
[`postcss-colorblind`]:             https://github.com/btholt/postcss-colorblind
[`postcss-color-hcl`]:              https://github.com/devgru/postcss-color-hcl
[`postcss-color-hwb`]:              https://github.com/postcss/postcss-color-hwb
[`postcss-color-mix`]:              https://github.com/iamstarkov/postcss-color-mix
[`postcss-image-set`]:              https://github.com/alex499/postcss-image-set
[`postcss-clearfix`]:               https://github.com/seaneking/postcss-clearfix
[`postcss-colormin`]:               https://github.com/ben-eb/colormin
[`postcss-cssstats`]:               https://github.com/cssstats/postcss-cssstats
[`postcss-messages`]:               https://github.com/postcss/postcss-messages
[`postcss-position`]:               https://github.com/seaneking/postcss-position
[`postcss-spiffing`]:               https://github.com/HashanP/postcss-spiffing
[`postcss-verthorz`]:               https://github.com/davidhemphill/postcss-verthorz
[`pleeease-filters`]:               https://github.com/iamvdo/pleeease-filters
[`postcss-fontpath`]:               https://github.com/seaneking/postcss-fontpath
[`postcss-easings`]:                https://github.com/postcss/postcss-easings
[`postcss-hexrgba`]:                https://github.com/seaneking/postcss-hexrgba
[`postcss-opacity`]:                https://github.com/iamvdo/postcss-opacity
[`postcss-pointer`]:                https://github.com/markgoodyear/postcss-pointer
[`postcss-pxtorem`]:                https://github.com/cuth/postcss-pxtorem
[`postcss-sprites`]:                https://github.com/2createStudio/postcss-sprites
[`postcss-assets`]:                 https://github.com/borodean/postcss-assets
[`postcss-border`]:                 https://github.com/andrepolischuk/postcss-border
[`postcss-fakeid`]:                 https://github.com/pathsofdesign/postcss-fakeid
[`postcss-import`]:                 https://github.com/postcss/postcss-import
[`postcss-mixins`]:                 https://github.com/postcss/postcss-mixins
[`postcss-nested`]:                 https://github.com/postcss/postcss-nested
[`postcss-zindex`]:                 https://github.com/ben-eb/postcss-zindex
[`list-selectors`]:                 https://github.com/davidtheclark/list-selectors
[`mq4-hover-shim`]:                 https://github.com/twbs/mq4-hover-shim
[`postcss-focus`]:                  https://github.com/postcss/postcss-focus
[`css2modernizr`]:                  https://github.com/vovanbo/css2modernizr
[`postcss-short`]:                  https://github.com/jonathantneal/postcss-short
[`postcss-at2x`]:                   https://github.com/simonsmith/postcss-at2x
[`postcss-calc`]:                   https://github.com/postcss/postcss-calc
[`postcss-each`]:                   https://github.com/outpunk/postcss-each
[`postcss-epub`]:                   https://github.com/Rycochet/postcss-epub
[`postcss-grid`]:                   https://github.com/andyjansson/postcss-grid
[`postcss-host`]:                   https://github.com/vitkarpov/postcss-host
[`postcss-neat`]:                   https://github.com/jo-asakura/postcss-neat
[`postcss-size`]:                   https://github.com/postcss/postcss-size
[`postcss-vmin`]:                   https://github.com/iamvdo/postcss-vmin
[`autoprefixer`]:                   https://github.com/postcss/autoprefixer
[`css-mqpacker`]:                   https://github.com/hail2u/node-css-mqpacker
[`postcss-bem`]:                    https://github.com/ileri/postcss-bem
[`postcss-for`]:                    https://github.com/antyakushev/postcss-for
[`postcss-map`]:                    https://github.com/pascalduez/postcss-map
[`postcss-url`]:                    https://github.com/postcss/postcss-url
[`css-byebye`]:                     https://github.com/AoDev/css-byebye
[`cssgrace`]:                       https://github.com/cssdream/cssgrace
[`csstyle`]:                        https://github.com/geddski/csstyle
[`webpcss`]:                        https://github.com/lexich/webpcss
[`doiuse`]:                         https://github.com/anandthakker/doiuse
[`pixrem`]:                         https://github.com/robwierzbowski/node-pixrem
[`rtlcss`]:                         https://github.com/MohammadYounes/rtlcss
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
  in the output CSS as a Base64-encoded comment. By default, it is `true`.
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
  content (for example, Sass source) of the source map. By default, it’s `true`.
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
