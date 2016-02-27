# PostCSS Plugins

## Control

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

## Packs

* [`atcss`] contains plugins that transform your CSS according
  to special annotation comments.
* [`cssnano`] contains plugins that optimize CSS size for use in production.
* [`cssnext`] contains plugins that allow you to use future CSS features today.
* [`oldie`] contains plugins that transform your CSS
  for older Internet Explorer compatibility.
* [`precss`] contains plugins that allow you to use Sass-like CSS.
* [`rucksack`] contains plugins to speed up CSS development
  with new features and shortcuts.
* [`level4`] contains only plugins that let you write CSS4 without
  the IE9 fallbacks.
* [`short`] adds and extends numerous shorthand properties.
* [`stylelint`] contains plugins that lint your stylesheets.

[`stylelint`]: https://github.com/stylelint/stylelint
[`rucksack`]:  http://simplaio.github.io/rucksack
[`cssnano`]:   http://cssnano.co/
[`cssnext`]:   http://cssnext.io/
[`oldie`]:     https://github.com/jonathantneal/oldie
[`precss`]:    https://github.com/jonathantneal/precss
[`atcss`]:     https://github.com/morishitter/atcss
[`level4`]:    https://github.com/stephenway/level4

## Future CSS Syntax

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
* [`postcss-font-normalize`] to normalize font, especially font-family.
* [`postcss-font-variant`] transpiles human-readable `font-variant`
  to more widely supported CSS.
* [`postcss-host`] makes the Shadow DOM’s `:host` selector work properly
  with pseudo-classes.
* [`postcss-initial`] supports `initial` keyword and `all: initial`
  to clean inherit styles.
* [`postcss-logical-properties`] transforms `start` and `end` properties
  to `left` and `right` depending on the writing direction of the document.
* [`postcss-media-minmax`] adds `<=` and `=>` statements to media queries.
* [`postcss-pseudo-class-any-link`] adds `:any-link` pseudo-class.
* [`postcss-selector-not`] transforms CSS4 `:not()` to CSS3 `:not()`.
* [`postcss-selector-matches`] transforms CSS4 `:matches()`
  to more compatible CSS.
* [`postcss-apply`] supports custom properties sets references
* [`mq4-hover-shim`] supports the `@media (hover)` feature.

See also [`cssnext`] plugins pack to add future CSS syntax by one line of code.

## Fallbacks

* [`postcss-color-rgba-fallback`] transforms `rgba()` to hexadecimal.
* [`postcss-epub`] adds the `-epub-` prefix to relevant properties.
* [`postcss-fallback`] adds `fallback` function to avoid duplicate declarations.
* [`postcss-filter-gradient`] adds gradient filter for the old IE.
* [`postcss-flexibility`] adds `-js-` prefix for [`Flexibility polyfill`].
* [`postcss-gradient-transparency-fix`] transforms `transparent` values
  in gradients to support Safari's different color interpolation.
* [`postcss-hash-classname`] append hash string to your css class name.
* [`postcss-mqwidth-to-class`] converts min/max-width media queries to classes.
* [`postcss-opacity`] adds opacity filter for IE8.
* [`postcss-pseudoelements`] Convert `::` selectors into `:` selectors
  for IE 8 compatibility.
* [`postcss-round-subpixels`] plugin that rounds sub-pixel values
  to the nearest
  full pixel.
* [`postcss-unmq`] removes media queries while preserving desktop rules
  for IE≤8.
* [`postcss-vmin`] generates `vm` fallback for `vmin` unit in IE9.
* [`postcss-will-change`] inserts 3D hack before `will-change` property.
* [`autoprefixer`] adds vendor prefixes for you, using data from Can I Use.
* [`cssgrace`] provides various helpers and transpiles CSS 3 for IE
  and other old browsers.
* [`pixrem`] generates pixel fallbacks for `rem` units.

See also [`oldie`] plugins pack.

[`Flexibility polyfill`]: https://github.com/10up/flexibility

## Language Extensions

* [`postcss-aspect-ratio`] fix an element's dimensions to an aspect ratio.
* [`postcss-atroot`] place rules directly at the root node.
* [`postcss-bem`] adds at-rules for BEM and SUIT style classes.
* [`postcss-conditionals`] adds `@if` statements.
* [`postcss-css-variables`] supports variables for selectors, and at-rules
  using W3C similar syntax.
* [`postcss-current-selector`] to get current selector in declaration.
* [`postcss-define-property`] to define properties shortcut.
* [`postcss-each`] adds `@each` statement.
* [`postcss-for`] adds `@for` loops.
* [`postcss-at-rules-variables`] adds support for custom properties in
  `@for`, `@each`, `@if`, etc.
