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

    Tokenizer (aka Lexer) plays important role in syntax processing.

    It performs operation called [lexical analysis](https://en.wikipedia.org/wiki/Lexical_analysis) on passed source and produces structures called `Token` (sometimes it also called Lexeme).

    Token is plain structure that describes some part of syntax like `at-rule`, `comment` or `word`. It could also contain positional information for more descriptive errors.

   There are many patterns how lexical analysis could be done, PostCSS motto is performance and simplicity.

    PostCSS' Tokenizer use some sort of streaming/chaining API where you exposes `nextToken`() method to Parser. We will look more closely on this pattern in section about `Parser`.

- #### Parser ( [lib/parse.es6](), [lib/parser.es6]() )

    Parser is main structure that responsible for [syntax analysis](https://en.wikipedia.org/wiki/Parsing) of incoming CSS. Parser produces structure called [Abstract Syntax Tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) that could then be transformed by plugins later on.

    Parser works collaboratively with Tokenizer and operates over Tokens not source string, as it would be very inefficient operation.

    It use mostly `nextToken` and `back` methods provided by Tokenizer for obtaining single or multiple tokens and than construct part of AST called `Node`

    There are multiple Node types that PostCSS could produce but all of them inherits from base Node [class]().

- #### Processor ( [lib/processor.es6]() )

    Processor is a structure that initializes plugins and run syntax transformations.
    More later on.

- #### Stringifier ( [lib/stringify.es6](), [lib/stringifier.es6]() )

    Stringifier is a base class that translates modified AST to pure CSS string.
    More later on.

### API

More descriptive API documentation could be found [here](http://api.postcss.org/)
