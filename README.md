# PostCSS [![Build Status](https://travis-ci.org/postcss/postcss.svg)](https://travis-ci.org/postcss/postcss) [![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/postcss/postcss?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<img align="right" width="95" height="95" src="http://postcss.github.io/postcss/logo.svg" title="Philosopher’s stone, logo of PostCSS">

PostCSS is a tool for transforming CSS with JS plugins. These plugins can add vendor
prefixes, polyfill CSS 4 features, inline images, enable variables and mixins, and more.

PostCSS can do the same work as "preprocessors" like Sass, Less, and Stylus. But
PostCSS is modular, 4—40x faster, and much more powerful.

The most popular PostCSS plugin, [Autoprefixer],
is used by Google, Twitter, Alibaba, Shopify and many, many other organizations
and individuals around the world.

PostCSS itself is very small and focused, consisting of a CSS parser, a CSS node
tree API, a source map generator, and a node tree stringifier -- and that's it.
All of the stylesheet features it can enable are encapsulated in modular plugins.
And these plugins are themselves small and focused, plain JS functions, receiving
a CSS node tree at one end, applying transformations to it, and then returning
a modified tree that can be used by other plugins or written to a file.

Each individual plugin enables a certain transformation, and by using various plugins
together you can tailor an ideal CSS workflow. If you want only a few special features
-- future-friendly [postcss-custom-properties] and automatic vendor prefixes with
[Autoprefixer], for example -- you can do just that.
Or, if you like the power provided by preprocessors like Sass,
you could use [Autoprefixer], [cssnext], [CSS Grace], [postcss-nested], [postcss-mixins], and [postcss-easings] to write CSS like this:

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

## How PostCSS differs from Preprocessors (Sass, Less, etc.)

- **PostCSS enables modular plugins instead of offering special programming language.**
This key difference results in several advantages:
  - PostCSS allows plugin authors to create whatever features they can imagine,
  while empowering PostCSS users to add only those features that they want to
  their workflow. Preprocessors, in contrast, are all-or-nothing.
  - Modularity lowers the barriers to entry, enabling more people to create plugins
  that fit their own needs and styles, and to help maintain the plugins they use.
  Preprocessors have gigantic codebases that encourage consumption more than contribution.
  - All preprocessor features must be built in the preprocessor's special language.
  Adding new features is very difficult for developers, so these languages develop slowly.
  In contrast, PostCSS plugins are simple, plain JS functions that transform a CSS node tree.
  Developers can have fun creating new features, giving PostCSS users a wider selection to
  choose from.
  - PostCSS plugins do not have to follow the same syntax. Some plugins, like
  [postcss-custom-properties], [postcss-media-minmax], and [postcss-calc], enable 
  real CSS syntax from present and future specs, generating cross-browser-compatible output.
  Other plugins, like [postcss-mixins] and [postcss-simple-extend], can add new features
  to stylesheets. Preprocessors do not have this flexibility.
  - PostCSS plugins can progress at different rates, and plugin users can specify exactly
  which version of each plugin they want to use. Plugins are just npm packages.
  With preprocessors, you have to buy-in to all updates at once, and individual features
  cannot change independently.
- **PostCSS is 4-40x faster than preprocessors.**
- **PostCSS is more powerful than preprocessors.** For example, it would be impossible
to build [Autoprefixer] into a preprocessor. PostCSS enables plugin authors to harness
all the capabilities of JS.

## Features

### Modularity

Without any plugins, PostCSS will parse your CSS and stringify it back to you without
changing a single byte. All the features to improve your styleseheets are made possible 
by PostCSS plugins, which are nothing more than small JS functions.
By selectively applying plugins, PostCSS users can can opt-in to the specific features
that they think will enhance their workflow.

Variables provide a nice example. Right now, there are two different plugins that
enable users to include variables in their stylesheets. [postcss-simple-vars] has a
Sass-like syntax:

```css
a {
    color: $link-color;
}
```

[postcss-custom-properties] implements the syntax of the [W3C CSS Custom Properties] draft:

```css
a {
    color: var(--link-color);
}
```

Using PostCSS, you can choose which variables syntax you want to use -- or even take both.

Additionally, since PostCSS plugins are simple npm packages, anybody can contribute easily.
There are no barriers to writing your own plugins or contributing ideas and bug fixes to the
plugins that you use.

[W3C CSS Custom Properties]: http://www.w3.org/TR/css-variables/
[postcss-custom-properties]: https://github.com/postcss/postcss-custom-properties
[postcss-simple-vars]:       https://github.com/postcss/postcss-simple-vars

### Perfomance

PostCSS is one of the fastest CSS parsers written in JS. (Only [CSSOM] is
faster, and only because it is not as accurate.) It parses the CSS and applies
plugin transformations faster than any CSS processor out there.

If you use Ruby Sass now, PostCSS could significantly improve your development process:
*PostCSS is processing 40 times faster than Ruby Sass compilation.*
And even if you use the entire [cssnext] plugin pack, PostCSS (written in JS) is still
*4 times faster than [libsass]* (written on C++).