* [`postcss-functions`] enables exposure of JavaScript functions.
* [`postcss-if-media`] inline or nest media queries within
  CSS rules & properties.
* [`postcss-local-constants`] adds support for localized constants.
* [`postcss-map`] enables configuration maps.
* [`postcss-match`] adds `@match` for [Rust-style pattern matching].
* [`postcss-mixins`] enables mixins more powerful than Sass’,
  defined within stylesheets or in JS.
* [`postcss-media-variables`] adds support for `var()` and `calc()`
  in `@media` rules
* [`postcss-modular-scale`] adds a modular scale `ms()` function.
* [`postcss-namespace`] prefix a namespace to a selector.
* [`postcss-nested`] unwraps nested rules.
* [`postcss-nested-props`] unwraps nested properties.
* [`postcss-nested-vars`] supports nested Sass-style variables.
* [`postcss-pseudo-class-any-button`] adds `:any-button` pseudo-class
for targeting all button elements.
* [`postcss-pseudo-class-enter`] transforms `:enter` into `:hover` and `:focus`.
* [`postcss-quantity-queries`] enables quantity queries.
* [`postcss-reverse-media`] reverse/Invert media query parameters.
* [`postcss-sassy-mixins`] enables mixins with Sass keywords.
* [`postcss-simple-extend`] lightweight extending of silent classes,
  like Sass’ `@extend`.
* [`postcss-simple-vars`] supports for Sass-style variables.
* [`postcss-strip-units`] strips units off of property values.
* [`postcss-vertical-rhythm`] adds a vertical rhythm unit
  based on `font-size` and `line-height`.
* [`postcss-vertical-rhythm-function`] adds a vertical rhythm `vr()` function
  that is unit agnostic and works in situations where the font-size cannot
  be calculated during build time.
* [`csstyle`] adds components workflow to your styles.

See also [`precss`] plugins pack to add them by one line of code.

[Rust-style pattern matching]: https://doc.rust-lang.org/book/match.html

## Colors

* [`postcss-ase-colors`] replaces color names with values read
  from an ASE palette file.
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
* [`postcss-color-yiq`] sets foreground colors using the YIQ color space.
* [`postcss-colorblind`] transforms colors using filters to simulate
  colorblindness.
* [`postcss-contrast`] checks background-color and gives either white or black.
* [`postcss-hexrgba`] adds shorthand hex `rgba(hex, alpha)` method.
* [`postcss-rgb-plz`] converts 3 or 6 digit hex values to `rgb`.
* [`postcss-rgba-hex`] converts `rgba` values to `hex` analogues.
* [`postcss-shades-of-gray`] helps keeping grayscale colors consistent
  to a gray palette.
* [`colorguard`] helps maintain a consistent color palette.

## Images and Fonts

* [`postcss-assets`] allows you to simplify URLs, insert image dimensions,
  and inline files.
* [`postcss-assets-rebase`] rebases assets from `url()`.
* [`postcss-at2x`] handles retina background images via use of `at-2x` keyword.
* [`postcss-cachebuster`] adds version parameter to images and fonts
* [`postcss-copy-assets`] copies assets referenced by relative `url()`s
  into a build directory.
* [`postcss-data-packer`] moves embedded Base64 data to a separate file.
* [`postcss-easysprites`] combine images to sprites, based on their
  image.png`#hash` and aspect ratio (`@2x`).
* [`postcss-image-set`] adds `background-image` with first image
  for `image-set()`.
* [`postcss-image-inliner`] inlines local and remote images.
* [`postcss-instagram`] adds Instagram filters to `filter`.
* [`postcss-font-awesome`] adds an easy shortcut to font-awesome unicode codes
* [`postcss-font-pack`] simplifies font declarations and validates they match
  configured font packs.
* [`postcss-fontpath`] adds font links for different browsers.
* [`postcss-responsive-images`] adds stylesheets for making
  your images responsive.
* [`postcss-sprites`] generates CSS sprites from stylesheets.
* [`postcss-svg`] insert inline SVG to CSS and allows to manage it colors.
* [`postcss-svg-fallback`] converts SVG in your CSS to PNG files for IE 8.
* [`postcss-svgo`] processes inline SVG through [SVGO].
* [`postcss-url`] rebases or inlines `url()`s.
* [`postcss-urlrev`] adds MD5 hash strings to `url()`s.
* [`postcss-write-svg`] write inline SVGs in CSS.
* [`postcss-inline-svg`] inline SVG images and customize their styles.
* [`webpcss`] adds URLs for WebP images for browsers that support WebP.

## Grids

* [`postcss-grid`] adds a semantic grid system.
* [`postcss-layout`] a plugin for some common CSS layout patterns
  and a Grid system.
