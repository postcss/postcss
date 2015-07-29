# How to Write Custom Syntax

PostCSS can transform not only CSS. You can write a custom syntax
and transform styles in other format.

Writing a custom syntax is much harder rather then writing just
a PostCSS plugin. But it is a awesome adventure.

You can provide 3 types of package:

* **Parser** to parse input string to node’s tree.
* **Stringifier** to generate output string by node’s tree.
* **Syntax** contains parser and stringifier.

## Syntax

Good example of syntax is SCSS. Some users may want to change properties order
or add prefixes directly to SCSS sources. So we need SCSS input and output.

Syntax API is very simple. It is just a object with `parse` and `stringify`
functions:

```js
module.exports = {
    parse:     require('./parse'),
    stringify: require('./stringify')
};
```

## Parser

Main example of parse is Safe Parser, to parse broken CSS. There is not sense
to generate string with broken CSS, so package should provide only parser.

Parser API is a function, that receives string and returns `Root` node.

```js
var postcss = require('postcss');

module.exports = function (css) {
    var root = postcss.root();
    // Some magic with css
    return root;
};
```

TODO parser theory look and current one (copy paste is OK)

TODO: Node#raws

TODO: tokenizer and parser

TODO: performance: why, tokenizer is important, plain functions and jumps

## Stringifier

Style guide generator is good example of stringifier. It generates output HTML
with usage examples by component styles.

Stringifier API is little bit more complicated, that parser API.
PostCSS generates source map. So stringifier can’t just return a string.
It must link every string with source node.

Stringifier is a function, that receives `Root` node and builder callback.
Then it calls builder with every node’s string and this node.

```js
module.export = function (root, builder) {
    // Some magic
    var string = decl.prop + ':' + decl.value + ';';
    builder(string, decl);
    // Some science
};
```

TODO look and extend current one

TODO start|end tokens in builder
