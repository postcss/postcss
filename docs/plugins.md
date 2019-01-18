# PostCSS Plugins

## Control

There are two ways to make PostCSS magic more explicit.

Limit a plugin's local stylesheet context using [`postcss-plugin-context`]:

```pcss
.css-example.is-test-for-css4-browsers {
  color: gray(255, 50%);
}
@context postcss-preset-env {
  .css-example.is-fallback-for-all-browsers {
    color: gray(255, 50%);
  }
}
```

Or enable plugins directly in CSS using [`postcss-use`]:

```pcss
@use autoprefixer(browsers: ['last 2 versions']);

:fullscreen a {
  display: flex;
}
```

[`postcss-plugin-context`]: https://github.com/postcss/postcss-plugin-context
[`postcss-use`]:            https://github.com/postcss/postcss-use

## Packs

* [`postcss-utilities`] includes the most commonly used mixins, shortcuts
  and helpers to use as `@util` rules.
* [`atcss`] contains plugins that transform your CSS according
  to special annotation comments.
* [`cssnano`] contains plugins that optimize CSS size for use in production.
* [`oldie`] contains plugins that transform your CSS
  for older Internet Explorer compatibility.
* [`precss`] contains plugins that allow you to use Sass-like CSS.
* [`rucksack`] contains plugins to speed up CSS development
  with new features and shortcuts.
* [`level4`] contains only plugins that let you write CSS4 without
  the IE9 fallbacks.
* [`short`] adds and extends numerous shorthand properties.
* [`stylelint`] contains plugins that lint your stylesheets.
* [`postcss-hamster`] for vertical rhythm, typography, modular scale functions.
* [`postcss-preset-env`] lets you convert modern CSS into something most browsers can understand, determining the polyfills you need based on your targeted browsers or runtime environments.

[`postcss-preset-env`]: https://github.com/jonathantneal/postcss-preset-env/
[`postcss-utilities`]:  https://github.com/ismamz/postcss-utilities
[`postcss-hamster`]:    https://github.com/h0tc0d3/postcss-hamster
[`stylelint`]:          https://github.com/stylelint/stylelint
[`rucksack`]:           http://simplaio.github.io/rucksack
[`cssnano`]:            http://cssnano.co/
[`level4`]:             https://github.com/stephenway/level4
[`precss`]:             https://github.com/jonathantneal/precss
[`oldie`]:              https://github.com/jonathantneal/oldie
[`atcss`]:              https://github.com/morishitter/atcss

## Future CSS Syntax

* [`postcss-apply`] supports custom properties sets references.
* [`postcss-attribute-case-insensitive`] supports case insensitive attributes.
* [`postcss-color-function`] supports functions to transform colors.
* [`postcss-color-gray`] supports the `gray()` function.
* [`postcss-color-hex-alpha`] supports `#rrggbbaa` and `#rgba` notation.
* [`postcss-color-hsl`]: transforms CSS Colors 4 `hsl()` to more compatible
  `hsl()` or `hsla()`.
* [`postcss-color-hwb`] transforms `hwb()` to widely compatible `rgb()`.
* [`postcss-color-rebeccapurple`] supports the `rebeccapurple` color.
* [`postcss-color-rgb`]: transforms CSS Colors 4 `rgb()` to more compatible
  `rgb()` or `rgba()`.
* [`postcss-conic-gradient`] supports the `conic-gradient` background.
* [`postcss-custom-media`] supports custom aliases for media queries.
* [`postcss-custom-properties`] supports variables, using syntax from
  the W3C Custom Properties.
* [`postcss-custom-selectors`] adds custom aliases for selectors.
* [`postcss-extend`] supports spec-approximate `@extend` for rules
  and placeholders, recursively.
* [`postcss-font-normalize`] to normalize font, especially `font-family`.
* [`postcss-font-variant`] transpiles human-readable `font-variant`
  to more widely supported CSS.
* [`postcss-font-family-system-ui`] transforms W3C CSS `font-family: system-ui` to a practical font list.
* [`postcss-font-display`] add `font-display` css rule.
* [`postcss-host`] makes the Shadow DOM’s `:host` selector work properly
  with pseudo-classes.
* [`postcss-initial`] supports `initial` keyword and `all: initial`
  to clean inherit styles.
* [`postcss-logical-properties`] transforms `start` and `end` properties
  to `left` and `right` depending on the writing direction of the document.
* [`postcss-bidirection`] generate left-to-right and right-to-left styles with single syntax.
* [`postcss-media-minmax`] adds `<=` and `=>` statements to media queries.
* [`postcss-pseudo-class-any-link`] adds `:any-link` pseudo-class.
* [`postcss-selector-not`] transforms CSS4 `:not()` to CSS3 `:not()`.
* [`postcss-selector-matches`] transforms CSS4 `:matches()`
  to more compatible CSS.
* [`postcss-start-to-end`] lets you control your layout (LTR or RTL)
  through logical rather than direction / physical rules.
* [`postcss-subgrid`] provides a basic shim for the CSS `display: subgrid` spec.
* [`mq4-hover-shim`] supports the `@media (hover)` feature.

See also [`posctss-preset-env`] plugins pack to add future CSS syntax
by one line of code.

## Fallbacks

* [`postcss-color-rgba-fallback`] transforms `rgba()` to hexadecimal.
* [`postcss-disabled`] adds a `[disabled]` attribute and/or a `.disabled` class
  when the `:disabled` pseudo class is present.
* [`postcss-epub`] adds the `-epub-` prefix to relevant properties.
* [`postcss-esplit`] splits your CSS exceeding 4095 selectors for IE.
* [`postcss-fallback`] adds `fallback` function to avoid duplicate declarations.
* [`postcss-filter-gradient`] adds gradient filter for the old IE.
* [`postcss-flexibility`] adds `-js-` prefix for [`Flexibility polyfill`].
* [`postcss-gradient-transparency-fix`] transforms `transparent` values
  in gradients to support Safari's different color interpolation.
