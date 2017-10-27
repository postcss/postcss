## PostCSS Architecture

General overview of PostCSS architecture.
It can be useful for everyone who wish to contribute to core or develop better understanding of the tool.

**Table of Contents**

- [Overview](#overview)
- [Diagram](#diagram)
- [Core Structures](#core-structures)
    * [Tokenizer](#tokenizer)
    * [Parser](#parser)
    * [Plugin](#plugin)
    * [Stringifier](#stringifier)
- [API](#api)

### Overview

> This section describes ideas lying behind PostCSS

Before diving deeper into development of PostCSS let's briefly describe what is PostCSS and what is not.

- **`PostCSS` is `not` a style preprocessor like `Sass` or `Less`.**

    It does not define custom syntax and semantic, it's not actually a language.
    PostCSS works with CSS and can be easily integrated with tools described above. That being said any valid CSS can be processed by PostCSS.

- **`PostCSS` is a tool for css syntax transformation.**

    To be defined

### Diagram

This is high level overview of whole PostCSS architecture

<img width="600" src="https://rawgit.com/hzlmn/postcss/docs/media/architecture.jpg" alt="arch">

### Core Structures

To be defined

### API

More descriptive API documentation could be found [here](http://api.postcss.org/)
