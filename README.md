# PostCSS [![Travis Build Status][travis-img]][travis] [![AppVeyor Build Status][appveyor-img]][appveyor] [![Gitter][chat-img]][chat]

<img align="right" width="95" height="95"
     title="Philosopher’s stone, logo of PostCSS"
     src="http://postcss.github.io/postcss/logo.svg">

PostCSS is a tool for transforming styles with JS plugins.
These plugins can support variables and mixins, transpile future CSS syntax,
inline images, and more.

PostCSS is used by industry leaders including Google, Twitter, Alibaba,
and Shopify. The [Autoprefixer] PostCSS plugin is one of the most popular
CSS processors.

PostCSS can do the same work as preprocessors like Sass, Less, and Stylus.
But PostCSS is modular, 3-30 times faster, and much more powerful.

Twitter account: [@postcss](https://twitter.com/postcss).
VK.com page:     [postcss](https://vk.com/postcss).

[appveyor-img]: https://img.shields.io/appveyor/ci/ai/postcss.svg?label=windows
[travis-img]:   https://img.shields.io/travis/postcss/postcss.svg?label=unix
[chat-img]:     https://img.shields.io/badge/Gitter-Join_the_PostCSS_chat-brightgreen.svg
[appveyor]:     https://ci.appveyor.com/project/ai/postcss
[travis]:       https://travis-ci.org/postcss/postcss
[chat]:         https://gitter.im/postcss/postcss

[Examples](#what-is-postcss) | [Features](#features) | [Usage](#usage) | [Syntaxes](#custom-syntaxes) | [Plugins](#plugins) | [Development](#how-to-develop-for-postcss) | [Options](#options)
--- | --- | --- | --- | --- | --- | ---

<a href="https://evilmartians.com/?utm_source=postcss">
<img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg" alt="Sponsored by Evil Martians" width="236" height="54">
</a>

[Autoprefixer]: https://github.com/postcss/autoprefixer

## What is PostCSS

PostCSS itself is very small. It includes only a CSS parser,
a CSS node tree API, a source map generator, and a node tree stringifier.

All of the style transformations are performed by plugins, which are
plain JS functions. Each plugin receives a CSS node tree, transforms it & then
returns the modified tree.

You can use the [cssnext] plugin pack and write future CSS code right now:

```css
:root {
    --mainColor: #ffbbaaff;
}
@custom-media    --mobile (width <= 640px);
@custom-selector :--heading h1, h2, h3, h4, h5, h6;

.post-article :--heading {
    color: color( var(--mainColor) blackness(+20%) );
}
@media (--mobile) {
    .post-article :--heading {
        margin-top: 0;
    }
}
```

Or if you like the Sass syntax, you could use the [PreCSS] plugin pack:

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
[PreCSS]:  https://github.com/jonathantneal/precss

## Features

Preprocessors are template languages, where you mix styles with code
(like PHP does with HTML).

In contrast, in PostCSS you write a custom subset of CSS.
All code can only be in JS plugins.

As a result, PostCSS offers three main benefits:

* **Performance:** PostCSS, written in JS, is [2 times faster] than libsass,
  which is written in C++.
* **Future CSS:** PostCSS plugins can read and rebuild an entire document,
  meaning that they can provide new language features. For example, [cssnext]
  transpiles the latest W3C drafts to current CSS syntax.
* **New abilities:** PostCSS plugins can read and change every part of styles.
  It makes many new classes of tools possible. [Autoprefixer], [`rtlcss`],
  [`doiuse`] or [`postcss-colorblind`] are good examples.

[2 times faster]: https://github.com/postcss/benchmark

## Usage

Start using PostCSS in just two steps:

1. Add PostCSS to your build tool.
2. Select plugins from the list below and add them to your PostCSS process.

There are plugins for [Grunt], [Gulp], [webpack], [Broccoli],
[Brunch], [ENB], [Fly], [Stylus] and [Connect/Express].

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

If you want to run PostCSS on node.js 0.10, add [Promise polyfill]:

```js
require('es6-promise').polyfill();
var postcss = require('postcss');
```

Read the [PostCSS API] for more details about the JS API.

[Promise polyfill]: https://github.com/jakearchibald/es6-promise
[Connect/Express]:  https://github.com/jedmao/postcss-middleware
[PostCSS API]:      https://github.com/postcss/postcss/blob/master/docs/api.md
[Broccoli]:         https://github.com/jeffjewiss/broccoli-postcss
[CLI tool]:         https://github.com/code42day/postcss-cli
[webpack]:          https://github.com/postcss/postcss-loader
[Brunch]:           https://github.com/iamvdo/postcss-brunch
[Stylus]:           https://github.com/seaneking/poststylus
[Grunt]:            https://github.com/nDmitry/grunt-postcss
[Gulp]:             https://github.com/postcss/gulp-postcss
[ENB]:              https://github.com/theprotein/enb-postcss
[Fly]:              https://github.com/postcss/fly-postcss

## Custom Syntaxes

PostCSS can transform styles in any syntax, not only in CSS.
There are 3 special arguments in `process()` method to control syntax.
You can even separately set input parser and output stringifier.

* `syntax` accepts object with `parse` and `stringify` functions.
* `parser` accepts input parser function.
* `stringifier` accepts output stringifier function.

```js
var safe = require('postcss-safe-parser');
postcss(plugins).process('a {', { parser: safe }).then(function (result) {
    result.css //=> 'a {}'
});
```

### Syntaxes

* [`postcss-scss`] to work with SCSS *(but does not compile SCSS to CSS)*.

[`postcss-scss`]: https://github.com/postcss/postcss-scss

### Parsers

* [`postcss-safe-parser`] finds and fix CSS syntax errors.

[`postcss-safe-parser`]: https://github.com/postcss/postcss-safe-parser

### Stringifiers

* [`midas`] converts a CSS string to highlighted HTML.

[`midas`]: https://github.com/ben-eb/midas

## Plugins

Go to [postcss.parts] for a searchable catalog of the plugins mentioned below.

[postcss.parts]: http://postcss.parts

### Control

There are two ways to make PostCSS magic more explicit.

Limit a plugin's local stylesheet context using [`postcss-plugin-context`]:

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

Or enable plugins directly in CSS using [`postcss-use`]:

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
* [`precss`] contains plugins that allow you to use Sass-like CSS.
* [`rucksack`] contains plugins to speed up CSS development
  with new features and shortcuts.
* [`stylelint`] contains plugins that lint your stylesheets.

[`stylelint`]: https://github.com/stylelint/stylelint
[`rucksack`]:  http://simplaio.github.io/rucksack
[`cssnano`]:   https://github.com/ben-eb/cssnano
[`cssnext`]:   http://cssnext.io/
[`precss`]:    https://github.com/jonathantneal/precss
[`atcss`]:     https://github.com/morishitter/atcss

### Future CSS Syntax

* [`postcss-color-function`] supports functions to transform colors.
* [`postcss-color-gray`] supports the `gray()` function.
* [`postcss-color-hex-alpha`] supports `#rrggbbaa` and `#rgba` notation.
* [`postcss-color-hwb`] transforms `hwb()` to widely compatible `rgb()`.
* [`postcss-color-rebeccapurple`] supports the `rebeccapurple` color.
* [`postcss-conic-gradient`] supports the `conic-gradient` background.
* [`postcss-custom-media`] supports custom aliases for media queries.
* [`postcss-custom-properties`] supports variables, using syntax from
  the W3C Custom Properties.
* [`postcss-custom-selectors`] adds custom aliases for selectors.
* [`postcss-extend`] supports spec-approximate `@extend` for rules
  and placeholders, recursively.
* [`postcss-font-variant`] transpiles human-readable `font-variant`
  to more widely supported CSS.
* [`postcss-host`] makes the Shadow DOM’s `:host` selector work properly
  with pseudo-classes.
* [`postcss-initial`] supports `initial` keyword and `all: initial` to clean inherit styles.
* [`postcss-media-minmax`] adds `<=` and `=>` statements to media queries.
* [`postcss-pseudo-class-any-link`] adds `:any-link` pseudo-class.
* [`postcss-selector-not`] transforms CSS4 `:not()` to CSS3 `:not()`.
* [`postcss-selector-matches`] transforms CSS4 `:matches()` to more compatible CSS.
* [`postcss-apply`] supports custom properties sets references
* [`mq4-hover-shim`] supports the `@media (hover)` feature.

See also [`cssnext`] plugins pack to add future CSS syntax by one line of code.

### Fallbacks

* [`postcss-color-rgba-fallback`] transforms `rgba()` to hexadecimal.
* [`postcss-epub`] adds the `-epub-` prefix to relevant properties.
* [`postcss-mqwidth-to-class`] converts min/max-width media queries to classes.
* [`postcss-opacity`] adds opacity filter for IE8.
* [`postcss-pseudoelements`] Convert `::` selectors into `:` selectors
  for IE 8 compatibility.
* [`postcss-unmq`] removes media queries while preserving desktop rules for IE≤8.
* [`postcss-vmin`] generates `vm` fallback for `vmin` unit in IE9.
* [`postcss-will-change`] inserts 3D hack before `will-change` property.
* [`autoprefixer`] adds vendor prefixes for you, using data from Can I Use.
* [`cssgrace`] provides various helpers and transpiles CSS 3 for IE
  and other old browsers.
* [`pixrem`] generates pixel fallbacks for `rem` units.
* [`postcss-round-subpixels`] plugin that rounds sub-pixel values to the nearest full pixel.

### Language Extensions

* [`postcss-bem`] adds at-rules for BEM and SUIT style classes.
* [`postcss-conditionals`] adds `@if` statements.
* [`postcss-css-variables`] supports variables for selectors, and at-rules
  using W3C similar syntax.
* [`postcss-define-property`] to define properties shortcut.
* [`postcss-each`] adds `@each` statement.
* [`postcss-for`] adds `@for` loops.
* [`postcss-functions`] enables exposure of JavaScript functions.
* [`postcss-local-constants`] adds support for localized constants.
* [`postcss-map`] enables configuration maps.
* [`postcss-match`] adds `@match` for [Rust-style pattern matching].
* [`postcss-mixins`] enables mixins more powerful than Sass’,
  defined within stylesheets or in JS.
* [`postcss-media-variables`] adds support for `var()` and `calc()`
  in `@media` rules
* [`postcss-modular-scale`] adds a modular scale `ms()` function.
* [`postcss-nested`] unwraps nested rules.
* [`postcss-nested-props`] unwraps nested properties.
* [`postcss-pseudo-class-enter`] transforms `:enter` into `:hover` and `:focus`.
* [`postcss-quantity-queries`] enables quantity queries.
* [`postcss-sassy-mixins`] enables mixins with Sass keywords.
* [`postcss-simple-extend`] lightweight extending of silent classes,
  like Sass’ `@extend`.
* [`postcss-simple-vars`] supports for Sass-style variables.
* [`postcss-strip-units`] strips units off of property values.
* [`postcss-vertical-rhythm`] adds a vertical rhythm unit
  based on `font-size` and `line-height`.
* [`csstyle`] adds components workflow to your styles.

See also [`precss`] plugins pack to add them by one line of code.

[Rust-style pattern matching]: https://doc.rust-lang.org/book/match.html

### Colors

* [`postcss-ase-colors`] replaces color names with values read from an ASE palette file.
* [`postcss-brand-colors`] inserts company brand colors
  in the `brand-colors` module.
* [`postcss-color-alpha`] transforms `#hex.a`, `black(alpha)` and `white(alpha)`
  to `rgba()`.
* [`postcss-color-hcl`] transforms `hcl(H, C, L)` and `hcl(H, C, L, alpha)`
  to `#rgb` and `rgba()`.
* [`postcss-color-hexa`] transforms `hexa(hex, alpha)` into `rgba` format.
* [`postcss-color-mix`] mixes two colors together.
* [`postcss-color-palette`] transforms CSS 2 color keywords to a custom palette.
* [`postcss-color-pantone`] transforms pantone color to RGB.
* [`postcss-color-scale`] adds a color scale `cs()` function.
* [`postcss-color-short`] adds shorthand color declarations.
* [`postcss-colorblind`] transforms colors using filters to simulate
  colorblindness.
* [`postcss-hexrgba`] adds shorthand hex `rgba(hex, alpha)` method.
* [`postcss-rgb-plz`] converts 3 or 6 digit hex values to `rgb`.

### Images and Fonts

* [`postcss-assets`] allows you to simplify URLs, insert image dimensions,
  and inline files.
* [`postcss-at2x`] handles retina background images via use of `at-2x` keyword.
* [`postcss-copy-assets`] copies assets referenced by relative `url()`s into a
  build directory.
* [`postcss-data-packer`] moves embedded Base64 data to a separate file.
* [`postcss-image-set`] adds `background-image` with first image
  for `image-set()`.
* [`postcss-font-pack`] simplifies font declarations and validates they match
  configured font packs.
* [`postcss-fontpath`] adds font links for different browsers.
* [`postcss-sprites`] generates CSS sprites from stylesheets.
* [`postcss-svg`] insert inline SVG to CSS and allows to manage it colors.
* [`postcss-svg-fallback`] converts SVG in your CSS to PNG files for IE 8.
* [`postcss-svgo`] processes inline SVG through [SVGO].
* [`postcss-url`] rebases or inlines `url()`s.
* [`postcss-urlrev`] adds MD5 hash strings to `url()`s.
* [`webpcss`] adds URLs for WebP images for browsers that support WebP.

### Grids

* [`postcss-grid`] adds a semantic grid system.
* [`postcss-simple-grid`] create grid with one line.
* [`postcss-neat`] is a semantic and fluid grid framework.
* [`lost`] feature-rich `calc()` grid system by Jeet author.


### Optimizations

* [`postcss-calc`] reduces `calc()` to values
  (when expressions involve the same units).
* [`postcss-import`] inlines the stylesheets referred to by `@import` rules.
* [`postcss-partial-import`] inlines standard imports and Sass-like partials.
* [`postcss-single-charset`] ensures that there is one and only one
  `@charset` rule at the top of file.
* [`postcss-zindex`] rebases positive `z-index` values.
* [`css-byebye`] removes the CSS rules that you don’t want.
* [`css-mqpacker`] joins matching CSS media queries into a single statement.
* [`stylehacks`] removes CSS hacks based on browser support.

See also plugins in modular minifier [`cssnano`].

[SVGO]: https://github.com/svg/svgo

### Shortcuts

* [`postcss-alias`] creates shorter aliases for properties.
* [`postcss-all-link-colors`] insert colors for link-related pseudo-classes.
* [`postcss-border`] adds shorthand for width and color of all borders
  in `border` property.
* [`postcss-center`] centers elements.
* [`postcss-circle`] inserts a circle with color.
* [`postcss-clearfix`] adds `fix` and `fix-legacy` properties to the `clear`
  declaration.
* [`postcss-crip`] shorthand properties for Crips that are too lazy to write.
* [`postcss-default-unit`] adds default unit to numeric CSS properties.
* [`postcss-easings`] replaces easing names from easings.net
  with `cubic-bezier()` functions.
* [`postcss-filter`] adds shorthand for black and white filter.
* [`postcss-focus`] adds `:focus` selector to every `:hover`.
* [`postcss-generate-preset`] allows quick generation of rules.
  Useful for creating repetitive utilities.
* [`postcss-input-style`] adds new pseudo-elements for cross-browser styling of inputs.
* [`postcss-position`] adds shorthand declarations for position attributes.
* [`postcss-property-lookup`] allows referencing property values without
  a variable.
* [`postcss-responsive-type`] changes `font-size` depends on screen size.
* [`postcss-short`] adds and extends numerous shorthand properties.
* [`postcss-size`] adds a `size` shortcut that sets width and height
  with one declaration.
* [`postcss-transform-shortcut`] allows shorthand transform properties in CSS.
* [`postcss-triangle`] creates a triangle.
* [`postcss-verthorz`] adds vertical and horizontal spacing declarations.
* [`font-magician`] generates all the `@font-face` rules needed in CSS.

### Others

* [`postcss-autoreset`]  automatically adds reset styles.
* [`postcss-class-prefix`] adds a prefix/namespace to class selectors.
* [`postcss-currency`] replaces name of currency with symbols.
* [`postcss-fakeid`] transforms `#foo` IDs to attribute selectors `[id="foo"]`.
* [`postcss-flexboxfixer`] unprefixes `-webkit-` only flexbox in legacy CSS.
* [`postcss-flexbugs-fixes`] fixes some of known [flexbox bugs].
* [`postcss-gradientfixer`] unprefixes `-webkit-` only gradients in legacy CSS.
* [`postcss-increase-specificity`] increases the specificity of your selectors.
* [`postcss-mq-keyframes`] moves any animation keyframes in media queries
  to the end of the file.
* [`postcss-pseudo-elements-content`] adds `content: ''` to `:before-c`
  and `:after-c`.
* [`postcss-pseudo-content-insert`] adds `content: ''` to `:before` and `:after`
  if it is missing.
* [`postcss-pxtorem`] converts pixel units to `rem`.
* [`postcss-remove-prefixes`] removes vendor prefixes.
* [`postcss-style-guide`] generates a style guide automatically.
* [`postcss-scopify`] adds a user input scope to each selector.
* [`cssfmt`] formats CSS source code automatically inspired by Gofmt.
* [`perfectionist`] formats poorly written CSS and renders a “pretty” result.
* [`rtlcss`] mirrors styles for right-to-left locales.

[flexbox bugs]: https://github.com/philipwalton/flexbugs

### Analysis

* [`postcss-bem-linter`] lints CSS for conformance to SUIT CSS methodology.
* [`postcss-cssstats`] returns an object with CSS statistics.
* [`css2modernizr`] creates a Modernizr config file
  that requires only the tests that your CSS uses.
* [`doiuse`] lints CSS for browser support, using data from Can I Use.
* [`immutable-css`] lints CSS for class mutations.
* [`list-selectors`] lists and categorizes the selectors used in your CSS,
  for code review.

### Reporters

* [`postcss-browser-reporter`] displays warning messages from other plugins
  right in your browser.
* [`postcss-reporter`] logs warnings and other messages from other plugins
  in the console.

### Fun

* [`postcss-australian-stylesheets`] Australian Style Sheets.
* [`postcss-canadian-stylesheets`] Canadian Style Sheets.
* [`postcss-german-stylesheets`] German Style Sheets.
* [`postcss-swedish-stylesheets`] Swedish Style Sheets.
* [`postcss-lolcat-stylesheets`] Lolspeak Style Sheets.
* [`postcss-imperial`] adds CSS support for Imperial and US customary units of length.
* [`postcss-russian-units`] adds CSS support for russian units of length.
* [`postcss-pointer`] Replaces `pointer: cursor` with `cursor: pointer`.
* [`postcss-spiffing`] lets you use British English in your CSS.

[`postcss-pseudo-elements-content`]: https://github.com/omgovich/postcss-pseudo-elements-content
[`postcss-australian-stylesheets`]:  https://github.com/dp-lewis/postcss-australian-stylesheets
[`postcss-pseudo-class-any-link`]:   https://github.com/jonathantneal/postcss-pseudo-class-any-link
[`postcss-pseudo-content-insert`]:   https://github.com/liquidlight/postcss-pseudo-content-insert
[`postcss-canadian-stylesheets`]:    https://github.com/chancancode/postcss-canadian-stylesheets
[`postcss-increase-specificity`]:    https://github.com/MadLittleMods/postcss-increase-specificity
[`postcss-swedish-stylesheets`]:     https://github.com/johnie/postcss-swedish-stylesheets
[`postcss-color-rebeccapurple`]:     https://github.com/postcss/postcss-color-rebeccapurple
[`postcss-color-rgba-fallback`]:     https://github.com/postcss/postcss-color-rgba-fallback
[`postcss-lolcat-stylesheets`]:      https://github.com/sandralundgren/postcss-lolcat-stylesheets
[`postcss-german-stylesheets`]:      https://github.com/timche/postcss-german-stylesheets
[`postcss-discard-duplicates`]:      https://github.com/ben-eb/postcss-discard-duplicates
[`postcss-minify-font-weight`]:      https://github.com/ben-eb/postcss-minify-font-weight
[`postcss-pseudo-class-enter`]:      https://github.com/jonathantneal/postcss-pseudo-class-enter
[`postcss-transform-shortcut`]:      https://github.com/jonathantneal/postcss-transform-shortcut
[`postcss-custom-properties`]:       https://github.com/postcss/postcss-custom-properties
[`postcss-discard-font-face`]:       https://github.com/ben-eb/postcss-discard-font-face
[`postcss-custom-selectors`]:        https://github.com/postcss/postcss-custom-selectors
[`postcss-discard-comments`]:        https://github.com/ben-eb/postcss-discard-comments
[`postcss-minify-selectors`]:        https://github.com/ben-eb/postcss-minify-selectors
[`postcss-mqwidth-to-class`]:        https://github.com/notacouch/postcss-mqwidth-to-class
[`postcss-quantity-queries`]:        https://github.com/pascalduez/postcss-quantity-queries
[`postcss-browser-reporter`]:        https://github.com/postcss/postcss-browser-reporter
[`postcss-selector-matches`]:        https://github.com/postcss/postcss-selector-matches
[`postcss-all-link-colors`]:         https://github.com/jedmao/postcss-all-link-colors
[`postcss-color-hex-alpha`]:         https://github.com/postcss/postcss-color-hex-alpha
[`postcss-define-property`]:         https://github.com/daleeidd/postcss-define-property
[`postcss-generate-preset`]:         https://github.com/simonsmith/postcss-generate-preset
[`postcss-media-variables`]:         https://github.com/WolfgangKluge/postcss-media-variables
[`postcss-property-lookup`]:         https://github.com/simonsmith/postcss-property-lookup
[`postcss-vertical-rhythm`]:         https://github.com/markgoodyear/postcss-vertical-rhythm
[`postcss-local-constants`]:         https://github.com/macropodhq/postcss-local-constants
[`postcss-remove-prefixes`]:         https://github.com/johnotander/postcss-remove-prefixes
[`postcss-responsive-type`]:         https://github.com/seaneking/postcss-responsive-type
[`postcss-round-subpixels`]:         https://github.com/himynameisdave/postcss-round-subpixels
[`postcss-color-function`]:          https://github.com/postcss/postcss-color-function
[`postcss-conic-gradient`]:          https://github.com/jonathantneal/postcss-conic-gradient
[`postcss-convert-values`]:          https://github.com/ben-eb/postcss-convert-values
[`postcss-partial-import`]:          https://github.com/jonathantneal/postcss-partial-import
[`postcss-pseudoelements`]:          https://github.com/axa-ch/postcss-pseudoelements
[`postcss-single-charset`]:          https://github.com/hail2u/postcss-single-charset
[`postcss-flexbugs-fixes`]:          https://github.com/luisrudge/postcss-flexbugs-fixes
[`postcss-color-palette`]:           https://github.com/zaim/postcss-color-palette
[`postcss-color-pantone`]:           https://github.com/longdog/postcss-color-pantone
[`postcss-css-variables`]:           https://github.com/MadLittleMods/postcss-css-variables
[`postcss-discard-empty`]:           https://github.com/ben-eb/postcss-discard-empty
[`postcss-gradientfixer`]:           https://github.com/hallvors/postcss-gradientfixer
[`postcss-modular-scale`]:           https://github.com/kristoferjoseph/postcss-modular-scale
[`postcss-normalize-url`]:           https://github.com/ben-eb/postcss-normalize-url
[`postcss-reduce-idents`]:           https://github.com/ben-eb/postcss-reduce-idents
[`postcss-simple-extend`]:           https://github.com/davidtheclark/postcss-simple-extend
[`postcss-russian-units`]:           https://github.com/Semigradsky/postcss-russian-units
[`postcss-mq-keyframes`]:            https://github.com/TCotton/postcss-mq-keyframes
[`postcss-brand-colors`]:            https://github.com/postcss/postcss-brand-colors
[`postcss-class-prefix`]:            https://github.com/thompsongl/postcss-class-prefix
[`postcss-conditionals`]:            https://github.com/andyjansson/postcss-conditionals
[`postcss-sassy-mixins`]:            https://github.com/andyjansson/postcss-sassy-mixins
[`postcss-custom-media`]:            https://github.com/postcss/postcss-custom-media
[`postcss-default-unit`]:            https://github.com/antyakushev/postcss-default-unit
[`postcss-flexboxfixer`]:            https://github.com/hallvors/postcss-flexboxfixer
[`postcss-font-variant`]:            https://github.com/postcss/postcss-font-variant
[`postcss-media-minmax`]:            https://github.com/postcss/postcss-media-minmax
[`postcss-merge-idents`]:            https://github.com/ben-eb/postcss-merge-idents
[`postcss-selector-not`]:            https://github.com/postcss/postcss-selector-not
[`postcss-svg-fallback`]:            https://github.com/justim/postcss-svg-fallback
[`postcss-nested-props`]:            https://github.com/jedmao/postcss-nested-props
[`postcss-color-alpha`]:             https://github.com/avanes/postcss-color-alpha
[`postcss-color-scale`]:             https://github.com/kristoferjoseph/postcss-color-scale
[`postcss-color-short`]:             https://github.com/andrepolischuk/postcss-color-short
[`postcss-copy-assets`]:             https://github.com/shutterstock/postcss-copy-assets
[`postcss-data-packer`]:             https://github.com/Ser-Gen/postcss-data-packer
[`postcss-font-family`]:             https://github.com/ben-eb/postcss-font-family
[`postcss-simple-grid`]:             https://github.com/admdh/postcss-simple-grid
[`postcss-merge-rules`]:             https://github.com/ben-eb/postcss-merge-rules
[`postcss-simple-vars`]:             https://github.com/postcss/postcss-simple-vars
[`postcss-strip-units`]:             https://github.com/whitneyit/postcss-strip-units
[`postcss-style-guide`]:             https://github.com/morishitter/postcss-style-guide
[`postcss-will-change`]:             https://github.com/postcss/postcss-will-change
[`postcss-input-style`]:             https://github.com/seaneking/postcss-input-style
[`postcss-ase-colors`]:              https://github.com/dfernandez79/postcss-ase-colors
[`postcss-bem-linter`]:              https://github.com/necolas/postcss-bem-linter
[`postcss-color-gray`]:              https://github.com/postcss/postcss-color-gray
[`postcss-colorblind`]:              https://github.com/btholt/postcss-colorblind
[`postcss-color-hexa`]:              https://github.com/nicksheffield/postcss-color-hexa
[`postcss-autoreset`]:               https://github.com/maximkoretskiy/postcss-autoreset
[`postcss-font-pack`]:               https://github.com/jedmao/postcss-font-pack
[`postcss-functions`]:               https://github.com/andyjansson/postcss-functions
[`postcss-color-hcl`]:               https://github.com/devgru/postcss-color-hcl
[`postcss-color-hwb`]:               https://github.com/postcss/postcss-color-hwb
[`postcss-color-mix`]:               https://github.com/iamstarkov/postcss-color-mix
[`postcss-image-set`]:               https://github.com/alex499/postcss-image-set
[`postcss-clearfix`]:                https://github.com/seaneking/postcss-clearfix
[`postcss-colormin`]:                https://github.com/ben-eb/colormin
[`postcss-cssstats`]:                https://github.com/cssstats/postcss-cssstats
[`postcss-currency`]:                https://github.com/talgautb/postcss-currency
[`postcss-imperial`]:                https://github.com/cbas/postcss-imperial
[`postcss-position`]:                https://github.com/seaneking/postcss-position
[`postcss-spiffing`]:                https://github.com/HashanP/postcss-spiffing
[`postcss-triangle`]:                https://github.com/jedmao/postcss-triangle
[`postcss-verthorz`]:                https://github.com/davidhemphill/postcss-verthorz
[`pleeease-filters`]:                https://github.com/iamvdo/pleeease-filters
[`postcss-fontpath`]:                https://github.com/seaneking/postcss-fontpath
[`postcss-reporter`]:                https://github.com/postcss/postcss-reporter
[`postcss-easings`]:                 https://github.com/postcss/postcss-easings
[`postcss-hexrgba`]:                 https://github.com/seaneking/postcss-hexrgba
[`postcss-initial`]:                 https://github.com/maximkoretskiy/postcss-initial
[`postcss-rgb-plz`]:                 https://github.com/himynameisdave/postcss-rgb-plz
[`postcss-opacity`]:                 https://github.com/iamvdo/postcss-opacity
[`postcss-pointer`]:                 https://github.com/markgoodyear/postcss-pointer
[`postcss-pxtorem`]:                 https://github.com/cuth/postcss-pxtorem
[`postcss-scopify`]:                 https://github.com/pazams/postcss-scopify
[`postcss-sprites`]:                 https://github.com/2createStudio/postcss-sprites
[`postcss-assets`]:                  https://github.com/borodean/postcss-assets
[`postcss-border`]:                  https://github.com/andrepolischuk/postcss-border
[`postcss-center`]:                  https://github.com/jedmao/postcss-center
[`postcss-circle`]:                  https://github.com/jedmao/postcss-circle
[`postcss-urlrev`]:                  https://github.com/yuezk/postcss-urlrev
[`postcss-extend`]:                  https://github.com/travco/postcss-extend
[`postcss-fakeid`]:                  https://github.com/pathsofdesign/postcss-fakeid
[`postcss-filter`]:                  https://github.com/alanev/postcss-filter
[`postcss-import`]:                  https://github.com/postcss/postcss-import
[`postcss-mixins`]:                  https://github.com/postcss/postcss-mixins
[`postcss-nested`]:                  https://github.com/postcss/postcss-nested
[`postcss-zindex`]:                  https://github.com/ben-eb/postcss-zindex
[`list-selectors`]:                  https://github.com/davidtheclark/list-selectors
[`mq4-hover-shim`]:                  https://github.com/twbs/mq4-hover-shim
[`postcss-focus`]:                   https://github.com/postcss/postcss-focus
[`postcss-apply`]:                   https://github.com/pascalduez/postcss-apply
[`css2modernizr`]:                   https://github.com/vovanbo/css2modernizr
[`font-magician`]:                   https://github.com/jonathantneal/postcss-font-magician
[`postcss-match`]:                   https://github.com/rtsao/postcss-match
[`postcss-short`]:                   https://github.com/jonathantneal/postcss-short
[`postcss-alias`]:                   https://github.com/seaneking/postcss-alias
[`perfectionist`]:                   https://github.com/ben-eb/perfectionist
[`immutable-css`]:                   https://github.com/johnotander/immutable-css
[`postcss-at2x`]:                    https://github.com/simonsmith/postcss-at2x
[`postcss-calc`]:                    https://github.com/postcss/postcss-calc
[`postcss-crip`]:                    https://github.com/johnie/postcss-crip
[`postcss-each`]:                    https://github.com/outpunk/postcss-each
[`postcss-epub`]:                    https://github.com/Rycochet/postcss-epub
[`postcss-grid`]:                    https://github.com/andyjansson/postcss-grid
[`postcss-host`]:                    https://github.com/vitkarpov/postcss-host
[`postcss-neat`]:                    https://github.com/jo-asakura/postcss-neat
[`postcss-size`]:                    https://github.com/postcss/postcss-size
[`postcss-svgo`]:                    https://github.com/ben-eb/postcss-svgo
[`postcss-unmq`]:                    https://github.com/jonathantneal/postcss-unmq
[`postcss-vmin`]:                    https://github.com/iamvdo/postcss-vmin
[`autoprefixer`]:                    https://github.com/postcss/autoprefixer
[`css-mqpacker`]:                    https://github.com/hail2u/node-css-mqpacker
[`postcss-bem`]:                     https://github.com/ileri/postcss-bem
[`postcss-for`]:                     https://github.com/antyakushev/postcss-for
[`postcss-map`]:                     https://github.com/pascalduez/postcss-map
[`postcss-svg`]:                     https://github.com/Pavliko/postcss-svg
[`postcss-url`]:                     https://github.com/postcss/postcss-url
[`stylehacks`]:                      https://github.com/ben-eb/stylehacks
[`css-byebye`]:                      https://github.com/AoDev/css-byebye
[`cssgrace`]:                        https://github.com/cssdream/cssgrace
[`csstyle`]:                         https://github.com/geddski/csstyle
[`webpcss`]:                         https://github.com/lexich/webpcss
[`cssfmt`]:                          https://github.com/morishitter/cssfmt
[`doiuse`]:                          https://github.com/anandthakker/doiuse
[`pixrem`]:                          https://github.com/robwierzbowski/node-pixrem
[`rtlcss`]:                          https://github.com/MohammadYounes/rtlcss
[`lost`]:                            https://github.com/corysimmons/lost

## How to Develop for PostCSS

### Syntax

* [How to Write Custom Syntax](https://github.com/postcss/postcss/blob/master/docs/syntax.md)

### Plugin

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
and output CSS file paths — using the options `from` and `to`, respectively.

To generate a new source map with the default options, simply set `map: true`.
This will generate an inline source map that contains the source content.
If you don’t want the map inlined, you can set `map.inline: false`.

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
  content (for example, Sass source) of the source map. By default,
  it is `true`. But if all previous maps do not contain sources content,
  PostCSS will also leave it out even if you do not set this option.

* `annotation` boolean or string: indicates that PostCSS should add annotation
  comments to the CSS. By default, PostCSS will always add a comment with a path
  to the source map. PostCSS will not add annotations to CSS files that
  do not contain any comments.

  By default, PostCSS presumes that you want to save the source map as
  `opts.to + '.map'` and will use this path in the annotation comment.
  A different path can be set by providing a string value for `annotation`.

  If you have set `inline: true`, annotation cannot be disabled.

[source maps]: http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/
