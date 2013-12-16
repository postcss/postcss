# PostCSS

PostCSS is a framework for CSS postprocessors, to modify CSS by your JS fuction.

It takes care of most of common tasks for CSS tool:

1. parses CSS;
2. gives you usable JS API to edit CSS node tree;
3. saves modified node tree to new CSS;
4. generates (or modify exists) source map for your changes;

You can use this framework to write you own:

* CSS minifier or beautifizer.
* Grunt plugin to generate sprites, include `data-uri` images or any other work.
* Text editor plugin to automate CSS routine.
* Command-line CSS tool.

[Autoprefixer] uses PostCSS to add actual prefixes in CSS.

Sponsored by [Evil Martians].

[Autoprefixer]:  https://github.com/ai/autoprefixer
[Evil Martians]: http://evilmartians.com/

## Quick Example

Let’s fix forgotten `content` property in `::before` and `::after`:

```js
var postcss = require('postcss');

var contenter = postcss(function (css) {
    css.eachRule(function (rule) {
        if ( rule.selector.match(/::(before|after)/) ) {
            // In every ::before/::after rule

            // Did we forget content property?
            var good = rule.some(function (i) { return i.prop == 'content'; });

            // Add content: '' if we forget it
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
    height: 10px
}
```

will be fixed by our new `contenter`:

```js
var fixed = contenter.process(css).css;
```

to:

```css
a::before {
    content: "";
    width: 10px;
    height: 10px
}
```

## Features

### Source Map

PostCSS generates source map for it’s transformations:

```js
result = processor.process(css, { from: 'from.css', to: 'to.css', map: true });
result.css // String with processed CSS
result.map // Source map
```

And modify source map from previuos step (like Sass preprocessor):

```js
var sassMap = fs.readFileSync('from.sass.map');
processor.process(css, { from: 'from.sass.css', to: 'to.css', map: sassMap });
```

### Preserves code formatting and indentations

PostCSS will not change any byte of rule if you didn’t modify it:

```js
postcss(function (css) { }).process(css).css == css;
```

When you modify CSS nodes, PostCSS will try to copy coding style:

```js
contenter.process("a::before{color: black}")
// a::before{content: '';color: black}

contenter.process("a::before {\n  color: black;\n  }")
// a::before {
//   content: '';
//   color: black;
//   }
```

## Why PostCSS Better That …

### Preprocessors

Preprocessors (like Sass or Stylus) give us special language with variables,
mixins, statements and compile it to CSS. Compass, nib and other mixins
libraries use this languages to work with prefixes, sprites and inline images.

But Sass and Stylus languages was created like syntax-sugar for CSS.
Write really complicated programs on preporcessor languages is very difficult.
[Autoprefixer] is totally impossible on Sass.

With PostCSS you can work with CSS from comfort and powerful JS or CoffeeScript.
You can do really magic things with wide range of [npm] libraries.

But postprocessors is not a enemy for preprocessors. Sass and Stylus is still
best way to add reability and some sugar to CSS syntax. You can easily
combine preprocessors and postprocessors.

[npm]: https://npmjs.org/

### RegExp

Some Grunt plugins modify CSS by regular expressions. But CSS parsering
and working with CSS node tree is much safer way.

Also regexps can broke source map from preprocessor step.

### CSS Parsers

There are a lot of good CSS parsers, like [Gonzales]. But they help you only
with first step.

Instead of them, PostCSS also gives you useful high level API (for example,
safe iterators) and will generate source map for changes (or modify exists
source map from Sass).

[Gonzales]: https://github.com/css/gonzales

### Rework

[Rework] was a first CSS postprocessors framework and very similar to PostCSS.

But Rework has much simplier API and will destroy your CSS code style and indentations. So we can’t use it in text editor plugins.

Instead of it, PostCSS will preserves all spaces and code formatting. If you
didn’t change rule, output will be byte-to-byte equal.

[Rework]: https://github.com/visionmedia/rework

## Usage

### Processor

Function `postcss(fn)` creates processor by your function:

```js
var postcss = require('postcss');

var processor = postcss(function (css) {
    // Code to modify CSS
});
```

If you want to combine several processors (to parse CSS only once),
you can create empty processor and add several functions by `use(fn)` method:

```js
var all = postcss().
          use(prefixer).
          use(minifing);
```

Processor function can just change current CSS node tree:

```js
postcss(function (css) {
    css.append( /* new rule */ )
});
```

or create totally new CSS root and return it:

```js
postcss(function (css) {
    var newCSS = postcss.root()
    // Add rules and declarations
    return newCSS;
});
```

Processor will transform some CSS by `process(css, opts)` method:

```js
var doubler = postcss(function (css) {
    // Clone each declaration
    css.eachDecl(function (decl) {
        decl.parent.prepend( decl.clone() );
    });
});

var css    = "a { color: black; }";
var result = processor.process(css);

result.css //=> "a { color: black; color: black; }"
```

You can set original CSS filename by `from` options and syntax error messages
will be much helpful:

```js
var wrong = "a {"
processor.process(wrong, { from: 'main.css' });
//=> Can't parse CSS: Unclosed block at line 1:1 in main.css
```
### Source Map

PostCSS will generate source map of it’s modifictaion, if you set true to `map`
option in `process(css, opts)` method.

But you must set input and output CSS files pathes (by `from` and `to` options)
to generate correct map.

```css
var result = processor.process(css, {
    map:  true,
    from: 'main.css',
    to:   'main.out.css'
});

result.map //=> '{"version":3,"file":"main.out.css","sources":["main.css"],"names":[],"mappings":"AAAA,KAAI"}'

fs.writeFileSync('main.out.map', result.map);
```

PostCSS can also modify previous source map (for example, from Sass
compilation). So, if you compile: Sass to CSS and then minify CSS
by postprocessor, final source map will conains mapping from Sass code
to minified CSS.

Just set original source map content (in string on in JS object)
to `map` option:

```js
var result = minifier.process(css, {
    map:   fs.readFileSync('main.sass.map'),
    from: 'main.css',
    to:   'main.out.css'
});

result.map //=> Source map from Sass to minified CSS
```