* [`postcss-hash-classname`] append hash string to your css class name.
* [`postcss-mqwidth-to-class`] converts min/max-width media queries to classes.
* [`postcss-opacity`] adds opacity filter for IE8.
* [`postcss-page-break`] adds `page-break-` fallback to `break-` properties.
* [`postcss-pseudoelements`] Convert `::` selectors into `:` selectors
  for IE 8 compatibility.
* [`postcss-replace-overflow-wrap`] replace `overflow-wrap` with `word-wrap`.
* [`postcss-round-subpixels`] plugin that rounds sub-pixel values
  to the nearest
  full pixel.
* [`postcss-unmq`] removes media queries while preserving desktop rules
  for IE≤8.
* [`postcss-vmin`] generates `vm` fallback for `vmin` unit in IE9.
* [`postcss-will-change`] inserts 3D hack before `will-change` property.
* [`autoprefixer`] adds vendor prefixes for you, using data from Can I Use.
* [`postcss-pie`] makes IE several of the most useful CSS3 decoration features.
* [`cssgrace`] provides various helpers and transpiles CSS 3 for IE
  and other old browsers.
* [`pixrem`] generates pixel fallbacks for `rem` units.
* [`postcss-fixie`] adds easy and painless IE hacks

See also [`oldie`] plugins pack.

[`Flexibility polyfill`]: https://github.com/10up/flexibility

## Language Extensions

* [`postcss-aspect-ratio`] fix an element's dimensions to an aspect ratio.
* [`postcss-atroot`] place rules directly at the root node.
* [`postcss-bem`] adds at-rules for BEM and SUIT style classes.
* [`postcss-click`] allows to use the `:click` pseudo class and implement it in JavaScript.
* [`postcss-compact-mq`] provides compact syntax for media queries based
  on viewport width.
* [`postcss-conditionals`] adds `@if` statements.
* [`postcss-css-variables`] supports variables for selectors, and at-rules
  using W3C similar syntax.
* [`postcss-current-selector`] to get current selector in declaration.
* [`postcss-define-property`] to define properties shortcut.
* [`postcss-define-function`] to implement Sass `@function` directive.
* [`postcss-each`] adds `@each` statement.
* [`postcss-for`] adds `@for` loops.
* [`postcss-at-rules-variables`] adds support for custom properties in
  `@for`, `@each`, `@if`, etc.
* [`postcss-functions`] enables exposure of JavaScript functions.
* [`postcss-if-media`] inline or nest media queries within
  CSS rules & properties.
* [`postcss-inline-media`] inline multiple media queries into CSS property
  values.
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
* [`postcss-ref`] refers properties from another rule.
* [`postcss-reverse-media`] reverse/Invert media query parameters.
* [`postcss-sassy-mixins`] enables mixins with Sass keywords.
* [`postcss-map-get`] adds the ability to use Sass like map function `map-get`.
* [`postcss-simple-extend`] lightweight extending of silent classes,
  like Sass’ `@extend`.
* [`postcss-simple-vars`] supports for Sass-style variables.
* [`postcss-strip-units`] strips units off of property values.
* [`postcss-vertical-rhythm`] adds a vertical rhythm unit
  based on `font-size` and `line-height`.
* [`postcss-vertical-rhythm-function`] adds a vertical rhythm `vr()` function
  that is unit agnostic and works in situations where the font-size cannot
  be calculated during build time.
* [`postcss-responsive-properties`] allows you to write responsive
  property values.
* [`postcss-text-remove-gap`] remove space before and after text strings, added
  by line-height and extra space in glyph itself.
* [`postcss-closest`] plugin to modify closest matching part of current
  selector.
* [`csstyle`] adds components workflow to your styles.
* [`postcss-percentage`] support Sass-like `percentage()` function.
* [`postcss-state-selector`] write CSS based on component's state.

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
* [`postcss-get-color`] get the prominent colors from an image.
* [`postcss-randomcolor`] supports function to use random color.

## Images and Fonts

* [`postcss-assets`] allows you to simplify URLs, insert image dimensions,
  and inline files.
* [`postcss-assets-rebase`] rebases assets from `url()`.
* [`postcss-at2x`] handles retina background images via use of `at-2x` keyword.
* [`postcss-background-image-auto-size`] generates CSS rules `width` and `height` for `background-image` automatically.
* [`postcss-border-9-patch`] generates 9-patch like border styles via a custom rule.
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
* [`postcss-filter-tint`] adds tint filter to elements such as images.
* [`postcss-foft-classes`] adds guarding classes to blocks using web fonts for better font loading strategies.
* [`postcss-font-awesome`] adds an easy shortcut to font-awesome unicode codes
* [`postcss-font-pack`] simplifies font declarations and validates they match
  configured font packs.
* [`postcss-fontsize`] generates `rem` unit `font-size` and `line-height` with `px` fallbacks.
* [`postcss-fontpath`] adds font links for different browsers.
* [`postcss-lazyimagecss`] adds image width and height automatically.
* [`postcss-lazysprite`] generates sprites from the directory of images.
* [`postcss-placehold`] makes it easy to drop in placeholder images.
* [`postcss-resemble-image`] provides a gradient fallback for an image that
loosely resembles the original.
* [`postcss-responsive-images`] adds stylesheets for making
  your images responsive.
* [`postcss-sprites`] generates CSS sprites from stylesheets.
* [`postcss-svg`] insert inline SVG to CSS and allows to manage it colors.
* [`postcss-svg-fallback`] converts SVG in your CSS to PNG files for IE 8.
* [`postcss-svgo`] processes inline SVG through [SVGO].
* [`postcss-unicode-characters`] makes it easier to write `unicode-range` descriptors.
* [`postcss-url`] rebases or inlines `url()`s.
* [`postcss-urlrev`] adds MD5 hash strings to `url()`s.
* [`postcss-write-svg`] write inline SVGs in CSS.
* [`postcss-inline-svg`] inline SVG images and customize their styles.
* [`webpcss`] adds URLs for WebP images for browsers that support WebP.
* [`postcss-font-grabber`] it grabs remote fonts in `@font-face`, download them and update your CSS.

