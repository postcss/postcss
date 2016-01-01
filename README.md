# PostCSS [![Travis Build Status][travis-img]][travis] [![AppVeyor Build Status][appveyor-img]][appveyor] [![Gitter][chat-img]][chat]

<img align="right" width="95" height="95"
     title="Philosopher’s stone, logo of PostCSS"
     src="http://postcss.github.io/postcss/logo.svg">

[appveyor-img]: https://img.shields.io/appveyor/ci/ai/postcss.svg?label=windows
[travis-img]:   https://img.shields.io/travis/postcss/postcss.svg?label=unix
[chat-img]:     https://img.shields.io/badge/Gitter-Join_the_PostCSS_chat-brightgreen.svg
[appveyor]:     https://ci.appveyor.com/project/ai/postcss
[travis]:       https://travis-ci.org/postcss/postcss
[chat]:         https://gitter.im/postcss/postcss

PostCSS is a tool for transforming styles with JS plugins.
These plugins can lint your CSS, support variables and mixins,
transpile future CSS syntax, inline images, and more.

PostCSS is used by industry leaders including Google, Twitter, Alibaba,
and Shopify. The [Autoprefixer] PostCSS plugin is one of the most popular
CSS processors.

Twitter account:      [@postcss](https://twitter.com/postcss).
VK.com page:          [postcss](https://vk.com/postcss).
Support / Discussion: [Gitter](https://gitter.im/postcss/postcss).

[Autoprefixer]: https://github.com/postcss/autoprefixer

<a href="https://evilmartians.com/?utm_source=postcss">
<img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg" alt="Sponsored by Evil Martians" width="236" height="54">
</a>

## Plugins

Currently, PostCSS has more than 200 plugins. Here are our favorite plugins
which best demonstrate PostCSS’ power. You can find all of the plugins in the
[plugins list] or in the [searchable catalog].

If you have any new ideas, [PostCSS plugin development] is really easy.

[searchable catalog]: http://postcss.parts
[plugins list]:       https://github.com/postcss/postcss/blob/master/docs/plugins.md

### End of Global CSS

* [`postcss-use`] to explicitly set PostCSS plugins in CSS and execute them
  only for the current file.
* [`postcss-modules`] or [`react-css-modules`] automatically isolates
  selectors in components.
* [`postcss-autoreset`] uses local reset in component, instead of global one.
* [`postcss-initial`] adds `all: initial` support to reset all inherit styles.
* [`cq-prolyfill`] adds media queries for component size
  or parent background.

### Future CSS

* [`autoprefixer`] adds vendor prefixes, using data from Can I Use.
* [`cssnext`] allows you to use future CSS features today.

### Syntax sugar

* [`precss`] contains plugins for Sass-like features like nesting or mixins.
* [`short`] adds and extends numerous shorthand properties.

### Images and Fonts

* [`postcss-assets`] inserts image dimensions and inlines files.
* [`postcss-sprites`] generates image sprites.
* [`font-magician`] generates all the `@font-face` rules needed in CSS.
* [`postcss-inline-svg`] allows to inline SVG and customize its styles.
* [`postcss-write-svg`] allows to write simple SVG directly in CSS.

### Linters

* [`stylelint`] is a modular linter for CSS.
* [`doiuse`] lints CSS for browser support, using data from Can I Use.
* [`colorguard`] helps maintain a consistent color palette.

### Other

* [`lost`] is feature-rich `calc()` grid system by Jeet author.
* [`cssnano`] is a modular CSS minifier.
* [`rtlcss`] mirrors styles for right-to-left locales.

[PostCSS plugin development]: https://github.com/postcss/postcss/blob/master/docs/writing-a-plugin.md
[`postcss-inline-svg`]:       https://github.com/TrySound/postcss-inline-svg
[`react-css-modules`]:        https://github.com/gajus/react-css-modules
[`postcss-autoreset`]:        https://github.com/maximkoretskiy/postcss-autoreset
[`postcss-write-svg`]:        https://github.com/jonathantneal/postcss-write-svg
[`postcss-initial`]:          https://github.com/maximkoretskiy/postcss-initial
[`postcss-sprites`]:          https://github.com/2createStudio/postcss-sprites
[`postcss-modules`]:          https://github.com/outpunk/postcss-modules
[`postcss-assets`]:           https://github.com/borodean/postcss-assets
[`font-magician`]:            https://github.com/jonathantneal/postcss-font-magician
[`autoprefixer`]:             https://github.com/postcss/autoprefixer
[`cq-prolyfill`]:             https://github.com/ausi/cq-prolyfill
[`postcss-use`]:              https://github.com/postcss/postcss-use
[`css-modules`]:              https://github.com/css-modules/css-modules
[`colorguard`]:               https://github.com/SlexAxton/css-colorguard
[`stylelint`]:                https://github.com/stylelint/stylelint
[`cssnext`]:                  http://cssnext.io/
[`cssnano`]:                  http://cssnano.co/
[`precss`]:                   https://github.com/jonathantneal/precss
[`doiuse`]:                   https://github.com/anandthakker/doiuse
[`rtlcss`]:                   https://github.com/MohammadYounes/rtlcss
[`short`]:                    https://github.com/jonathantneal/postcss-short
[`lost`]:                     https://github.com/peterramsing/lost

## Syntaxes

PostCSS can transform styles in any syntax, not just CSS.

* [`postcss-scss`] to work with SCSS *(but does not compile SCSS to CSS)*.
* [`postcss-js`] to write styles in JS or transform React Inline Styles,
  Radium or JSS.
* [`postcss-safe-parser`] finds and fixes CSS syntax errors.
* [`midas`] converts a CSS string to highlighted HTML.

[`postcss-safe-parser`]: https://github.com/postcss/postcss-safe-parser
[`postcss-scss`]:        https://github.com/postcss/postcss-scss
[`postcss-js`]:          https://github.com/postcss/postcss-js
[`midas`]:               https://github.com/ben-eb/midas

## Articles

* [Some things you may think about PostCSS… and you might be wrong](http://julian.io/some-things-you-may-think-about-postcss-and-you-might-be-wrong/)
* [What PostCSS Really Is; What It Really Does](http://davidtheclark.com/its-time-for-everyone-to-learn-about-postcss/)
* [PostCSS Guides](http://webdesign.tutsplus.com/series/postcss-deep-dive--cms-889)

## Usage

You can start using PostCSS in just two steps:

1. Find and add PostCSS extensions for your build tool.
2. [Select plugins] and add them to your PostCSS process.

[Select plugins]: http://postcss.parts

### Gulp

Use [`gulp-postcss`] and [`gulp-sourcemaps`].

```js
gulp.task('css', function () {
    var postcss    = require('gulp-postcss');
    var sourcemaps = require('gulp-sourcemaps');

    return gulp.src('src/**/*.css')
        .pipe( sourcemaps.init() )
        .pipe( postcss([ require('autoprefixer'), require('precss') ]) )
        .pipe( sourcemaps.write('.') )
        .pipe( gulp.dest('build/') );
});
```

[`gulp-sourcemaps`]: https://github.com/floridoo/gulp-sourcemaps
[`gulp-postcss`]:    https://github.com/postcss/gulp-postcss

### Webpack

Use [`postcss-loader`]:

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
    postcss: function () {
        return [require('autoprefixer'), require('precss')];
    }
}
```

[`postcss-loader`]: https://github.com/postcss/postcss-loader

### CSS-in-JS

For React Inline Styles, JSS, Radium and other CSS-in-JS you can use
[`postcss-js`] to transform one style object to other.

```js
var postcss  = require('postcss-js');
var prefixer = postcss.sync([ require('autoprefixer') ]);

prefixer({ display: 'flex' }); //=> { display: ['-webkit-box', '-webkit-flex', '-ms-flexbox', 'flex'] }
```

[`postcss-js`]: https://github.com/postcss/postcss-js

### Runners

* **CLI**: [`postcss-cli`](https://github.com/code42day/postcss-cli)
* **Grunt**: [`grunt-postcss`](https://github.com/nDmitry/grunt-postcss)
* **HTML**: [`posthtml-postcss`](https://github.com/posthtml/posthtml-postcss)
* **Stylus**: [`poststylus`](https://github.com/seaneking/poststylus)
* **Rollup**: [`rollup-plugin-postcss`](https://github.com/egoist/rollup-plugin-postcss)
* **Brunch**: [`postcss-brunch`](https://github.com/iamvdo/postcss-brunch)
* **Broccoli**: [`broccoli-postcss`](https://github.com/jeffjewiss/broccoli-postcss)
* **Meteor**: [`postcss`](https://atmospherejs.com/juliancwirko/postcss)
* **ENB**: [`enb-postcss`](https://github.com/awinogradov/enb-postcss)
* **Fly**: [`fly-postcss`](https://github.com/postcss/fly-postcss)
* **Connect/Express**: [`postcss-middleware`](https://github.com/jedmao/postcss-middleware)

### JS API

For other environments, you can use the [CLI tool] or the JS API:

```js
var postcss = require('postcss');
postcss([ require('autoprefixer'), require('cssnano') ])
    .process(css, { from: 'src/app.css', to: 'app.css' })
    .then(function (result) {
        fs.writeFileSync('app.css', result.css);
        if ( result.map ) fs.writeFileSync('app.css.map', result.map);
    });
```

Read the [PostCSS API documentation] for more details about the JS API.

All PostCSS JS API users should pass [PostCSS Runner Guidelines].

[PostCSS Runner Guidelines]: https://github.com/postcss/postcss/blob/master/docs/guidelines/runner.md
[PostCSS API documentation]: https://github.com/postcss/postcss/blob/master/docs/api.md
[CLI tool]:                  https://github.com/code42day/postcss-cli

### Options

Most PostCSS runners accept two parameters:

* An array of plugins.
* An object of options.

Common options:

* `syntax`: object with syntax parser and stringifier.
* `parser`: other syntax parser (for example, [SCSS]).
* `stringifier`: other syntax output generator (for example, [Midas]).
* `map`: [source map options].
* `from`: input file name (most runners set it automatically).
* `to`: output file name (most runners set it automatically).

[source map options]: https://github.com/postcss/postcss/blob/master/docs/source-maps.md
[Midas]:              https://github.com/ben-eb/midas
[SCSS]:               https://github.com/postcss/postcss-scss

### Node.js 0.10 and the Promise API

If you want to run PostCSS on node.js 0.10, add the [Promise polyfill]:

```js
require('es6-promise').polyfill();
var postcss = require('postcss');
```

[Promise polyfill]: https://github.com/jakearchibald/es6-promise
