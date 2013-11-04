# PostCSS

PostCSS is a framework for CSS postprocessors. You get a custom JS function
to modify CSS, and PostCSS parses CSS, gives you usable JS API to edit CSS node
tree and then save modified node tree to new CSS.

For example, let's fix forgotten `content` propery in `::before` and `::after`:

```js
var postcss = require('postcss');

var postprocessor = postcss(function (css) {
    css.eachRule(function (rule) {
        if ( rule.selector.match(/::(before|after)/) ) {

            var good = rule.some(function (i) {
                return i.prop == 'content';
            });
            if ( !good ) {
                rule.prepend({ prop: 'content', value: '""' });
            }

        }
    });
});
```

And then CSS with forgotten `content`:

```css
a::before {
    width: 10px;
    height: 10px;
    background: black
}
```

will be fixed by our new `postprocessor`:

```js
var fixed = postprocessor.process(css);
```

to:

```css
a::before {
    content: "";
    width: 10px;
    height: 10px;
    background: black
}
```

Sponsored by [Evil Martians](http://evilmartians.com/).

## Features

### Preserves code formatting and indentations

PostCSS saves all spaces if you don’t change CSS node and try to copy your
coding style if you modify it.

### Parses everything

In addition to the unit tests, PostCSS has integration tests to check
CSS parser on real-world sites. Right now parser is tested on GitHub, Twitter,
Bootstrap and Habrahabr styles.

Also PostCSS parser is very flexible and, for example, can parse any custom
or future at-rules, instead of built-in list.

### High-level API

PostCSS is not only parser and stringifier. It contains useful tools, which
can be used in most of postprocessor:

1. Safe iterator, which allow to change list inside iteration.
2. Module to split value list by spaces or commas.
