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
