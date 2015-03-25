# PostCSS Runner Guidelines

PostCSS runner is a tool, that takes plugins list from user and process
user’s CSS through this plugins. For example, [`postcss-cli`]
or [`gulp-postcss`]. This rules are mandatory for any PostCSS runners.

This rules are not mandatory, but highly recommended for one-plugin tools
(like [`gulp-autoprefixer`]).

See also ClojureWerkz’s [open source project recommendations].

[open source project recommendations]:  http://blog.clojurewerkz.org/blog/2013/04/20/how-to-make-your-open-source-project-really-awesome/
[`gulp-autoprefixer`]: https://github.com/sindresorhus/gulp-autoprefixer
[`gulp-postcss`]:      https://github.com/w0rm/gulp-postcss
[`postcss-cli`]:       https://github.com/code42day/postcss-cli

## 1. API

### 1.1. Accept functions in plugin parameters

Some plugins accept function in parameters. If your runner has config file,
it should be a Node.js module, because JSON format doesn’t support functions.

```js
module.exports = [
    require('postcss-assets')({
        cachebuster: function (file) {
            return fs.statSync(file).mtime.getTime().toString(16);
        }
    })
];
```

## 2. Processing

### 2.1. Set `from` and `to` processing options

PostCSS needs `from` and `to` options to generate correct source map
and display better syntax errors.

If your tool doesn’t save file to disk (as Gulp pipe for example),
you should set same `from` and `to` options.

```js
processor.process({ from: file.path, to: file.path });
```

### 2.2. Use only asynchronous API

PostCSS has synchronous API only for debug. Synchronous API is slower
and can’t work with asynchronous plugins.

```js
processor.process(opts).then(function (result) {
    // processing is finished
});
```

### 2.3. Use only public PostCSS API

Public API is described in [`API.md`]. Any other methods and properties
are private and can be changed in any minor release.

[`API.md`]: https://github.com/postcss/postcss/blob/master/API.md

## 3. Output

### 3.1. Don’t show JS stack for `CssSyntaxError`

JS stack trace is mostly irrelevant for CSS syntax errors.
PostCSS runner can be used by CSS developer, who didn’t know JS.

```js
var CssSyntaxError = require('postcss/lib/css-syntax-error');

processor.process(opts).catch(function (error) {
    if ( error instanceof CssSyntaxError ) {
        process.stderr.write(error.message + error.showSourceCode());
    } else {
        throw error;
    }
});
```

### 3.2. Display `result.warnings()` content

Runner must output warnings from `result.warnings()`.

```js
result.warnings().forEach(function (warn) {
    process.stderr.write(warn.toString());
});
```

### 3.3. Save map from `result.map` to separated file

By default, PostCSS will inline source map to CSS in `result.css`.
But you should be ready for separated file with map if user will ask it.

```js
if ( result.map ) {
    fs.writeFile(opts.to + '.map', result.map.toString());
}
```

## 4. Documentation

### 4.1. Use English in documentation

Project description, `README.md` should be in English. Do not afraid your
English skills. Open source community will fix your errors.

Of course you can have documentation on other languages. Just put it in file
like `README.ja.md`.

### 4.2. Have Changelog

You should describe changes of all releases in a separate file like
`ChangeLog.md`, `History.md`, etc, or with [GitHub Releases].

[Keep A Changelog] contains advices to write good Changelog.

[Keep A Changelog]: http://keepachangelog.com/
[GitHub Releases]:  https://help.github.com/articles/creating-releases/

### 4.3. `postcssrunner` keyword in `package.json`

Special keyword will be useful for feedback about PostCSS ecosystem.
This rule is not mandatory for non-npm packages, but it is still recommended
if package format has keywords field.