* [`postcss-maze`] is a mobile first, semantic responsive grid
  to suit any design pattern.
* [`postcss-neat`] is a semantic and fluid grid framework.
* [`postcss-oldschool-grid`] is a grid system with wrapping columns 
  and padding gutters.
* [`postcss-simple-grid`] create grid with one line.
* [`lost`] feature-rich `calc()` grid system by Jeet author.

## Optimizations

* [`postcss-calc`] reduces `calc()` to values
  (when expressions involve the same units).
* [`postcss-filter-mq`] Filter all matching or non-matching media queries.
* [`postcss-import`] inlines the stylesheets referred to by `@import` rules.
* [`postcss-partial-import`] inlines standard imports and Sass-like partials.
* [`postcss-reference`] emulates Less’s [`@import (reference)`].
* [`postcss-remove-root`] removes all instances of `:root` from a stylesheet.
* [`postcss-single-charset`] ensures that there is one and only one
  `@charset` rule at the top of file.
* [`postcss-zindex`] rebases positive `z-index` values.
* [`css-byebye`] removes the CSS rules that you don’t want.
* [`css-mqpacker`] joins matching CSS media queries into a single statement.
* [`stylehacks`] removes CSS hacks based on browser support.
* [`postcss-mq-optimize`] removes invalid media queries or its expresions.

See also plugins in modular minifier [`cssnano`].

[@import (reference)]: http://lesscss.org/features/#import-options-reference
[SVGO]: https://github.com/svg/svgo

## Shortcuts

* [`postcss-alias`] creates shorter aliases for properties.
* [`postcss-alias-atrules`] creates shorter aliases for at-rules.
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
* [`postcss-hidden`] allows for easy ways to hide elements.
* [`postcss-input-style`] adds new pseudo-elements for cross-browser styling
  of inputs.
* [`postcss-position`] adds shorthand declarations for position attributes.
* [`postcss-property-lookup`] allows referencing property values without
  a variable.
* [`postcss-responsive-type`] changes `font-size` depends on screen size.
* [`postcss-scrib`] define your own aliases/shortcuts for properties or values.
* [`postcss-short-font-size`] extends `font-size` to define line-height
  s a second value.
* [`postcss-short-position`] extends `position` to define edges
  as additional values.
* [`postcss-short-spacing`] extends `margin` and `padding` to allow
  or omitted edges.
* [`postcss-short-text`] adds a `text` shortcut property for several
  text-related properties.
* [`postcss-size`] adds a `size` shortcut that sets width and height
  with one declaration.
* [`postcss-speech-bubble`] adds speech bubbles of different kinds
  with just a couple of lines of CSS.
* [`postcss-transform-shortcut`] allows shorthand transform properties in CSS.
* [`postcss-triangle`] creates a triangle.
* [`postcss-verthorz`] adds vertical and horizontal spacing declarations.
* [`font-magician`] generates all the `@font-face` rules needed in CSS.
* [`postcss-animation`] PostCSS plugin that adds `@keyframes` from animate.css.

## Others

* [`postcss-autoreset`]  automatically adds reset styles.
* [`postcss-class-prefix`] adds a prefix/namespace to class selectors.
* [`postcss-currency`] replaces name of currency with symbols.
* [`postcss-fakeid`] transforms `#foo` IDs to attribute selectors `[id="foo"]`.
* [`postcss-filter-stream`] blacklist files / folders that you don't want
  to process with a PostCSS plugin.
* [`postcss-flexbox`] easy way to understand and start using CSS3 Flexbox.
* [`postcss-flexboxfixer`] unprefixes `-webkit-` only flexbox in legacy CSS.
* [`postcss-flexbugs-fixes`] fixes some of known [flexbox bugs].
* [`postcss-gradientfixer`] unprefixes `-webkit-` only gradients in legacy CSS.
* [`postcss-increase-specificity`] increases the specificity of your selectors.
* [`postcss-modules`]  allows to use CSS Modules everywhere.
* [`postcss-mq-keyframes`] moves any animation keyframes in media queries
  to the end of the file.
* [`postcss-pseudo-elements-content`] adds `content: ''` to `:before-c`
  and `:after-c`.
* [`postcss-pseudo-content-insert`] adds `content: ''` to `:before` and `:after`
  if it is missing.
* [`postcss-pxtorem`] converts pixel units to `rem`.
* [`postcss-safe-important`] adds `!important` to style declarations safely.
* [`postcss-select`] select rules based off a selector list.
* [`postcss-selector-prefixer`] adds a prefix to css selectors.
* [`postcss-shorthand-expand`] expands shorthand properties.
* [`postcss-sorting`] sort rules content with specified order.
* [`postcss-raw`] protects nodes inside `@raw` at-rules from being touched
  by other plugins.