## Grids

* [`postcss-grid`] adds a semantic grid system.
* [`postcss-grid-kiss`] transforms ASCII-art grids into CSS Grid layout.
* [`postcss-grid-system`] creates grids based on a fixed column width.
* [`postcss-grid-fluid`] creates fluid grids.
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
* [`postcss-class-name-shortener`] shortens CSS class names to optimize website performance.
* [`postcss-combine-duplicated-selectors`] automatically join identical css selectors.
* [`postcss-filter-mq`] Filter all matching or non-matching media queries.
* [`postcss-import`] inlines the stylesheets referred to by `@import` rules.
* [`postcss-nested-import`] inlines stylesheets referred to by `@import` rules inside nested rule blocks.
* [`postcss-partial-import`] inlines standard imports and Sass-like partials.
* [`postcss-reference`] emulates Less’s [`@import (reference)`].
* [`postcss-remove-root`] removes all instances of `:root` from a stylesheet.
* [`postcss-single-charset`] ensures that there is one and only one
  `@charset` rule at the top of file.
* [`postcss-zindex`] rebases positive `z-index` values.
* [`postcss-unprefix`] Unprefixes vendor prefixes in legacy CSS.
* [`css-byebye`] removes the CSS rules that you don’t want.
* [`css-mqpacker`] joins matching CSS media queries into a single statement.
* [`stylehacks`] removes CSS hacks based on browser support.
* [`postcss-mq-optimize`] removes invalid media queries or its expressions.
* [`postcss-uncss`] removes unused CSS from your stylesheets.
* [`postcss-html-filter`] filters out CSS that does not apply to the HTML you provide.
* [`postcss-no-important`] delete declarations !important.

See also plugins in modular minifier [`cssnano`].

[@import (reference)]: http://lesscss.org/features/#import-options-reference
[SVGO]: https://github.com/svg/svgo

## Shortcuts

* [`postcss-alias`] creates shorter aliases for properties.
* [`postcss-alias-atrules`] creates shorter aliases for at-rules.
* [`postcss-all-link-colors`] insert colors for link-related pseudo-classes.
* [`postcss-border`] adds shorthand for width and color of all borders
  in `border` property.
* [`postcss-border-shortcut`] PostCSS plugin for assign default `border` type if not expressed.
* [`postcss-button`] creates buttons.
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
* [`postcss-nested-ancestors`] reference any parent/ancestor selector in nested CSS.
* [`postcss-parent-selector`] adds a parent selector to the beginning of all rules.
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
* [`postcss-typescale`] sets type based on a typographic scale.
* [`postcss-verthorz`] adds vertical and horizontal spacing declarations.
* [`font-magician`] generates all the `@font-face` rules needed in CSS.
* [`postcss-animation`] PostCSS plugin that adds `@keyframes` from animate.css.
* [`postcss-magic-animations`] PostCSS plugin that adds `@keyframes` from Magic Animations.

## Others

* [`postcss-alter-property-value`] alters your CSS declarations from a rule based configuration.
* [`postcss-attribute-selector-prefix`] adds a prefix to attribute selectors
* [`postcss-autoreset`]  automatically adds reset styles.
* [`postcss-bem-to-js`] creates a JavaScript definition file for BEM-style CSS.
* [`postcss-bom`] adds a UTF-8 BOM to files.
* [`postcss-camelcaser`] transforms selectors to CamelCase.
* [`postcss-class-prefix`] adds a prefix/namespace to class selectors.
* [`postcss-classes-to-mixins`] converts classes to Sass, Less and Stylus mixins
* [`postcss-currency`] replaces name of currency with symbols.
* [`postcss-eol`] replaces EOL of files.
* [`postcss-extract-value`] extracts values from css properties and puts them into variables.
* [`postcss-fakeid`] transforms `#foo` IDs to attribute selectors `[id="foo"]`.
* [`postcss-filter-stream`] blacklist files / folders that you don't want
  to process with a PostCSS plugin.
* [`postcss-flexbox`] easy way to understand and start using CSS3 Flexbox.
* [`postcss-flexboxfixer`] unprefixes `-webkit-` only flexbox in legacy CSS.
* [`postcss-flexbugs-fixes`] fixes some of known [flexbox bugs].
* [`postcss-gradientfixer`] unprefixes `-webkit-` only gradients in legacy CSS.
* [`postcss-hash`] replaces output file names with hash algorithms
  for cache busting.
* [`postcss-ie8`] strips out unsupported properties and media queries for IE8.
* [`postcss-increase-specificity`] increases the specificity of your selectors.
* [`postcss-inline-rtl`] converts your CSS to right-to-left,
  but inline (adding just what you need).
* [`postcss-join-transitions`] joins conflicting transition declarations.
* [`postcss-letter-tracking`] generates relative, Photoshop-compatible letter tracking for improved letter spacing.
* [`postcss-light-text`]  adds `-webkit-` antialiasing for light text.
* [`postcss-modules`]  allows to use CSS Modules everywhere.
* [`postcss-mq-keyframes`] moves any animation keyframes in media queries
  to the end of the file.
* [`postcss-mq-last`] gives media query rules precedence by moving them to the end of the file.
* [`postcss-node-modules-replacer`] replaces path than includes `node_modules`
  to `~`.
* [`postcss-plugin-namespace`] add a css selector to all rules, so that css file don't affect other element.
* [`postcss-pseudo-content-insert`] adds `content: ''` to `:before` and `:after`
  if it is missing.
* [`postcss-pseudo-element-cases`] converts `.style::BEFORE` into `.style::before` and vice versa.
* [`postcss-pseudo-element-colons`] converts `.style:before` into `.style::before` and vice versa.
* [`postcss-pseudo-elements-content`] adds `content: ''` to `:before-c`
  and `:after-c`.
* [`postcss-pxtorem`] converts pixel units to `rem`.
* [`postcss-raw`] protects nodes inside `@raw` at-rules from being touched
  by other plugins.
