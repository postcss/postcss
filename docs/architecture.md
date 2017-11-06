## PostCSS Architecture

General overview of PostCSS architecture.
It can be useful for everyone who wish to contribute to core or develop better understanding of the tool.

**Table of Contents**

- [Overview](#overview)
- [Diagram](#diagram)
- [Core Structures](#core-structures)
    * [Tokenizer](#tokenizer)
    * [Parser](#parser)
    * [Processor](#processor)
    * [Stringifier](#stringifier)
- [API](#api)
- [Misc](#misc)

### Overview

> This section describes ideas lying behind PostCSS

Before diving deeper into development of PostCSS let's briefly describe what is PostCSS and what is not.

PostCSS ,

- *is NOT a style preprocessor like `Sass` or `Less`.*

    It does not define custom syntax and semantic, it's not actually a language.
    PostCSS works with CSS and can be easily integrated with tools described above. That being said any valid CSS can be processed by PostCSS.

- *is a tool for CSS transformation*

    It allows you to define custom syntax that could be understandable and transformed by plugins. PostCSS play a role of framework for building outstanding tools for CSS manipulations.

- *is a big player in CSS ecosystem*

    Large amount of lovely tools like `Autoprefixer`, `Stylelint`, `CSSnano` were built on PostCSS ecosystem. There is big chance that you already use it implicitly, just check your `node_modules` ;)

### Diagram

This is high level overview of whole PostCSS workflow

<img width="300" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/PostCSS_scheme.svg/512px-PostCSS_scheme.svg.png" alt="workflow">

As you can see from diagram above, PostCSS architecture pretty straightforward but some parts could be misunderstanded.

So lets look closely on structures that play main role in PostCSS' workflow.

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

   There are many patterns how tokenizing could be done, PostCSS motto is performance and simplicity. Tokenizing is complex computing operation and take large amount of syntax analysis time ( ~90% ), that why PostCSS' Tokenizer looks dirty but it was optimized for speed. Any high-level constructs like classes could dramatically slow down tokenizer.

    PostCSS' Tokenizer use some sort of streaming/chaining API where you exposes [nextToken()](https://github.com/postcss/postcss/blob/master/lib/tokenize.es6#L48-L308) method to Parser. In this manner we provide clean interface for Parser and reduce memory usage by storing only few tokens and not whole list of tokens.

    We will look more closely on this pattern in the next section.

- #### Parser ( [lib/parse.es6](), [lib/parser.es6]() )

    Parser is main structure that responsible for [syntax analysis](https://en.wikipedia.org/wiki/Parsing) of incoming CSS. Parser produces structure called [Abstract Syntax Tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) that could then be transformed by plugins later on.

    Parser works collaboratively with Tokenizer and operates over tokens not source string, as it would be very inefficient operation.

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