* [`postcss-remove-prefixes`] removes vendor prefixes.
* [`postcss-style-guide`] generates a style guide automatically.
* [`postcss-scopify`] adds a user input scope to each selector.
* [`cssfmt`] formats CSS source code automatically inspired by Gofmt.
* [`css-declaration-sorter`] sorts CSS declarations fast and automatically
  in a certain order.
* [`perfectionist`] formats poorly written CSS and renders a “pretty” result.
* [`postcss-inline-rtl`] converts your CSS to right-to-left,
  but inline (adding just what you need).
* [`rtlcss`] mirrors styles for right-to-left locales.

[flexbox bugs]: https://github.com/philipwalton/flexbugs

## Analysis

* [`postcss-bem-linter`] lints CSS for conformance to SUIT CSS methodology.
* [`postcss-cssstats`] returns an object with CSS statistics.
* [`postcss-regexp-detect`] search for regexp in CSS declarations.
* [`css2modernizr`] creates a Modernizr config file
  that requires only the tests that your CSS uses.
* [`doiuse`] lints CSS for browser support, using data from Can I Use.
* [`immutable-css`] lints CSS for class mutations.
* [`list-selectors`] lists and categorizes the selectors used in your CSS,
  for code review.

## Reporters

* [`postcss-browser-reporter`] displays warning messages from other plugins
  right in your browser.
* [`postcss-reporter`] logs warnings and other messages from other plugins
  in the console.

## Fun

* [`postcss-australian-stylesheets`] Australian Style Sheets.
* [`postcss-andalusian-stylesheets`] Andalusian Style Sheets.
* [`postcss-canadian-stylesheets`] Canadian Style Sheets.
* [`postcss-chinese-stylesheets`] Chinese Style Sheets.
* [`postcss-czech-stylesheets`] Czech Style Sheets.
* [`postcss-german-stylesheets`] German Style Sheets.
* [`postcss-russian-stylesheets`] Russian Style Sheets.
* [`postcss-swedish-stylesheets`] Swedish Style Sheets.
* [`postcss-tatar-stylesheets`] Tatar Style Sheets
* [`postcss-trolling`] Trolling Style Sheets.
* [`postcss-lolcat-stylesheets`] Lolspeak Style Sheets.
* [`postcss-imperial`] adds CSS support for Imperial and US customary units
  of length.
* [`postcss-russian-units`] adds CSS support for russian units of length.
* [`postcss-pointer`] Replaces `pointer: cursor` with `cursor: pointer`.
* [`postcss-spiffing`] lets you use British English in your CSS.
* [`postcss-spanish-stylesheets`] Spanish Style Sheets.