* [`postcss-remove-prefixes`] removes vendor prefixes.
* [`postcss-safe-important`] adds `!important` to style declarations safely.
* [`postcss-sanitize`] remove properties and values using rules (css sanitization).
* [`postcss-scopify`] adds a user input scope to each selector.
* [`postcss-select`] select rules based off a selector list.
* [`postcss-selector-prefixer`] adds a prefix to css selectors.
* [`postcss-shorthand-expand`] expands shorthand properties.
* [`postcss-sorting`] sort rules content with specified order.
* [`postcss-style-guide`] generates a style guide automatically.
* [`css-declaration-sorter`] sorts CSS declarations fast and automatically
  in a certain order.
* [`perfectionist`] formats poorly written CSS and renders a “pretty” result.
* [`rtlcss`] mirrors styles for right-to-left locales.
* [`stylefmt`] modern CSS formatter that works well with `stylelint`.
* [`postcss-autocorrect`] Corrects typos and notifies in the console.


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
* [`postcss-forced-variables`] provides warnings and errors when specified properties don't use variables.
* [`postcss-reporter`] logs warnings and other messages from other plugins
  in the console.

## Fun

* [`postcss-australian-stylesheets`] Australian Style Sheets.
* [`postcss-andalusian-stylesheets`] Andalusian Style Sheets.
* [`postcss-aze-stylesheets`] Azerbaijanian Style Sheets.
* [`postcss-canadian-stylesheets`] Canadian Style Sheets.
* [`postcss-chinese-stylesheets`] Chinese Style Sheets.
* [`postcss-czech-stylesheets`] Czech Style Sheets.
* [`postcss-german-stylesheets`] German Style Sheets.
* [`postcss-italian-stylesheets`] Italian Style Sheets.
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
* [`postcss-nope`] lets you write `nope` instead of `none`.
* [`postcss-glitch`] add glitch effect to your text.

