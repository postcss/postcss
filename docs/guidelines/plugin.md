# PostCSS Plugin Guidelines

A PostCSS plugin is a function that receives and, usually,
transforms a CSS AST from the PostCSS parser.

The rules below are *mandatory* for all PostCSS plugins.

See also [ClojureWerkz’s recommendations] for open source projects.

[ClojureWerkz’s recommendations]: http://blog.clojurewerkz.org/blog/2013/04/20/how-to-make-your-open-source-project-really-awesome/

**Table of Contents**

* [API](#1-api)
  * [1.1 Clear name with `postcss-` prefix](#11-clear-name-with-postcss--prefix)
  * [1.2. Do one thing, and do it well](#12-do-one-thing-and-do-it-well)
  * [1.3. Do not use mixins](#13-do-not-use-mixins)
  * [1.4. Keep `postcss` to `peerDependencies`](#14-keep-postcss-to-peerdependencies)
  * [1.5. Set `plugin.postcssPlugin` with plugin name](#15-set-pluginpostcssplugin-with-plugin-name)
* [Processing](#2-processing)
  * [2.1. Plugin must be tested](#21-plugin-must-be-tested)
  * [2.2. Use asynchronous methods whenever possible](#22-use-asynchronous-methods-whenever-possible)
  * [2.3. Use fast node’s scanning](#23-use-fast-nodes-scanning)
  * [2.4. Set `node.source` for new nodes](#24-set-nodesource-for-new-nodes)
  * [2.5. Use only the public PostCSS API](#25-use-only-the-public-postcss-api)
* [Dependencies](#3-dependencies)
  * [3.1. Use messages to specify dependencies](#31-use-messages-to-specify-dependencies)
* [Errors](#4-errors)
  * [4.1. Use `node.error` on CSS relevant errors](#41-use-nodeerror-on-css-relevant-errors)
  * [4.2. Use `result.warn` for warnings](#42-use-resultwarn-for-warnings)
*  [Documentation](#5-documentation)
  * [5.1. Document your plugin in English](#51-document-your-plugin-in-english)
  * [5.2. Include input and output examples](#52-include-input-and-output-examples)
  * [5.3. Maintain a changelog](#53-maintain-a-changelog)
  * [5.4. Include `postcss-plugin` keyword in `package.json`](#54-include-postcss-plugin-keyword-in-packagejson)

## 1. API

### 1.1 Clear name with `postcss-` prefix

The plugin’s purpose should be clear just by reading its name.
If you wrote a transpiler for CSS 4 Custom Media, `postcss-custom-media`
would be a good name. If you wrote a plugin to support mixins,
`postcss-mixins` would be a good name.

The prefix `postcss-` shows that the plugin is part of the PostCSS ecosystem.

This rule is not mandatory for plugins that can run as independent tools,
without the user necessarily knowing that it is powered by
PostCSS — for example, [RTLCSS] and [Autoprefixer].

[Autoprefixer]: https://github.com/postcss/autoprefixer
[RTLCSS]:       https://rtlcss.com/


### 1.2. Do one thing, and do it well

Do not create multitool plugins. Several small, one-purpose plugins bundled into
a plugin pack is usually a better solution.

For example, [`postcss-preset-env`] contains many small plugins,
one for each W3C specification. And [`cssnano`] contains a separate plugin
for each of its optimization.

[`postcss-preset-env`]: https://preset-env.cssdb.org/
[`cssnano`]:            https://github.com/cssnano/cssnano


### 1.3. Do not use mixins

Preprocessors libraries like Compass provide an API with mixins.

PostCSS plugins are different.
A plugin cannot be just a set of mixins for [`postcss-mixins`].

To achieve your goal, consider transforming valid CSS
or using custom at-rules and custom properties.

[`postcss-mixins`]: https://github.com/postcss/postcss-mixins


### 1.4. Keep `postcss` to `peerDependencies`

AST can be broken because of different `postcss` version in different plugins.
Different plugins could use a different node creators (like `postcss.decl()`).

```json
{
  "peerDependencies": {
    "postcss": "^8.0.0"
  }
}
```

It is better even not to import `postcss`.

```diff
- const { list, decl } = require('postcss')
  module.exports = opts => {
    postcssPlugin: 'postcss-name',
-   Once (root) {
+   Once (root, { list, decl }) {
      // Plugin code
    }
  }
  module.exports.postcss = true
```


### 1.5. Set `plugin.postcssPlugin` with plugin name

Plugin name will be used in error messages and warnings.

```js
module.exports = opts => {
  return {
    postcssPlugin: 'postcss-name',
    Once (root) {
      // Plugin code
    }
  }
}
module.exports.postcss = true
```


## 2. Processing

### 2.1. Plugin must be tested

A CI service like [Travis] is also recommended for testing code in
different environments. You should test in (at least) Node.js [active LTS](https://github.com/nodejs/LTS) and current stable version.

[Travis]: https://travis-ci.org/


### 2.2. Use asynchronous methods whenever possible

For example, use `fs.writeFile` instead of `fs.writeFileSync`:

```js
let { readFile } = require('fs').promises

module.exports = opts => {
  return {
    postcssPlugin: 'plugin-inline',
    async Decl (decl) {
      const imagePath = findImage(decl)
      if (imagePath) {
        let imageFile = await readFile(imagePath)
        decl.value = replaceUrl(decl.value, imageFile)
      }
    }
  }
}
module.exports.postcss = true
```

### 2.3. Use fast node’s scanning

Subscribing for specific node type is much faster, than calling `walk*` method:

```diff
  module.exports = {
    postcssPlugin: 'postcss-example',
-   Once (root) {
-     root.walkDecls(decl => {
-       // Slow
-     })
-   }
+   Declaration (decl) {
+     // Faster
+   }
  }
  module.exports.postcss = true
```

But you can make scanning even faster, if you know, what declaration’s property
or at-rule’s name do you need:

```diff
  module.exports = {
    postcssPlugin: 'postcss-example',
-   Declaration (decl) {
-     if (decl.prop === 'color') {
-       // Faster
-     }
-   }
+   Declaration: {
+     color: decl => {
+       // The fastest
+     }
+   }
  }
  module.exports.postcss = true
```


### 2.4. Set `node.source` for new nodes

Every node must have a relevant `source` so PostCSS can generate
an accurate source map.

So if you add a new declaration based on some existing declaration, you should
clone the existing declaration in order to save that original `source`.

```js
if (needPrefix(decl.prop)) {
  decl.cloneBefore({ prop: '-webkit-' + decl.prop })
}
```

You can also set `source` directly, copying from some existing node:

```js
if (decl.prop === 'animation') {
  const keyframe = createAnimationByName(decl.value)
  keyframes.source = decl.source
  decl.root().append(keyframes)
}
```


### 2.5. Use only the public PostCSS API

PostCSS plugins must not rely on undocumented properties or methods,
which may be subject to change in any minor release. The public API
is described in [API docs].

[API docs]: https://postcss.org/api/


## 3. Dependencies

### 3.1. Use messages to specify dependencies

If a plugin depends on another file, it should be specified by attaching
a `dependency` message to the `result`:

```js
result.messages.push({
  type: 'dependency',
  plugin: 'postcss-import',
  file: '/imported/file.css',
  parent: result.opts.from
})
```

Directory dependencies should be specified using the `dir-dependency` message
type. By default all files within the directory (recursively) are considered
dependencies. An optional `glob` property can be used to indicate that only
files matching a specific glob pattern should be considered.

```js
result.messages.push({
  type: 'dir-dependency',
  plugin: 'postcss-import',
  dir: '/imported',
  glob: '**/*.css', // optional
  parent: result.opts.from
})
```


## 4. Errors

### 4.1. Use `node.error` on CSS relevant errors

If you have an error because of input CSS (like an unknown name
in a mixin plugin) you should use `node.error` to create an error
that includes source position:

```js
if (typeof mixins[name] === 'undefined') {
  throw node.error('Unknown mixin ' + name)
}
```


### 4.2. Use `result.warn` for warnings

Do not print warnings with `console.log` or `console.warn`,
because some PostCSS runner may not allow console output.

```js
Declaration (decl, { result }) {
  if (outdated(decl.prop)) {
    result.warn(decl.prop + ' is outdated', { node: decl })
  }
}
```

If CSS input is a source of the warning, the plugin must set the `node` option.


## 5. Documentation

### 5.1. Document your plugin in English

PostCSS plugins must have their `README.md` wrote in English. Do not be afraid
of your English skills, as the open source community will fix your errors.

Of course, you are welcome to write documentation in other languages;
just name them appropriately (e.g. `README.ja.md`).


### 5.2. Include input and output examples

The plugin's `README.md` must contain example input and output CSS.
A clear example is the best way to describe how your plugin works.

The first section of the `README.md` is a good place to put examples.
See [postcss-opacity](https://github.com/iamvdo/postcss-opacity) for an example.

Of course, this guideline does not apply if your plugin does not
transform the CSS.


### 5.3. Maintain a changelog

PostCSS plugins must describe the changes of all their releases
in a separate file, such as `CHANGELOG.md`, `History.md`, or [GitHub Releases].
Visit [Keep A Changelog] for more information about how to write one of these.

Of course, you should be using [SemVer].

[Keep A Changelog]: https://keepachangelog.com/
[GitHub Releases]:  https://help.github.com/articles/creating-releases/
[SemVer]:           https://semver.org/


### 5.4. Include `postcss-plugin` keyword in `package.json`

PostCSS plugins written for npm must have the `postcss-plugin` keyword
in their `package.json`. This special keyword will be useful for feedback about
the PostCSS ecosystem.

For packages not published to npm, this is not mandatory, but is recommended
if the package format can contain keywords.