[cssnext]: https://github.com/cssnext/cssnext
[libsass]: https://github.com/sass/libsass
[CSSOM]:   https://github.com/NV/CSSOM

### Powerful Tools

PostCSS plugins can read and rebuild an entire CSS node tree.
As a result, PostCSS offers many powerful tools that would be impossible
to build into preprocessors.

PostCSS-powered tools can do much more than transform special syntax into browser-friendly
CSS. PostCSS plugin authors can build linters (like [doiuse] and [BEM Linter]),
code review tools (like [list-selectors]), and minifiers (like [CSSWring]).
With the [postcss-data-packer] plugin, you can create a cacheable "sprite"
by moving all `data:uri` values to separate file.

One unique example of PostCSS power is [RTLCSS]. As you know, some languages, such
as Arabic and Hebrew, write right-to-left (RTL), as opposed to the more widespread left-to-right
convention. Because a language's directionality affects its readers' perspective,
an international site's layout needs to change to accommodate RTL users, not just its text.
(Check out [Arabic Wikipedia] as an example.)
The [RTLCSS] plugin effectively "mirrors" your stylesheet by swapping `left` and `right`,
changing the value order in `margin` shorthands, and more.

[postcss-data-packer]: https://github.com/Ser-Gen/postcss-data-packer
[Arabic Wikipedia]:    https://ar.wikipedia.org/wiki/%D9%84%D8%BA%D8%A9_%D8%B9%D8%B1%D8%A8%D9%8A%D8%A9
[list-selectors]:      https://github.com/davidtheclark/list-selectors
[BEM Linter]:          https://github.com/necolas/postcss-bem-linter
[CSSWring]:            https://github.com/hail2u/node-csswring
[doiuse]:              https://github.com/anandthakker/doiuse
[RTLCSS]:              https://github.com/MohammadYounes/rtlcss

## Quick Start

1. Implement PostCSS with your build tool of choice. See the PostCSS [Grunt], [Gulp] and [webpack]
plugins more detailed instructions.
2. Select plugins from list below and add them to your PostCSS process.
3. Make awesome products.

[webpack]: https://github.com/postcss/postcss-loader
[Grunt]:   https://github.com/nDmitry/grunt-postcss
[Gulp]:    https://github.com/w0rm/gulp-postcss

## Plugins Packs

* [cssnext] contains plugins that polyfill CSS 4 features.
* [ACSS] (Annotations-based CSS) contains plugins that transform your CSS
according to special annotation comments.

[cssnext]:  https://github.com/putaindecode/cssnext
[ACSS]:     https://github.com/morishitter/acss

## Plugins

* [Autoprefixer] adds vendor prefixes, using data from Can I Use.
* [cssgrace] provides helpers and CSS 3 polyfills for IE and other old browsers.
* [csswring] is a CSS minifier.
* [rtlcss] mirrors styles for right-to-left locales.
* [pixrem] is a `rem` unit polyfill.
* [css-mqpacker] joins matching CSS media queries into a single rule.
* [postcss-assets] isolates stylesheets from environmental changes, gets image sizes and inlines files.
* [css2modernizr] analyzes your CSS and output only used Modernizr’s settings.
* [postcss-bem-linter] lints CSS for conformance to SUIT CSS methodology.
* [pleeease-filters] converts WebKit filters to SVG filters, for cross-browser compatibility.
* [postcss-custom-selectors] adds custom aliases for selectors using syntax from the
W3C CSS Extensions draft.
* [doiuse] lints CSS for browser support, using data from Can I Use.
* [webpcss] adds URLs for WebP images, so they can be used by browsers that support WebP.
* [postcss-import] inlines the stylesheets referred to by `@import` rules.
* [postcss-nested] unwraps nested rules, as Sass does.
* [postcss-media-minmax] adds `<=` and `=>` statements to CSS media queries -- syntax from
the Media Queries 4 draft.
* [postcss-mixins] enables mixins more powerful than Sass's, written within stylesheets or in JS.
* [postcss-easings] replaces easing names from easings.net with `cubic-bezier()` functions.
* [postcss-url] rebases or inlines `url()`.
* [postcss-epub] adds the `-epub-` prefix to relevant properties.
* [postcss-custom-properties] is a polyfill for the W3C CSS variables spec.
* [mq4-hover-shim] is a shim for the `@media (hover)` feature from the Media Queries 4 draft.
* [postcss-color-palette] transforms CSS 2 color keywords to a custom palette.
* [postcss-custom-media] adds custom aliases for media queries according to syntax from
the Media Queries 4 draft.
* [css-byebye] removes the CSS rules that you don't want.
* [postcss-simple-vars] adds support for Sass-style variables.
* [postcss-data-packer] moves embedded data out of the stylesheet and into a separate file.
* [postcss-color-gray] adds the `gray()` function from the Color Module 4 draft.
* [postcss-brand-colors] inserts company brand colors in the `brand-colors` module.
* [list-selectors] lists and categorizes the selectors used in your CSS, for code review and analysis.
* [postcss-calc] reduces `calc()` to values (when expressions involve the same units).
* [postcss-font-variant] converts human-readable `font-variant` properties to more widely supported CSS.
* [postcss-simple-extend] adds `@extend` support for silent classes.
* [postcss-size] adds a `size` shortcut that sets width and height with one declaration.
* [postcss-color-hex] transforms `rgb()` and `rgba()` to hex.
* [postcss-host] makes the Shadow DOM's `:host` selector work properly with pseudo-classes.
* [postcss-color-rebeccapurple] is a `rebeccapurple` color polyfill.
* [postcss-color-function] adds functions to transform colors from W3C syntax.
* [postcss-color-hex-alpha] adds `#rrggbbaa` and `#rgba` notation support from the Color Module 4 draft.
* [postcss-color-hwb] transforms `hwb()` from the Color Module 4 draft to widely compatible `rgb()`.
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