[`postcss-background-image-auto-size`]:   https://github.com/JustClear/postcss-background-image-auto-size
[`postcss-letter-tracking`]:              https://github.com/letsjaam/postcss-letter-tracking
[`postcss-combine-duplicated-selectors`]: https://github.com/ChristianMurphy/postcss-combine-duplicated-selectors
[`postcss-attribute-case-insensitive`]:   https://github.com/Semigradsky/postcss-attribute-case-insensitive
[`postcss-alter-property-value`]:         https://github.com/kunukn/postcss-alter-property-value
[`postcss-attribute-selector-prefix`]:    https://github.com/GitScrum/postcss-attribute-selector-prefix
[`postcss-gradient-transparency-fix`]:    https://github.com/gilmoreorless/postcss-gradient-transparency-fix
[`postcss-vertical-rhythm-function`]:     https://github.com/F21/postcss-vertical-rhythm-function
[`postcss-pseudo-class-any-button`]:      https://github.com/andrepolischuk/postcss-pseudo-class-any-button
[`postcss-pseudo-elements-content`]:      https://github.com/omgovich/postcss-pseudo-elements-content
[`postcss-pseudo-element-cases`]:         https://github.com/timelsass/postcss-pseudo-element-cases
[`postcss-pseudo-element-colons`]:        https://github.com/timelsass/postcss-pseudo-element-colons
[`postcss-aze-stylesheets`]:              https://github.com/iskandarovBakshi/postcss-aze-stylesheets
[`postcss-andalusian-stylesheets`]:       https://github.com/bameda/postcss-andalusian-stylesheets
[`postcss-australian-stylesheets`]:       https://github.com/dp-lewis/postcss-australian-stylesheets
[`postcss-responsive-properties`]:        https://github.com/alexandr-solovyov/postcss-responsive-properties
[`postcss-pseudo-class-any-link`]:        https://github.com/jonathantneal/postcss-pseudo-class-any-link
[`postcss-pseudo-content-insert`]:        https://github.com/liquidlight/postcss-pseudo-content-insert
[`postcss-canadian-stylesheets`]:         https://github.com/chancancode/postcss-canadian-stylesheets
[`postcss-increase-specificity`]:         https://github.com/MadLittleMods/postcss-increase-specificity
[`postcss-chinese-stylesheets`]:          https://github.com/zhouwenbin/postcss-chinese-stylesheets
[`postcss-italian-stylesheets`]:          https://github.com/Pustur/postcss-italian-stylesheets
[`postcss-russian-stylesheets`]:          https://github.com/Semigradsky/postcss-russian-stylesheets
[`postcss-swedish-stylesheets`]:          https://github.com/johnie/postcss-swedish-stylesheets
[`postcss-color-rebeccapurple`]:          https://github.com/postcss/postcss-color-rebeccapurple
[`postcss-color-rgba-fallback`]:          https://github.com/postcss/postcss-color-rgba-fallback
[`postcss-spanish-stylesheets`]:          https://github.com/ismamz/postcss-spanish-stylesheets
[`postcss-at-rules-variables`]:           https://github.com/GitScrum/postcss-at-rules-variables
[`postcss-discard-duplicates`]:           https://github.com/ben-eb/postcss-discard-duplicates
[`postcss-german-stylesheets`]:           https://github.com/timche/postcss-german-stylesheets
[`postcss-logical-properties`]:           https://github.com/ahmadalfy/postcss-logical-properties
[`postcss-bidirection`]:                  https://github.com/gasolin/postcss-bidirection
[`postcss-lolcat-stylesheets`]:           https://github.com/sandralundgren/postcss-lolcat-stylesheets
[`postcss-minify-font-weight`]:           https://github.com/ben-eb/postcss-minify-font-weight
[`postcss-pseudo-class-enter`]:           https://github.com/jonathantneal/postcss-pseudo-class-enter
[`postcss-transform-shortcut`]:           https://github.com/jonathantneal/postcss-transform-shortcut
[`postcss-unicode-characters`]:           https://github.com/ben-eb/postcss-unicode-characters
[`postcss-custom-properties`]:            https://github.com/postcss/postcss-custom-properties
[`postcss-czech-stylesheets`]:            https://github.com/HoBi/postcss-czech-stylesheets
[`postcss-discard-font-face`]:            https://github.com/ben-eb/postcss-discard-font-face
[`postcss-responsive-images`]:            https://github.com/azat-io/postcss-responsive-images
[`postcss-selector-prefixer`]:            https://github.com/amaranter/postcss-selector-prefixer
[`postcss-tatar-stylesheets`]:            https://github.com/azat-io/postcss-tatar-stylesheets
[`postcss-browser-reporter`]:             https://github.com/postcss/postcss-browser-reporter
[`postcss-current-selector`]:             https://github.com/komlev/postcss-current-selector
[`postcss-custom-selectors`]:             https://github.com/postcss/postcss-custom-selectors
[`postcss-discard-comments`]:             https://github.com/ben-eb/postcss-discard-comments
[`postcss-forced-variables`]:             https://github.com/alekhrycaiko/postcss-forced-variables
[`postcss-magic-animations`]:             https://github.com/nucliweb/postcss-magic-animations/
[`postcss-minify-selectors`]:             https://github.com/ben-eb/postcss-minify-selectors
[`postcss-mqwidth-to-class`]:             https://github.com/notacouch/postcss-mqwidth-to-class
[`postcss-quantity-queries`]:             https://github.com/pascalduez/postcss-quantity-queries
[`postcss-selector-matches`]:             https://github.com/postcss/postcss-selector-matches
[`postcss-shorthand-expand`]:             https://github.com/johnotander/postcss-shorthand-expand
[`postcss-all-link-colors`]:              https://github.com/jedmao/postcss-all-link-colors
[`postcss-border-shortcut`]:              https://github.com/michelemazzucco/postcss-border-shortcut
[`postcss-color-hex-alpha`]:              https://github.com/postcss/postcss-color-hex-alpha
[`postcss-define-property`]:              https://github.com/daleeidd/postcss-define-property
[`postcss-define-function`]:              https://github.com/titancat/postcss-define-function
[`postcss-filter-gradient`]:              https://github.com/yuezk/postcss-filter-gradient
[`postcss-generate-preset`]:              https://github.com/simonsmith/postcss-generate-preset
[`postcss-local-constants`]:              https://github.com/macropodhq/postcss-constants
[`postcss-media-variables`]:              https://github.com/WolfgangKluge/postcss-media-variables
[`postcss-page-break`]:                   https://github.com/shrpne/postcss-page-break
[`postcss-property-lookup`]:              https://github.com/simonsmith/postcss-property-lookup
[`postcss-remove-prefixes`]:              https://github.com/johnotander/postcss-remove-prefixes
[`postcss-replace-overflow-wrap`]:        https://github.com/MattDiMu/postcss-replace-overflow-wrap
[`postcss-responsive-type`]:              https://github.com/seaneking/postcss-responsive-type
[`postcss-round-subpixels`]:              https://github.com/himynameisdave/postcss-round-subpixels
[`postcss-short-font-size`]:              https://github.com/jonathantneal/postcss-short-font-size
[`postcss-vertical-rhythm`]:              https://github.com/markgoodyear/postcss-vertical-rhythm
[`postcss-border-9-patch`]:               https://github.com/teaualune/postcss-border-9-patch
[`postcss-color-function`]:               https://github.com/postcss/postcss-color-function
[`postcss-conic-gradient`]:               https://github.com/jonathantneal/postcss-conic-gradient
[`postcss-convert-values`]:               https://github.com/ben-eb/postcss-convert-values
[`postcss-flexbugs-fixes`]:               https://github.com/luisrudge/postcss-flexbugs-fixes
[`postcss-font-normalize`]:               https://github.com/iahu/postcss-font-normalize
[`postcss-hash-classname`]:               https://github.com/ctxhou/postcss-hash-classname
[`postcss-oldschool-grid`]:               https://github.com/lordgiotto/postcss-oldschool-grid
[`postcss-partial-import`]:               https://github.com/jonathantneal/postcss-partial-import
[`postcss-pseudoelements`]:               https://github.com/axa-ch/postcss-pseudoelements
[`postcss-resemble-image`]:               https://github.com/ben-eb/postcss-resemble-image
[`postcss-safe-important`]:               https://github.com/Crimx/postcss-safe-important
[`postcss-shades-of-gray`]:               https://github.com/laureanoarcanio/postcss-shades-of-gray
[`postcss-short-position`]:               https://github.com/jonathantneal/postcss-short-position
[`postcss-single-charset`]:               https://github.com/hail2u/postcss-single-charset
[`css-declaration-sorter`]:               https://github.com/Siilwyn/css-declaration-sorter
[`postcss-alias-atrules`]:                https://github.com/maximkoretskiy/postcss-alias-atrules
[`postcss-assets-rebase`]:                https://github.com/devex-web-frontend/postcss-assets-rebase
[`postcss-color-palette`]:                https://github.com/zaim/postcss-color-palette
[`postcss-color-pantone`]:                https://github.com/longdog/postcss-color-pantone
[`postcss-css-variables`]:                https://github.com/MadLittleMods/postcss-css-variables
[`postcss-discard-empty`]:                https://github.com/ben-eb/postcss-discard-empty
[`postcss-extract-value`]:                https://github.com/lutien/postcss-extract-value
[`postcss-filter-stream`]:                https://github.com/tsm91/postcss-filter-stream
[`postcss-gradientfixer`]:                https://github.com/hallvors/postcss-gradientfixer
[`postcss-image-inliner`]:                https://github.com/bezoerb/postcss-image-inliner
[`postcss-modular-scale`]:                https://github.com/kristoferjoseph/postcss-modular-scale
[`postcss-normalize-url`]:                https://github.com/ben-eb/postcss-normalize-url
[`postcss-reduce-idents`]:                https://github.com/ben-eb/postcss-reduce-idents
[`postcss-regexp-detect`]:                https://github.com/devex-web-frontend/postcss-regexp-detect
[`postcss-reverse-media`]:                https://github.com/MadLittleMods/postcss-reverse-media
[`postcss-russian-units`]:                https://github.com/Semigradsky/postcss-russian-units
[`postcss-short-spacing`]:                https://github.com/jonathantneal/postcss-short-spacing
[`postcss-simple-extend`]:                https://github.com/davidtheclark/postcss-simple-extend
[`postcss-speech-bubble`]:                https://github.com/archana-s/postcss-speech-bubble
[`postcss-aspect-ratio`]:                 https://github.com/arccoza/postcss-aspect-ratio
[`postcss-brand-colors`]:                 https://github.com/postcss/postcss-brand-colors
[`postcss-no-important`]: https://github.com/DUBANGARCIA/postcss-no-important
[`postcss-class-prefix`]:                 https://github.com/thompsongl/postcss-class-prefix
[`postcss-conditionals`]:                 https://github.com/andyjansson/postcss-conditionals
[`postcss-custom-media`]:                 https://github.com/postcss/postcss-custom-media
[`postcss-default-unit`]:                 https://github.com/antyakushev/postcss-default-unit
[`postcss-flexboxfixer`]:                 https://github.com/hallvors/postcss-flexboxfixer
[`postcss-font-awesome`]:                 https://github.com/dan-gamble/postcss-font-awesome
[`postcss-font-variant`]:                 https://github.com/postcss/postcss-font-variant
[`postcss-lazyimagecss`]:                 https://github.com/Jeff2Ma/postcss-lazyimagecss
[`postcss-lazysprite`]:                   https://github.com/Jeff2Ma/postcss-lazysprite
[`postcss-media-minmax`]:                 https://github.com/postcss/postcss-media-minmax
[`postcss-merge-idents`]:                 https://github.com/ben-eb/postcss-merge-idents
[`postcss-mq-keyframes`]:                 https://github.com/TCotton/postcss-mq-keyframes
[`postcss-nested-props`]:                 https://github.com/jedmao/postcss-nested-props
[`postcss-sassy-mixins`]:                 https://github.com/andyjansson/postcss-sassy-mixins
[`postcss-selector-not`]:                 https://github.com/postcss/postcss-selector-not
[`postcss-svg-fallback`]:                 https://github.com/justim/postcss-svg-fallback
[`postcss-cachebuster`]:                  https://github.com/glebmachine/postcss-cachebuster
[`postcss-color-alpha`]:                  https://github.com/avanes/postcss-color-alpha
[`postcss-color-scale`]:                  https://github.com/kristoferjoseph/postcss-color-scale
[`postcss-color-short`]:                  https://github.com/andrepolischuk/postcss-color-short
[`postcss-copy-assets`]:                  https://github.com/shutterstock/postcss-copy-assets
[`postcss-data-packer`]:                  https://github.com/Ser-Gen/postcss-data-packer
[`postcss-easysprites`]:                  https://github.com/glebmachine/postcss-easysprites
[`postcss-flexibility`]:                  https://github.com/7rulnik/postcss-flexibility
[`postcss-font-family`]:                  https://github.com/ben-eb/postcss-font-family
[`postcss-fontsize`]:                     https://github.com/richbachman/postcss-fontsize
[`postcss-grid-system`]:                  https://github.com/francoisromain/postcss-grid-system
[`postcss-input-style`]:                  https://github.com/seaneking/postcss-input-style
[`postcss-merge-rules`]:                  https://github.com/ben-eb/postcss-merge-rules
[`postcss-mq-optimize`]:                  https://github.com/panec/postcss-mq-optimize
[`postcss-nested-vars`]:                  https://github.com/jedmao/postcss-nested-vars
[`postcss-remove-root`]:                  https://github.com/cbracco/postcss-remove-root
[`postcss-simple-grid`]:                  https://github.com/admdh/postcss-simple-grid
[`postcss-simple-vars`]:                  https://github.com/postcss/postcss-simple-vars
[`postcss-strip-units`]:                  https://github.com/whitneyit/postcss-strip-units
[`postcss-style-guide`]:                  https://github.com/morishitter/postcss-style-guide
[`postcss-will-change`]:                  https://github.com/postcss/postcss-will-change
[`postcss-randomcolor`]:                  https://github.com/alanev/postcss-randomcolor
[`postcss-filter-tint`]:                  https://github.com/alexlibby/postcss-filter-tint
[`postcss-ase-colors`]:                   https://github.com/dfernandez79/postcss-ase-colors
[`postcss-bem-linter`]:                   https://github.com/postcss/postcss-bem-linter
[`postcss-camelcaser`]:                   https://github.com/GMchris/postcss-camelcaser
[`postcss-color-gray`]:                   https://github.com/postcss/postcss-color-gray
[`postcss-color-hexa`]:                   https://github.com/nicksheffield/postcss-color-hexa
[`postcss-colorblind`]:                   https://github.com/btholt/postcss-colorblind
[`postcss-compact-mq`]:                   https://github.com/rominmx/postcss-compact-mq
[`postcss-grid-fluid`]:                   https://github.com/francoisromain/postcss-grid-fluid
[`postcss-inline-rtl`]:                   https://github.com/jakob101/postcss-inline-rtl
[`postcss-inline-svg`]:                   https://github.com/TrySound/postcss-inline-svg
[`postcss-short-text`]:                   https://github.com/jonathantneal/postcss-short-text
[`postcss-animation`]:                    https://github.com/zhouwenbin/postcss-animation
[`postcss-autoreset`]:                    https://github.com/maximkoretskiy/postcss-autoreset
[`postcss-color-hcl`]:                    https://github.com/devgru/postcss-color-hcl
[`postcss-color-hwb`]:                    https://github.com/postcss/postcss-color-hwb
[`postcss-color-mix`]:                    https://github.com/iamstarkov/postcss-color-mix
[`postcss-color-yiq`]:                    https://github.com/ben-eb/postcss-color-yiq
[`postcss-filter-mq`]:                    https://github.com/simeydotme/postcss-filter-mq
[`postcss-font-pack`]:                    https://github.com/jedmao/postcss-font-pack
[`postcss-functions`]:                    https://github.com/andyjansson/postcss-functions
[`postcss-get-color`]:                    https://github.com/ismamz/postcss-get-color
[`postcss-image-set`]:                    https://github.com/alex499/postcss-image-set
[`postcss-instagram`]:                    https://github.com/azat-io/postcss-instagram
[`postcss-namespace`]:                    https://github.com/totora0155/postcss-namespace
[`postcss-placehold`]:                    https://github.com/awayken/postcss-placehold
[`postcss-reference`]:                    https://github.com/dehuszar/postcss-reference
[`postcss-typescale`]:                    https://github.com/francoisromain/postcss-typescale
[`postcss-write-svg`]:                    https://github.com/jonathantneal/postcss-write-svg
[`postcss-disabled`]:                     https://github.com/cocco3/postcss-disabled
[`postcss-clearfix`]:                     https://github.com/seaneking/postcss-clearfix
[`postcss-colormin`]:                     https://github.com/ben-eb/colormin
[`postcss-contrast`]:                     https://github.com/stephenway/postcss-contrast
[`postcss-cssstats`]:                     https://github.com/cssstats/postcss-cssstats
[`postcss-currency`]:                     https://github.com/talgautb/postcss-currency
[`postcss-fallback`]:                     https://github.com/MadLittleMods/postcss-fallback
[`postcss-fontpath`]:                     https://github.com/seaneking/postcss-fontpath
[`postcss-if-media`]:                     https://github.com/arccoza/postcss-if-media
[`postcss-imperial`]:                     https://github.com/cbas/postcss-imperial
[`postcss-position`]:                     https://github.com/seaneking/postcss-position
[`postcss-reporter`]:                     https://github.com/postcss/postcss-reporter
[`postcss-rgba-hex`]:                     https://github.com/XOP/postcss-rgba-hex
[`postcss-sanitize`]:                     https://github.com/eramdam/postcss-sanitize
[`postcss-spiffing`]:                     https://github.com/HashanP/postcss-spiffing
[`postcss-triangle`]:                     https://github.com/jedmao/postcss-triangle
[`postcss-trolling`]:                     https://github.com/juanfran/postcss-trolling
[`postcss-verthorz`]:                     https://github.com/davidhemphill/postcss-verthorz
[`pleeease-filters`]:                     https://github.com/iamvdo/pleeease-filters
[`postcss-easings`]:                      https://github.com/postcss/postcss-easings
[`postcss-flexbox`]:                      https://github.com/archana-s/postcss-flexbox
[`postcss-hexrgba`]:                      https://github.com/seaneking/postcss-hexrgba
[`postcss-initial`]:                      https://github.com/maximkoretskiy/postcss-initial
[`postcss-modules`]:                      https://github.com/outpunk/postcss-modules
[`postcss-opacity`]:                      https://github.com/iamvdo/postcss-opacity
[`postcss-pointer`]:                      https://github.com/markgoodyear/postcss-pointer
[`postcss-pxtorem`]:                      https://github.com/cuth/postcss-pxtorem
[`postcss-rgb-plz`]:                      https://github.com/himynameisdave/postcss-rgb-plz
[`postcss-map-get`]:                      https://github.com/GitScrum/postcss-map-get
[`postcss-scopify`]:                      https://github.com/pazams/postcss-scopify
[`postcss-sorting`]:                      https://github.com/hudochenkov/postcss-sorting
[`postcss-sprites`]:                      https://github.com/2createStudio/postcss-sprites
[`postcss-assets`]:                       https://github.com/borodean/postcss-assets
[`postcss-atroot`]:                       https://github.com/OEvgeny/postcss-atroot
[`postcss-border`]:                       https://github.com/andrepolischuk/postcss-border
[`postcss-button`]:                       https://github.com/francoisromain/postcss-button
[`postcss-center`]:                       https://github.com/jedmao/postcss-center
[`postcss-circle`]:                       https://github.com/jedmao/postcss-circle
[`postcss-esplit`]:                       https://github.com/vitaliyr/postcss-esplit
[`postcss-extend`]:                       https://github.com/travco/postcss-extend
[`postcss-fakeid`]:                       https://github.com/pathsofdesign/postcss-fakeid
[`postcss-filter`]:                       https://github.com/alanev/postcss-filter
[`postcss-hidden`]:                       https://github.com/lukelarsen/postcss-hidden
[`postcss-import`]:                       https://github.com/postcss/postcss-import
[`postcss-nested-import`]:                https://github.com/eriklharper/postcss-nested-import
[`postcss-layout`]:                       https://github.com/arccoza/postcss-layout
[`postcss-mixins`]:                       https://github.com/postcss/postcss-mixins
[`postcss-nested`]:                       https://github.com/postcss/postcss-nested
[`postcss-select`]:                       https://github.com/johnotander/postcss-select
[`postcss-urlrev`]:                       https://github.com/yuezk/postcss-urlrev
[`postcss-zindex`]:                       https://github.com/ben-eb/postcss-zindex
[`list-selectors`]:                       https://github.com/davidtheclark/list-selectors
[`mq4-hover-shim`]:                       https://github.com/twbs/mq4-hover-shim
[`postcss-alias`]:                        https://github.com/seaneking/postcss-alias
[`postcss-apply`]:                        https://github.com/pascalduez/postcss-apply
[`postcss-focus`]:                        https://github.com/postcss/postcss-focus
[`postcss-match`]:                        https://github.com/rtsao/postcss-match
[`postcss-scrib`]:                        https://github.com/sneakertack/postcss-scrib
[`css2modernizr`]:                        https://github.com/vovanbo/css2modernizr
[`font-magician`]:                        https://github.com/jonathantneal/postcss-font-magician
[`immutable-css`]:                        https://github.com/johnotander/immutable-css
[`perfectionist`]:                        https://github.com/ben-eb/perfectionist
[`postcss-uncss`]:                        https://github.com/RyanZim/postcss-uncss
[`postcss-click`]:                        https://github.com/ismamz/postcss-click
[`postcss-at2x`]:                         https://github.com/simonsmith/postcss-at2x
[`postcss-calc`]:                         https://github.com/postcss/postcss-calc
[`postcss-crip`]:                         https://github.com/johnie/postcss-crip
[`postcss-each`]:                         https://github.com/outpunk/postcss-each
[`postcss-epub`]:                         https://github.com/Rycochet/postcss-epub
[`postcss-grid`]:                         https://github.com/andyjansson/postcss-grid
[`postcss-host`]:                         https://github.com/vitkarpov/postcss-host
[`postcss-maze`]:                         https://github.com/cathydutton/postcss-maze
[`postcss-neat`]:                         https://github.com/jo-asakura/postcss-neat
[`postcss-size`]:                         https://github.com/postcss/postcss-size
[`postcss-size-advanced`]:                https://github.com/jhpratt/postcss-size-advanced
[`postcss-svgo`]:                         https://github.com/ben-eb/postcss-svgo
[`postcss-unmq`]:                         https://github.com/jonathantneal/postcss-unmq
[`postcss-vmin`]:                         https://github.com/iamvdo/postcss-vmin
[`postcss-nope`]:                         https://github.com/dariopog/postcss-nope
[`autoprefixer`]:                         https://github.com/postcss/autoprefixer
[`css-mqpacker`]:                         https://github.com/hail2u/node-css-mqpacker
[`postcss-bem`]:                          https://github.com/ileri/postcss-bem
[`postcss-for`]:                          https://github.com/antyakushev/postcss-for
[`postcss-ie8`]:                          https://github.com/4wdmedia/postcss-ie8
[`postcss-map`]:                          https://github.com/pascalduez/postcss-map
[`postcss-raw`]:                          https://github.com/MadLittleMods/postcss-raw
[`postcss-svg`]:                          https://github.com/Pavliko/postcss-svg
[`postcss-url`]:                          https://github.com/postcss/postcss-url
[`postcss-ref`]:                          https://github.com/morishitter/postcss-ref
[`colorguard`]:                           https://github.com/SlexAxton/css-colorguard
[`css-byebye`]:                           https://github.com/AoDev/css-byebye
[`stylehacks`]:                           https://github.com/ben-eb/stylehacks
[`cssgrace`]:                             https://github.com/cssdream/cssgrace
[`stylefmt`]:                             https://github.com/morishitter/stylefmt
[`csstyle`]:                              https://github.com/geddski/csstyle
[`webpcss`]:                              https://github.com/lexich/webpcss
[`doiuse`]:                               https://github.com/anandthakker/doiuse
[`pixrem`]:                               https://github.com/robwierzbowski/node-pixrem
[`postcss-fixie`]:                        https://github.com/tivac/fixie
[`rtlcss`]:                               https://github.com/MohammadYounes/rtlcss
[`short`]:                                https://github.com/jonathantneal/postcss-short
[`lost`]:                                 https://github.com/corysimmons/lost
[`postcss-text-remove-gap`]:              https://github.com/m18ru/postcss-text-remove-gap
[`postcss-closest`]:                      https://github.com/m18ru/postcss-closest
[`postcss-grid-kiss`]:                    https://github.com/sylvainpolletvillard/postcss-grid-kiss
[`postcss-unprefix`]:                     https://github.com/gucong3000/postcss-unprefix
[`postcss-pie`]:                          https://github.com/gucong3000/postcss-pie
[`postcss-color-hsl`]:                    https://github.com/dmarchena/postcss-color-hsl
[`postcss-color-rgb`]:                    https://github.com/dmarchena/postcss-color-rgb
[`postcss-parent-selector`]:              https://github.com/domwashburn/postcss-parent-selector
[`postcss-font-family-system-ui`]:        https://github.com/JLHwung/postcss-font-family-system-ui
[`postcss-percentage`]:                   https://github.com/creeperyang/postcss-percentage
[`postcss-start-to-end`]:                 https://github.com/sandrina-p/postcss-start-to-end
[`postcss-autocorrect`]:                  https://github.com/DimitrisNL/postcss-autocorrect
[`postcss-state-selector`]:               https://github.com/binjospookie/postcss-state-selector
[`postcss-html-filter`]:                  https://github.com/mapbox/postcss-html-filter
[`postcss-hash`]:                         https://github.com/dacodekid/postcss-hash
[`postcss-light-text`]:                   https://github.com/jdsteinbach/postcss-light-text
[`postcss-bom`]:                          https://github.com/dichuvichkin/postcss-bom
[`postcss-eol`]:                          https://github.com/dichuvichkin/postcss-eol
[`postcss-node-modules-replacer`]:        https://github.com/dichuvichkin/postcss-node-modules-replacer
[`postcss-mq-last`]:                      https://github.com/JGJP/postcss-mq-last
[`postcss-bem-to-js`]:                    https://github.com/WebSeed/postcss-bem-to-js
[`postcss-foft-classes`]:                 https://github.com/zachleat/postcss-foft-classes
[`postcss-inline-media`]:                 https://github.com/dimitrinicolas/postcss-inline-media
[`postcss-nested-ancestors`]:             https://github.com/toomuchdesign/postcss-nested-ancestors
[`postcss-subgrid`]:                      https://github.com/seaneking/postcss-subgrid
[`postcss-join-transitions`]:             https://github.com/JGJP/postcss-join-transitions
[`postcss-font-display`]:                 https://github.com/dkrnl/postcss-font-display
[`postcss-glitch`]:                       https://github.com/crftd/postcss-glitch
[`postcss-class-name-shortener`]:         https://github.com/mbrandau/postcss-class-name-shortener
[`postcss-plugin-namespace`]:             https://github.com/ymrdf/postcss-plugin-namespace
[`postcss-classes-to-mixins`]:            https://github.com/nrkno/postcss-classes-to-mixins  
