# Writing a PostCSS Plugin

**Table of Contents**

* [Links](#links)
* [Step 1: Create an idea](#step-1-create-an-idea)
* [Step 2: Create a project](#step-2-create-a-project)
* [Step 3: Find nodes](#step-3-find-nodes)
* [Step 4: Change nodes](#step-4-change-nodes)
* [Step 5: Fight with frustration](#step-5-fight-with-frustration)
* [Step 6: Make it public](#step-6-make-it-public)

## Links

Documentation:

* [Plugin Boilerplate](https://github.com/postcss/postcss-plugin-boilerplate)
* [Plugin Guidelines](https://github.com/postcss/postcss/blob/main/docs/guidelines/plugin.md)
* [PostCSS API](https://postcss.org/api/)
* [AST playground](https://astexplorer.net/#/2uBU1BLuJ1)

Support:

* [Ask questions](https://github.com/orgs/postcss/discussions)
* [PostCSS twitter](https://twitter.com/postcss) with latest updates.


## Step 1: Create an idea

There are many fields where writing new PostCSS plugin will help your work:

* **Compatibility fixes:** if you always forget to add hack
  for browser compatibility, you can create PostCSS plugin to automatically
  insert this hack for you. [`postcss-flexbugs-fixes`] and [`postcss-100vh-fix`]
  are good examples.
* **Automate routine operations:** let’s computer do routine operations, free
  yourself for creative tasks. For instance, PostCSS with [RTLCSS] can
  automatically convert a design to right-to-left languages (like Arabic
  or Hebrew) or with [postcss-dark-theme-class`] can insert media
  queries for dark/light theme switcher.
* **Preventing popular mistakes:** “if an error happened twice,
  it will happen again.” PostCSS plugin can check your source code for popular
  mistakes and save your time for unnecessary debugging. The best way to do it
  is to [write new Stylelint plugin] (Stylelint uses PostCSS inside).
* **Increasing code maintainability:** [CSS Modules] or [`postcss-autoreset`]
  are great example how PostCSS can increase code maintainability by isolation.
* **Polyfills:** we already have a lot polyfills for CSS drafts
  in [`postcss-preset-env`]. If you find a new draft, you can add a new plugin
  and send it to this preset.
* **New CSS syntax:** we recommend avoiding adding new syntax to CSS.
  If you want to add a new feature, it is always better to write a CSS draft
  proposal, send it to [CSSWG] and then implement polyfill.
  [`postcss-easing-gradients`] with [this proposal] is a good example.
  However, there are a lot of cases when you can’t send a proposal.
  For instance, browser’s parser performance limited CSSWG nested syntax a lot
  and you may want to have non-official Sass-like syntax from [`postcss-nested].

[`postcss-easing-gradients`]: https://github.com/larsenwork/postcss-easing-gradients
[write new Stylelint plugin]: https://stylelint.io/developer-guide/plugins
[postcss-dark-theme-class`]: https://github.com/postcss/postcss-dark-theme-class
[`postcss-flexbugs-fixes`]: https://github.com/luisrudge/postcss-flexbugs-fixes
[`postcss-preset-env`]: https://github.com/csstools/postcss-preset-env
[`postcss-autoreset`]: https://github.com/maximkoretskiy/postcss-autoreset
[`postcss-100vh-fix`]: https://github.com/postcss/postcss-100vh-fix
[`postcss-nested]: https://github.com/postcss/postcss-nested
[this proposal]: https://github.com/w3c/csswg-drafts/issues/1332
[CSS Modules]: https://github.com/css-modules/css-modules
[RTLCSS]: https://rtlcss.com/
[CSSWG]: https://github.com/w3c/csswg-drafts


## Step 2: Create a project

There are two ways to write a plugin:

* Create a **private** plugin. Use this way only if the plugin is related
  to specific things of projects. For instance, you want to automate a specific
  task for your unique UI library.
* Publish a **public** plugin. It is always the recommended way. Remember that
  private front-end systems, even in Google, often became unmaintained.
  On the other hand, many popular plugins were created during the work
  on a closed source project.

For private plugin:
1. Create a new file in `postcss/` folder with the name of your plugin.
2. Copy [plugin template] from our boilerplate.

For public plugins:
1. Use the guide in [PostCSS plugin boilerplate] to create a plugin directory.
2. Create a repository on GitHub or GitLab.
3. Publish your code there.

```js
module.exports = (opts = {}) => {
  // Plugin creator to check options or prepare caches
  return {
    postcssPlugin: 'PLUGIN NAME'
    // Plugin listeners
  }
}
module.exports.postcss = true
```

[PostCSS plugin boilerplate]: https://github.com/postcss/postcss-plugin-boilerplate/
[plugin template]: https://github.com/postcss/postcss-plugin-boilerplate/blob/main/template/index.t.js


## Step 3: Find nodes

Most of the PostCSS plugins do two things:
1. Find something in CSS (for instance, `will-change` property).
2. Change found elements (for instance, insert `transform: translateZ(0)` before
   `will-change` as a polyfill for old browsers).

PostCSS parses CSS to the tree of nodes (we call it AST). This tree may content:
* [`Root`]: node of the top of the tree, which represent CSS file.
* [`AtRule`]: statements begin with `@` like `@charset "UTF-8"`
  or `@media (screen) {}`.
* [`Rule`]: selector with declaration inside. For instance `input, button {}`.
* [`Declaration`]: key-value pair like `color: black`;
* [`Comment`]: stand-alone comment. Comments inside selectors, at-rule
  parameters and values are stored in node’s `raws` property.

You can use [AST Explorer](https://astexplorer.net/#/2uBU1BLuJ1) to learn
how PostCSS convert different CSS to AST.

[`Root`]: https://postcss.org/api/#root
[`AtRule`]: https://postcss.org/api/#atrule
[`Rule`]: https://postcss.org/api/#rule
[`Declaration`]: https://postcss.org/api/#declaration
[`Comment`]: https://postcss.org/api/#comment

You can find all nodes with specific types by adding method to plugin object:

```js
module.exports = (opts = {}) => {
  return {
    postcssPlugin: 'PLUGIN NAME',
    Once (root) {
      // Calls once per file, since every file has single Root
    },
    Declaration (decl) {
      // All declaration nodes
    }
  }
}
module.exports.postcss = true
```

Here is the full list of [plugin’s events](https://postcss.org/api/#plugin).

If you need declaration or at-rule with specific names,
you can use quick search:

```js
    Declaration: {
      color: decl => {
        // All `color` declarations
      }
      '*': decl => {
        // All declarations
      }
    },
    AtRule: {
      media: atRule => {
        // All @media at-rules
      }
    }
```

For other cases, you can use regular expressions or specific parsers:

* [Selector parser](https://github.com/postcss/postcss-selector-parser)
* [Value parser](https://github.com/TrySound/postcss-value-parser)
* [Dimension parser](https://github.com/jedmao/parse-css-dimension)
  for `number`, `length` and `percentage`.
* [Media query parser](https://github.com/dryoma/postcss-media-query-parser)
* [Font parser](https://github.com/jedmao/parse-css-font)
* [Sides parser](https://github.com/jedmao/parse-css-sides)
  for `margin`, `padding` and `border` properties.

Other tools to analyze AST:

* [Property resolver](https://github.com/jedmao/postcss-resolve-prop)
* [Function resolver](https://github.com/andyjansson/postcss-functions)
* [Font helpers](https://github.com/jedmao/postcss-font-helpers)
* [Margin helpers](https://github.com/jedmao/postcss-margin-helpers)

Don’t forget that regular expression and parsers are heavy tasks. You can use
`String#includes()` quick test before check node with heavy tool:

```js
if (decl.value.includes('gradient(')) {
  let value = valueParser(decl.value)
  …
}
```

There two types or listeners: enter and exit. `Once`, `Root`, `AtRule`,
and `Rule` will be called before processing children. `OnceExit`, `RootExit`,
`AtRuleExit`, and `RuleExit` after processing all children inside node.

You may want to re-use some data between listeners. You can do with
runtime-defined listeners:

```js
module.exports = (opts = {}) => {
  return {
    postcssPlugin: 'vars-collector',
    prepare (result) {
      const variables = {}
      return {
        Declaration (node) {
          if (node.variable) {
            variables[node.prop] = node.value
          }
        },
        OnceExit () {
          console.log(variables)
        }
      }
    }
  }
}
```

You can use `prepare()` to generate listeners dynamically. For instance,
to use [Browserslist] to get declaration properties.

[Browserslist]: https://github.com/browserslist/browserslist


## Step 4: Change nodes

When you find the right nodes, you will need to change them or to insert/delete
other nodes around.

PostCSS node has a DOM-like API to transform AST. Check out our [API docs].
Nodes has methods to travel around (like [`Node#next`] or [`Node#parent`]),
look to children (like [`Container#some`]), remove a node
or add a new node inside.

Plugin’s methods will receive node creators in second argument:

```js
    Declaration (node, { Rule }) {
      let newRule = new Rule({ selector: 'a', source: node.source })
      node.root().append(newRule)
      newRule.append(node)
    }
```

If you added new nodes, it is important to copy [`Node#source`] to generate
correct source maps.

Plugins will re-visit all nodes, which you changed or added. If you will change
any children, plugin will re-visit parent as well. Only `Once` and
`OnceExit` will not be called again.

```js
const plugin = () => {
  return {
    postcssPlugin: 'to-red',
    Rule (rule) {
      console.log(rule.toString())
    },
    Declaration (decl) {
      console.log(decl.toString())
      decl.value = 'red'
    }
  }
}
plugin.postcss = true

await postcss([plugin]).process('a { color: black }', { from })
// => a { color: black }
// => color: black
// => a { color: red }
// => color: red
```

Since visitors will re-visit node on any changes, just adding children will
cause an infinite loop. To prevent it, you need to check
that you already processed this node:

```js
    Declaration: {
      'will-change': decl => {
        if (decl.parent.some(decl => decl.prop === 'transform')) {
          decl.cloneBefore({ prop: 'transform', value: 'translate3d(0, 0, 0)' })
        }
      }
    }
```

You can also use `Symbol` to mark processed nodes:

```js
const processed = Symbol('processed')

const plugin = () => {
  return {
    postcssPlugin: 'example',
    Rule (rule) {
      if (!rule[processed]) {
        process(rule)
        rule[processed] = true
      }
    }
  }
}
plugin.postcss = true
```

Second argument also have `result` object to add warnings:

```js
    Declaration: {
      bad: (decl, { result }) {
        decl.warn(result, 'Deprecated property bad')
      }
    }
```

If your plugin depends on another file, you can attach a message to `result`
to signify to runners (webpack, Gulp etc.) that they should rebuild the CSS
when this file changes:

```js
    AtRule: {
      import: (atRule, { result }) {
        const importedFile = parseImport(atRule)
        result.messages.push({
          type: 'dependency',
          plugin: 'postcss-import',
          file: importedFile,
          parent: result.opts.from
        })
      }
    }
```

If the dependency is a directory you should use the `dir-dependency`
message type instead:

```js
result.messages.push({
  type: 'dir-dependency',
  plugin: 'postcss-import',
  dir: importedDir,
  parent: result.opts.from
})
```

If you find an syntax error (for instance, undefined custom property),
you can throw a special error:

```js
if (!variables[name]) {
  throw decl.error(`Unknown variable ${name}`, { word: name })
}
```

[`Container#some`]: https://postcss.org/api/#container-some
[`Node#source`]: https://postcss.org/api/#node-source
[`Node#parent`]: https://postcss.org/api/#node-parent
[`Node#next`]: https://postcss.org/api/#node-next
[API docs]: https://postcss.org/api/


## Step 5: Fight with frustration

> I hate programming<br />
> I hate programming<br />
> I hate programming<br />
> It works!<br />
> I love programming

You will have bugs and a minimum of 10 minutes in debugging even a simple plugin.
You may found that simple origin idea will not work in real-world and you need
to change everything.

Don’t worry. Every bug is findable, and finding another solution may make your
plugin even better.

Start from writing tests. Plugin boilerplate has a test template
in `index.test.js`. Call `npx jest` to test your plugin.

Use Node.js debugger in your text editor or just `console.log`
to debug the code.

PostCSS community can help you since we are all experiencing the same problems.
Don’t afraid to ask in [special channel](https://github.com/orgs/postcss/discussions).


## Step 6: Make it public

When your plugin is ready, call `npx clean-publish` in your repository.
[`clean-publish`] is a tool to remove development configs from the npm package.
We added this tool to our plugin boilerplate.

Write a tweet about your new plugin (even if it is a small one) with
[`@postcss`] mention. Or tell about your plugin in [our chat].
We will help you with marketing.

[Add your new plugin] to PostCSS plugin catalog.

[Add your new plugin]: https://github.com/himynameisdave/postcss-plugins#submitting-a-new-plugin
[`clean-publish`]: https://github.com/shashkovdanil/clean-publish/
[`@postcss`]: https://twitter.com/postcss
