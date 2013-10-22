# PostCSS

PostCSS is a framework for CSS postproccessors. You gives custom JS function
to modify CSS and PostCSS parses CSS, gives your usable JS API to edit CSS nodes
tree and then save medify nodes tree to new CSS.

For example, lets fix forgotten `content` ptopery in `::before` and `::after`:

```js
var postcss = require('postcss');

var postprocessor = postcss(function (css) {
    css.eachRule(function (rule) {
        if ( rule.selector.match(/::(before|after/) ) {
            var good = rule.decls.some(function (decl) {
                return decl.prop == 'content';
            });

            if ( !good ) {
                rule.prepend({ prop: 'content', value: '""' });
            }
        }
    });
});
```

And CSS with forgotten `content`:

```css
a::before {
    width: 10px;
    height: 10px;
    background: black;
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
    background: black;
}
```
