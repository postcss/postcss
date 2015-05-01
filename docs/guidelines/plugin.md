# PostCSS Plugin Guidelines

PostCSS plugin is a function that receives and transforms a CSS AST
from PostCSS parser. These rules are mandatory for all PostCSS plugins.

See also [ClojureWerkz’s recommendations] for open source projects.

[ClojureWerkz’s recommendations]:  http://blog.clojurewerkz.org/blog/2013/04/20/how-to-make-your-open-source-project-really-awesome/

## 1. API

### 1.1 Clear name with `postcss-` prefix

Plugin’s purpose should be clear just by its name.
If you wrote a transpiler for CSS 4 Custom Media, `postcss-custom-media`
is a good name. If you wrote a plugin to support mixin,
use `postcss-mixins` as name.

Prefix `postcss-` will show, that plugin is part of PostCSS ecosystem.

This rule is not mandatory for plugins promoted as separated tool,
not like a part of PostCSS ecosystem. Like [cssnext] or [Autoprefixer].

[Autoprefixer]: https://github.com/postcss/autoprefixer
[cssnext]:      https://cssnext.github.io/

### 1.2. Do one thing, and do it well

Do not create multitool plugins. Few small one-purpose plugins with
a plugins pack will be a better solution.

For example, [cssnext] contains many small plugins for each W3C specification.
Or [cssnano] contains a plugin for each optimization.

[cssnext]: https://cssnext.github.io/
[cssnano]: https://github.com/ben-eb/cssnano

### 1.3. Do not use mixins

Preprocessors libraries like Compass provide API by mixins.

PostCSS has a different way. Do not provide mixins for [postcss-mixins].
Custom properties and at-rules are better way.

[postcss-mixins]: https://github.com/postcss/postcss-mixins

### 1.4. Create plugin by `postcss.plugin`

This method will create a wrap to provide common plugin API:

```js
module.exports = postcss.plugin('plugin-name', function (opts) {
    return function (css, result) {
        // Plugin code
    };
});
```

## 2. Processing

### 2.1. Plugin must be tested

CI service like [Travis] is also recommended to test code on
different environments (at least on node.js 0.12 and io.js).

[Travis]: https://travis-ci.org/

### 2.2. Use asynchronous methods when it is possible

For example, use `fs.writeFile` instead of `fs.writeFileSync`:

```js
postcss.plugin('plugin-sprite', function (opts) {
    return function (css, result) {

        return new Promise(function (resolve, reject) {
            var sprite = makeSprite();
            fs.writeFile(opts.file, function (err) {
                if ( err ) return reject(err);
                resolve();
            })
        });

    };
});
```

### 2.3. Set `node.source` for new nodes

Every node must have relevant `source` to generate correct source map.

So if you add new declaration, because of different declaration, you should
clone it to save origin `source`.

```js
if ( needPrefix(decl.prop) ) {
    decl.cloneBefore({ prop: '-webkit-' + decl.prop });
}
```

If you will create different type of node, you can just set `source`
from source node:

```js
if ( decl.prop === 'animation' ) {
    var keyframe = createAnimationByName(decl.value);
    keyframes.source = decl.source;
    decl.root().append(keyframes);
}
```

### 2.4. Use only the public PostCSS API

PostCSS plugins must not rely on undocumented properties or methods,
which may be subject to change in any minor release. The public API
is described in [API docs].

[API docs]: https://github.com/postcss/postcss/blob/master/docs/api.md

## 3. Errors

### 3.1. Use `node.error` on CSS relevant errors

If you have a error because of input CSS (like unknown name in mixin plugin)
you should use `node.error` to create a error with source position:

```js
if ( typeof mixins[name] === 'undefined' ) {
    throw decl.error('Unknown mixin ' + name, { plugin: 'postcss-mixins' });
}
```

You must set your plugin name in `plugin` options.

### 3.2. Use `result.warn` for warnings

Do not print warnings by `console.warn`, because some PostCSS runner may has
no console output.

```js
if ( outdated(decl.prop) ) {
    result.warn(decl.prop + ' is outdated', { node: decl });
}
```

If CSS input is a source of warning, plugin must set `node` option.

## 4. Documentation

### 4.1. Document your plugin in English

PostCSS plugins must have their `README.md` written in English. Do not be afraid
of your English skills, as the open source community will fix your errors.

Of course, you are welcome to write documentation in other languages;
just name them appropriately (e.g. `README.ja.md`).

### 4.2. Put input and output examples

`README.md` must contain input and output CSS. Example is a best way
to describe plugin work.

First section is a good place to put examples.
See [postcss-opacity](https://github.com/iamvdo/postcss-opacity) for example.

### 4.3. Maintain a changelog

PostCSS plugins must describe changes of all releases in a separate file,
such as `ChangeLog.md`, `History.md`, or with [GitHub Releases].
Visit [Keep A Changelog] for more information on how to write one of these.

Of course you should use [SemVer].

[Keep A Changelog]: http://keepachangelog.com/
[GitHub Releases]:  https://help.github.com/articles/creating-releases/
[SemVer]:           http://semver.org/

### 4.4. `postcssplugin` keyword in `package.json`

PostCSS plugins written for npm must have the `postcss-plugin` keyword
in their `package.json`. This special keyword will be useful for feedback about
the PostCSS ecosystem.

For packages not published to npm, this is not mandatory, but recommended
if the package format is allowed to contain keywords.
