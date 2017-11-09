## PostCSS Architecture

General overview of PostCSS architecture.
It can be useful for everyone who wish to contribute to core or develop better understanding of the tool.

**Table of Contents**

- [Overview](#overview)
- [Workflow](#workflow)
- [Core Structures](#core-structures)
    * [Tokenizer](#tokenizer)
    * [Parser](#parser)
    * [Processor](#processor)
    * [Stringifier](#stringifier)
- [API](#api)
- [Other](#other)

### Overview

> This section describes ideas lying behind PostCSS

Before diving deeper into development of PostCSS let's briefly describe what is PostCSS and what is not.

PostCSS

- *is NOT a style preprocessor like `Sass` or `Less`.*

    It does not define custom syntax and semantic, it's not actually a language.
    PostCSS works with CSS and can be easily integrated with tools described above. That being said any valid CSS can be processed by PostCSS.

- *is a tool for CSS syntax transformations*

    It allows you to define custom CSS like syntax that could be understandable and transformed by plugins. That being said PostCSS is not strictly about CSS spec but about syntax definition manner of CSS. In such way you can define custom syntax constructs like at-rule, that could be very helpful for tools build around PostCSS. PostCSS plays a role of framework for building outstanding tools for CSS manipulations.

- *is a big player in CSS ecosystem*

    Large amount of lovely tools like `Autoprefixer`, `Stylelint`, `CSSnano` were built on PostCSS ecosystem. There is big chance that you already use it implicitly, just check your `node_modules` ;)

### Workflow

This is high level overview of whole PostCSS workflow

<img width="300" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/PostCSS_scheme.svg/512px-PostCSS_scheme.svg.png" alt="workflow">

As you can see from diagram above, PostCSS architecture pretty straightforward but some parts could be misunderstood.

From diagram above you can see part called Parser, this construct will be described in details later on, just for now think about it as a structure that can understand your CSS like syntax and create object representation of it.

That being said, there are few ways to write parser

 - *Write a single file with string to AST transformation*

    This method is quite popular, for example, the [Rework analyzer](https://github.com/reworkcss/css/blob/master/lib/parse/index.js) was written in this style. But with a large code base, the code becomes hard to read and pretty slow.

 - *Split it into lexical analysis/parsing steps (source string → tokens → AST)*

    This is the way of how we do it in PostCSS and also the most popular one.
    A lot of parsers like [`Babylon` (parser behind Babel)](), [`CSSTree`]() were written in this way.
    The main reasons to separate tokenization from parsing steps are performance and abstracting complexity.

Let thing about why second way is better for our needs.

First of all because string to tokens step takes more time than parsing step. We operate on large source string and process it char by char, this is why it is very inefficient operation in terms of performance and we should perform it only once.

But from other side tokens to AST transformation is logically more complex so with such separation we could write very fast tokenizer (but from this comes sometimes hard to read code) and easy-to-read (but slow) parser.

Summing it up splitting in two steps improve performance and code readability.

So now lets look more closely on structures that play main role in PostCSS' workflow.

### Core Structures

 - #### Tokenizer ( [lib/tokenize.es6]() )

    Tokenizer (aka Lexer) plays important role in syntax analysis.

    It accepts CSS string and returns list of tokens.

    Token is plain structure that describes some part of syntax like `at-rule`, `comment` or `word`. It could also contain positional information for more descriptive errors.

    For example if we consider following css

    ```css
    .className { color: #FFF; }
    ```

    corresponding tokens representation would be
    ```js
    [
        ["word", ".className", 1, 1, 1, 10]
        ["space", " "]
        ["{", "{", 1, 12]
        ["space", " "]
        ["word", "color", 1, 14, 1, 18]
        [":", ":", 1, 19]
        ["space", " "]
        ["word", "#FFF" , 1, 21, 1, 23]
        [";", ";", 1, 24]
        ["space", " "]
        ["}", "}", 1, 26]
    ]
    ```

    As you can see from the example above single token represented as a list and also `space` token doesn't have positional information.

    Lets look more closely on single token like `word`. It was said each token represented as a list and follow such pattern.

    ```typescript
    const token = [
         // represents token type
        'word',

        // represents matched word
        '.className',

        // This two numbers represent start position of token.
        // It's optional value as we saw in example above,
        // tokens like `space` don't have such information.

        // Here is first number is line number and second one is corresponding column.
        1, 1,

        // Next two numbers also optional and reresent end position for multichar tokens like this one. Numbers follow same rule as was described above
        1, 10
    ];
    ```
   There are many patterns how tokenization could be done, PostCSS motto is performance and simplicity. Tokenization is complex computing operation and take large amount of syntax analysis time ( ~90% ), that why PostCSS' Tokenizer looks dirty but it was optimized for speed. Any high-level constructs like classes could dramatically slow down tokenizer.

    PostCSS' Tokenizer use some sort of streaming/chaining API where you exposes [`nextToken()`](https://github.com/postcss/postcss/blob/master/lib/tokenize.es6#L48-L308) method to Parser. In this manner we provide clean interface for Parser and reduce memory usage by storing only few tokens and not whole list of tokens.

    We will look more closely on this pattern in the next section.

- #### Parser ( [lib/parse.es6](), [lib/parser.es6]() )

    Parser is main structure that responsible for [syntax analysis](https://en.wikipedia.org/wiki/Parsing) of incoming CSS. Parser produces structure called [Abstract Syntax Tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) that could then be transformed by plugins later on.

    Parser works in common with Tokenizer and operates over tokens not source string, as it would be very inefficient operation.

    It use mostly `nextToken` and `back` methods provided by Tokenizer for obtaining single or multiple tokens and than construct part of AST called `Node`

    There are multiple Node types that PostCSS could produce but all of them inherit from base Node [class]().

- #### Processor ( [lib/processor.es6]() )

    Processor is a structure that initializes plugins and run syntax transformations.
    More later on.

- #### Stringifier ( [lib/stringify.es6](), [lib/stringifier.es6]() )

    Stringifier is a base class that translates modified AST to pure CSS string.
    More later on.

### API

More descriptive API documentation could be found [here](http://api.postcss.org/)