[`postcss-gradient-transparency-fix`]: https://github.com/gilmoreorless/postcss-gradient-transparency-fix
[`postcss-vertical-rhythm-function`]:  https://github.com/F21/postcss-vertical-rhythm-function
[`postcss-pseudo-class-any-button`]:   https://github.com/andrepolischuk/postcss-pseudo-class-any-button
[`postcss-pseudo-elements-content`]:   https://github.com/omgovich/postcss-pseudo-elements-content
[`postcss-australian-stylesheets`]:    https://github.com/dp-lewis/postcss-australian-stylesheets
[`postcss-andalusian-stylesheets`]:    https://github.com/bameda/postcss-andalusian-stylesheets
[`postcss-pseudo-class-any-link`]:     https://github.com/jonathantneal/postcss-pseudo-class-any-link
[`postcss-pseudo-content-insert`]:     https://github.com/liquidlight/postcss-pseudo-content-insert
[`postcss-canadian-stylesheets`]:      https://github.com/chancancode/postcss-canadian-stylesheets
[`postcss-chinese-stylesheets`]:       https://github.com/zhouwenbin/postcss-chinese-stylesheets
[`postcss-czech-stylesheets`]:         https://github.com/HoBi/postcss-czech-stylesheets
[`postcss-increase-specificity`]:      https://github.com/MadLittleMods/postcss-increase-specificity
[`postcss-swedish-stylesheets`]:       https://github.com/johnie/postcss-swedish-stylesheets
[`postcss-russian-stylesheets`]:       https://github.com/Semigradsky/postcss-russian-stylesheets
[`postcss-color-rebeccapurple`]:       https://github.com/postcss/postcss-color-rebeccapurple
[`postcss-color-rgba-fallback`]:       https://github.com/postcss/postcss-color-rgba-fallback
[`postcss-spanish-stylesheets`]:       https://github.com/ismamz/postcss-spanish-stylesheets
[`postcss-lolcat-stylesheets`]:        https://github.com/sandralundgren/postcss-lolcat-stylesheets
[`postcss-german-stylesheets`]:        https://github.com/timche/postcss-german-stylesheets
[`postcss-discard-duplicates`]:        https://github.com/ben-eb/postcss-discard-duplicates
[`postcss-minify-font-weight`]:        https://github.com/ben-eb/postcss-minify-font-weight
[`postcss-pseudo-class-enter`]:        https://github.com/jonathantneal/postcss-pseudo-class-enter
[`postcss-transform-shortcut`]:        https://github.com/jonathantneal/postcss-transform-shortcut
[`postcss-at-rules-variables`]:        https://github.com/GitScrum/postcss-at-rules-variables
[`postcss-logical-properties`]:        https://github.com/ahmadalfy/postcss-logical-properties
[`postcss-responsive-images`]:         https://github.com/azat-io/postcss-responsive-images
[`postcss-tatar-stylesheets`]:         https://github.com/azat-io/postcss-tatar-stylesheets
[`postcss-custom-properties`]:         https://github.com/postcss/postcss-custom-properties
[`postcss-discard-font-face`]:         https://github.com/ben-eb/postcss-discard-font-face
[`postcss-selector-prefixer`]:         https://github.com/ronnyamarante/postcss-selector-prefixer
[`postcss-custom-selectors`]:          https://github.com/postcss/postcss-custom-selectors
[`postcss-discard-comments`]:          https://github.com/ben-eb/postcss-discard-comments
[`postcss-minify-selectors`]:          https://github.com/ben-eb/postcss-minify-selectors
[`postcss-mqwidth-to-class`]:          https://github.com/notacouch/postcss-mqwidth-to-class
[`postcss-quantity-queries`]:          https://github.com/pascalduez/postcss-quantity-queries
[`postcss-browser-reporter`]:          https://github.com/postcss/postcss-browser-reporter
[`postcss-selector-matches`]:          https://github.com/postcss/postcss-selector-matches
[`postcss-shorthand-expand`]:          https://github.com/johnotander/postcss-shorthand-expand
[`postcss-current-selector`]:          https://github.com/komlev/postcss-current-selector
[`postcss-all-link-colors`]:           https://github.com/jedmao/postcss-all-link-colors
[`postcss-color-hex-alpha`]:           https://github.com/postcss/postcss-color-hex-alpha
[`postcss-define-property`]:           https://github.com/daleeidd/postcss-define-property
[`postcss-filter-gradient`]:           https://github.com/yuezk/postcss-filter-gradient
[`postcss-generate-preset`]:           https://github.com/simonsmith/postcss-generate-preset
[`postcss-media-variables`]:           https://github.com/WolfgangKluge/postcss-media-variables
[`postcss-property-lookup`]:           https://github.com/simonsmith/postcss-property-lookup
[`postcss-vertical-rhythm`]:           https://github.com/markgoodyear/postcss-vertical-rhythm
[`postcss-local-constants`]:           https://github.com/macropodhq/postcss-constants
[`postcss-remove-prefixes`]:           https://github.com/johnotander/postcss-remove-prefixes
[`postcss-responsive-type`]:           https://github.com/seaneking/postcss-responsive-type
[`postcss-round-subpixels`]:           https://github.com/himynameisdave/postcss-round-subpixels
[`postcss-short-font-size`]:           https://github.com/jonathantneal/postcss-short-font-size
[`postcss-color-function`]:            https://github.com/postcss/postcss-color-function
[`postcss-conic-gradient`]:            https://github.com/jonathantneal/postcss-conic-gradient
[`postcss-convert-values`]:            https://github.com/ben-eb/postcss-convert-values
[`postcss-partial-import`]:            https://github.com/jonathantneal/postcss-partial-import
[`postcss-pseudoelements`]:            https://github.com/axa-ch/postcss-pseudoelements
[`postcss-safe-important`]:            https://github.com/Crimx/postcss-safe-important
[`postcss-short-position`]:            https://github.com/jonathantneal/postcss-short-position
[`postcss-single-charset`]:            https://github.com/hail2u/postcss-single-charset
[`postcss-flexbugs-fixes`]:            https://github.com/luisrudge/postcss-flexbugs-fixes
[`postcss-shades-of-gray`]:            https://github.com/laureanoarcanio/postcss-shades-of-gray
[`postcss-hash-classname`]:            https://github.com/ctxhou/postcss-hash-classname
[`postcss-oldschool-grid`]:            https://github.com/lordgiotto/postcss-oldschool-grid
[`postcss-alias-atrules`]:             https://github.com/maximkoretskiy/postcss-alias-atrules
[`postcss-color-palette`]:             https://github.com/zaim/postcss-color-palette
[`postcss-assets-rebase`]:             https://github.com/devex-web-frontend/postcss-assets-rebase
[`postcss-color-pantone`]:             https://github.com/longdog/postcss-color-pantone
[`postcss-css-variables`]:             https://github.com/MadLittleMods/postcss-css-variables
[`postcss-discard-empty`]:             https://github.com/ben-eb/postcss-discard-empty
[`postcss-gradientfixer`]:             https://github.com/hallvors/postcss-gradientfixer
[`postcss-modular-scale`]:             https://github.com/kristoferjoseph/postcss-modular-scale
[`postcss-normalize-url`]:             https://github.com/ben-eb/postcss-normalize-url
[`postcss-reduce-idents`]:             https://github.com/ben-eb/postcss-reduce-idents
[`postcss-short-spacing`]:             https://github.com/jonathantneal/postcss-short-spacing
[`postcss-simple-extend`]:             https://github.com/davidtheclark/postcss-simple-extend
[`postcss-russian-units`]:             https://github.com/Semigradsky/postcss-russian-units
[`postcss-image-inliner`]:             https://github.com/bezoerb/postcss-image-inliner
[`postcss-reverse-media`]:             https://github.com/MadLittleMods/postcss-reverse-media
[`postcss-regexp-detect`]:             https://github.com/devex-web-frontend/postcss-regexp-detect
[`postcss-speech-bubble`]:             https://github.com/archana-s/postcss-speech-bubble
[`postcss-mq-keyframes`]:              https://github.com/TCotton/postcss-mq-keyframes
[`postcss-brand-colors`]:              https://github.com/postcss/postcss-brand-colors
[`postcss-class-prefix`]:              https://github.com/thompsongl/postcss-class-prefix
[`postcss-conditionals`]:              https://github.com/andyjansson/postcss-conditionals
[`postcss-sassy-mixins`]:              https://github.com/andyjansson/postcss-sassy-mixins
[`postcss-custom-media`]:              https://github.com/postcss/postcss-custom-media
[`postcss-default-unit`]:              https://github.com/antyakushev/postcss-default-unit
[`postcss-font-awesome`]:              https://github.com/dan-gamble/postcss-font-awesome
[`postcss-flexibility`]:               https://github.com/7rulnik/postcss-flexibility
[`postcss-flexboxfixer`]:              https://github.com/hallvors/postcss-flexboxfixer
[`postcss-font-normalize`]:            https://github.com/iahu/postcss-font-normalize
[`postcss-font-variant`]:              https://github.com/postcss/postcss-font-variant
[`postcss-media-minmax`]:              https://github.com/postcss/postcss-media-minmax
[`postcss-merge-idents`]:              https://github.com/ben-eb/postcss-merge-idents
[`postcss-selector-not`]:              https://github.com/postcss/postcss-selector-not
[`postcss-svg-fallback`]:              https://github.com/justim/postcss-svg-fallback
[`postcss-nested-props`]:              https://github.com/jedmao/postcss-nested-props
[`postcss-aspect-ratio`]:              https://github.com/arccoza/postcss-aspect-ratio
[`postcss-cachebuster`]:               https://github.com/glebmachine/postcss-cachebuster
[`postcss-easysprites`]:               https://github.com/glebmachine/postcss-easysprites
[`postcss-nested-vars`]:               https://github.com/jedmao/postcss-nested-vars
[`postcss-color-alpha`]:               https://github.com/avanes/postcss-color-alpha
[`postcss-color-scale`]:               https://github.com/kristoferjoseph/postcss-color-scale
[`postcss-color-short`]:               https://github.com/andrepolischuk/postcss-color-short
[`postcss-copy-assets`]:               https://github.com/shutterstock/postcss-copy-assets
[`postcss-data-packer`]:               https://github.com/Ser-Gen/postcss-data-packer
[`postcss-font-family`]:               https://github.com/ben-eb/postcss-font-family
[`postcss-simple-grid`]:               https://github.com/admdh/postcss-simple-grid
[`postcss-merge-rules`]:               https://github.com/ben-eb/postcss-merge-rules
[`postcss-simple-vars`]:               https://github.com/postcss/postcss-simple-vars
[`postcss-strip-units`]:               https://github.com/whitneyit/postcss-strip-units
[`postcss-style-guide`]:               https://github.com/morishitter/postcss-style-guide
[`postcss-will-change`]:               https://github.com/postcss/postcss-will-change
[`postcss-input-style`]:               https://github.com/seaneking/postcss-input-style
[`css-declaration-sorter`]:            https://github.com/Siilwyn/css-declaration-sorter
[`postcss-remove-root`]:               https://github.com/cbracco/postcss-remove-root
[`postcss-mq-optimize`]:               https://github.com/panec/postcss-mq-optimize
[`postcss-ase-colors`]:                https://github.com/dfernandez79/postcss-ase-colors
[`postcss-bem-linter`]:                https://github.com/postcss/postcss-bem-linter
[`postcss-color-gray`]:                https://github.com/postcss/postcss-color-gray
[`postcss-colorblind`]:                https://github.com/btholt/postcss-colorblind
[`postcss-inline-rtl`]:                https://github.com/jakob101/postcss-inline-rtl
[`postcss-color-hexa`]:                https://github.com/nicksheffield/postcss-color-hexa
[`postcss-short-text`]:                https://github.com/jonathantneal/postcss-short-text
[`postcss-inline-svg`]:                https://github.com/TrySound/postcss-inline-svg
[`postcss-autoreset`]:                 https://github.com/maximkoretskiy/postcss-autoreset
[`postcss-font-pack`]:                 https://github.com/jedmao/postcss-font-pack
[`postcss-reference`]:                 https://github.com/dehuszar/postcss-reference
[`postcss-functions`]:                 https://github.com/andyjansson/postcss-functions
[`postcss-color-hcl`]:                 https://github.com/devgru/postcss-color-hcl
[`postcss-color-hwb`]:                 https://github.com/postcss/postcss-color-hwb
[`postcss-color-mix`]:                 https://github.com/iamstarkov/postcss-color-mix
[`postcss-color-yiq`]:                 https://github.com/ben-eb/postcss-color-yiq
[`postcss-filter-mq`]:                 https://github.com/simeydotme/postcss-filter-mq
[`postcss-image-set`]:                 https://github.com/alex499/postcss-image-set
[`postcss-write-svg`]:                 https://github.com/jonathantneal/postcss-write-svg
[`postcss-animation`]:                 https://github.com/zhouwenbin/postcss-animation
[`postcss-instagram`]:                 https://github.com/azat-io/postcss-instagram
[`postcss-namespace`]:                 https://github.com/totora0155/postcss-namespace
[`postcss-clearfix`]:                  https://github.com/seaneking/postcss-clearfix
[`postcss-colormin`]:                  https://github.com/ben-eb/colormin
[`postcss-cssstats`]:                  https://github.com/cssstats/postcss-cssstats
[`postcss-currency`]:                  https://github.com/talgautb/postcss-currency
[`postcss-fallback`]:                  https://github.com/MadLittleMods/postcss-fallback
[`postcss-imperial`]:                  https://github.com/cbas/postcss-imperial
[`postcss-position`]:                  https://github.com/seaneking/postcss-position
[`postcss-rgba-hex`]:                  https://github.com/XOP/postcss-rgba-hex
[`postcss-contrast`]:                  https://github.com/stephenway/postcss-contrast
[`postcss-spiffing`]:                  https://github.com/HashanP/postcss-spiffing
[`postcss-triangle`]:                  https://github.com/jedmao/postcss-triangle
[`postcss-verthorz`]:                  https://github.com/davidhemphill/postcss-verthorz
[`pleeease-filters`]:                  https://github.com/iamvdo/pleeease-filters
[`postcss-fontpath`]:                  https://github.com/seaneking/postcss-fontpath
[`postcss-reporter`]:                  https://github.com/postcss/postcss-reporter
[`postcss-trolling`]:                  https://github.com/juanfran/postcss-trolling
[`postcss-if-media`]:                  https://github.com/arccoza/postcss-if-media
[`postcss-flexbox`]:                   https://github.com/archana-s/postcss-flexbox
[`postcss-modules`]:                   https://github.com/outpunk/postcss-modules
[`postcss-easings`]:                   https://github.com/postcss/postcss-easings
[`postcss-hexrgba`]:                   https://github.com/seaneking/postcss-hexrgba
[`postcss-initial`]:                   https://github.com/maximkoretskiy/postcss-initial
[`postcss-rgb-plz`]:                   https://github.com/himynameisdave/postcss-rgb-plz
[`postcss-opacity`]:                   https://github.com/iamvdo/postcss-opacity
[`postcss-pointer`]:                   https://github.com/markgoodyear/postcss-pointer
[`postcss-pxtorem`]:                   https://github.com/cuth/postcss-pxtorem
[`postcss-scopify`]:                   https://github.com/pazams/postcss-scopify
[`postcss-sprites`]:                   https://github.com/2createStudio/postcss-sprites
[`postcss-sorting`]:                   https://github.com/hudochenkov/postcss-sorting
[`postcss-assets`]:                    https://github.com/borodean/postcss-assets
[`postcss-border`]:                    https://github.com/andrepolischuk/postcss-border
[`postcss-center`]:                    https://github.com/jedmao/postcss-center
[`postcss-circle`]:                    https://github.com/jedmao/postcss-circle
[`postcss-hidden`]:                    https://github.com/lukelarsen/postcss-hidden
[`postcss-urlrev`]:                    https://github.com/yuezk/postcss-urlrev
[`postcss-extend`]:                    https://github.com/travco/postcss-extend
[`postcss-fakeid`]:                    https://github.com/pathsofdesign/postcss-fakeid
[`postcss-filter-stream`]:             https://github.com/tsm91/postcss-filter-stream
[`postcss-filter`]:                    https://github.com/alanev/postcss-filter
[`postcss-import`]:                    https://github.com/postcss/postcss-import
[`postcss-mixins`]:                    https://github.com/postcss/postcss-mixins
[`postcss-nested`]:                    https://github.com/postcss/postcss-nested
[`postcss-select`]:                    https://github.com/johnotander/postcss-select
[`postcss-zindex`]:                    https://github.com/ben-eb/postcss-zindex
[`list-selectors`]:                    https://github.com/davidtheclark/list-selectors
[`mq4-hover-shim`]:                    https://github.com/twbs/mq4-hover-shim
[`postcss-atroot`]:                    https://github.com/OEvgeny/postcss-atroot
[`postcss-layout`]:                    https://github.com/arccoza/postcss-layout
[`postcss-focus`]:                     https://github.com/postcss/postcss-focus
[`postcss-apply`]:                     https://github.com/pascalduez/postcss-apply
[`css2modernizr`]:                     https://github.com/vovanbo/css2modernizr
[`font-magician`]:                     https://github.com/jonathantneal/postcss-font-magician
[`postcss-match`]:                     https://github.com/rtsao/postcss-match
[`postcss-alias`]:                     https://github.com/seaneking/postcss-alias
[`postcss-scrib`]:                     https://github.com/sneakertack/postcss-scrib
[`perfectionist`]:                     https://github.com/ben-eb/perfectionist
[`immutable-css`]:                     https://github.com/johnotander/immutable-css
[`postcss-at2x`]:                      https://github.com/simonsmith/postcss-at2x
[`postcss-calc`]:                      https://github.com/postcss/postcss-calc
[`postcss-crip`]:                      https://github.com/johnie/postcss-crip
[`postcss-each`]:                      https://github.com/outpunk/postcss-each
[`postcss-epub`]:                      https://github.com/Rycochet/postcss-epub
[`postcss-grid`]:                      https://github.com/andyjansson/postcss-grid
[`postcss-host`]:                      https://github.com/vitkarpov/postcss-host
[`postcss-neat`]:                      https://github.com/jo-asakura/postcss-neat
[`postcss-size`]:                      https://github.com/postcss/postcss-size
[`postcss-svgo`]:                      https://github.com/ben-eb/postcss-svgo
[`postcss-unmq`]:                      https://github.com/jonathantneal/postcss-unmq
[`postcss-vmin`]:                      https://github.com/iamvdo/postcss-vmin
[`autoprefixer`]:                      https://github.com/postcss/autoprefixer
[`css-mqpacker`]:                      https://github.com/hail2u/node-css-mqpacker
[`postcss-bem`]:                       https://github.com/ileri/postcss-bem
[`postcss-for`]:                       https://github.com/antyakushev/postcss-for
[`postcss-map`]:                       https://github.com/pascalduez/postcss-map
[`postcss-raw`]:                       https://github.com/MadLittleMods/postcss-raw
[`postcss-svg`]:                       https://github.com/Pavliko/postcss-svg
[`postcss-url`]:                       https://github.com/postcss/postcss-url
[`colorguard`]:                        https://github.com/SlexAxton/css-colorguard
[`stylehacks`]:                        https://github.com/ben-eb/stylehacks
[`css-byebye`]:                        https://github.com/AoDev/css-byebye
[`cssgrace`]:                          https://github.com/cssdream/cssgrace
[`csstyle`]:                           https://github.com/geddski/csstyle
[`webpcss`]:                           https://github.com/lexich/webpcss
[`cssfmt`]:                            https://github.com/morishitter/cssfmt
[`doiuse`]:                            https://github.com/anandthakker/doiuse
[`pixrem`]:                            https://github.com/robwierzbowski/node-pixrem
[`rtlcss`]:                            https://github.com/MohammadYounes/rtlcss
[`short`]:                             https://github.com/jonathantneal/postcss-short
[`lost`]:                              https://github.com/corysimmons/lost
[`postcss-maze`]:                      https://github.com/cathydutton/postcss-maze