Read the [postcss function], [processor], and [Result] API docs for more details.

[postcss function]: https://github.com/postcss/postcss/blob/master/API.md#postcss-function
[processor]:        https://github.com/postcss/postcss/blob/master/API.md#postcss-class
[Result]:           https://github.com/postcss/postcss/blob/master/API.md#result-class

### Source Maps

Using [source maps], a browser’s development tools can indicate the
original position of your rules, before any transformations were applied to your stylesheets.
For example, an inspector will show the position of a rule in the original Sass file, even if
that file was compiled to CSS, concatenated, and minified.

To ensure a correct source map is generated, every CSS processing step should
update the map generated by the previous step. For example, a Sass compiler
will generate the first map, a concatenation tool should update the Sass step’s
map, and a minifier should update the map generated by the concatenation tool.

There are two ways to store a source map:

* You can place it in a separate file which contains a special annotation
  comment pointing to another file:

  ```css
 a { }
 /*# sourceMappingURL=main.out.css.map */
  ```
* Or you can inline a Base64-encoded source map within a CSS comment:

  ```css
 a { }
 /*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5taW4uY3NzIiwic291cmNlcyI6WyJtYWluLmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFLIn0= */
  ```

PostCSS has great source map support. To ensure that you generate an accurate
source map, you must indicate the input and output CSS files
paths (using the options `from` and `to` respectively).

To generate a new source map with the default options, simply set `map: true`.
This will generate an inline source map that contains source content.
If you don’t want the map inlined, you can use set `map.inline: false`.

```js
var result = processor.process(css, {
    from: 'main.css',
    to:   'main.out.css'
    map: { inline: false },
});

result.map //=> '{"version":3,"file":"main.out.css","sources":["main.css"],"names":[],"mappings":"AAAA,KAAI"}'
```

If PostCSS is handling CSS and finds source maps from a previous transformation,
it will automatically update that source map with the same options.

```js
// main.sass.css has an annotation comment with a link to main.sass.css.map
var result = minifier.process(css, { from: 'main.sass.css', to: 'main.min.css' });
result.map //=> Source map from main.sass to main.min.css
```

If you want more control over source map generation, you can define the `map`
option as an object with the following parameters:

* `inline` (boolean): indicates that the source map should be embedded in the CSS
  as a base64-encoded comment. By default it is `true`. But if all previous maps
  are in a separate file, not inline, PostCSS will not inline the map even if you
  do not change set this option.

  If you inline a source map, the `result.map` property will be empty, as the source map
  will be contained within the text of `result.css`.

* `prev` (string, object, or boolean): source map content from a previous processing
  step (for example, Sass compilation). PostCSS will try to read the previous
  source map automatically (based on comment within the source CSS), but you can also
  identify it manually. If desired, you can omit the previous map with `prev: false`.

  This is a source map option which can be passed to `postcss.parse(css, opts)`.
  Other options can be passed to the `toResult(opts)` or `process(css, opts)`
  methods.

* `sourcesContent` (boolean): indicates that PostCSS should set the origin content
  (for example, Sass source) of the source map. By default it is `true`.
  But if all previous maps do not contain sources content, however,
  PostCSS will also leave it out.

* `annotation` (boolean or string): indicates that PostCSS should add annotation
  comments to the CSS. By default, PostCSS will always add a comment with a path
  to the source map. But if the previous CSS does not have any annotation
  comment, PostCSS will omit it, too.

  By default, PostCSS presumes that you want to save the source map as
  `opts.to + '.map'` and will use this path in the annotation comment.
  But you can set another path by providing a string value for the `annotation`
  option.

  If you have set `inline: true`, annotation cannot be disabled.

[source maps]: http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/

### Safe Mode

If you provide a `safe: true` option to the `process` or `parse` methods,
PostCSS will try to correct any syntax errors that it finds in the CSS.

```js
postcss.parse('a {');                 // will throw "Unclosed block"
postcss.parse('a {', { safe: true }); // will return CSS root for a {}
```

This is useful for legacy code filled with hacks. Another use case
is for interactive tools with live input -- for example,
the [Autoprefixer demo](http://jsfiddle.net/simevidas/udyTs/show/light/).

## How to Develop PostCSS Plugin

* [PostCSS API](https://github.com/postcss/postcss/blob/master/API.md)
* [Plugin Boilerplate](https://github.com/postcss/postcss-plugin-boilerplate)
