# Contributing Guide to PostCSS

If you want to contribute to PostCSS, there are a few things that you should
be familiar with.


## Adding Your Plugin to the List

If you created or found a plugin and want to add it to the PostCSS plugins list
follow these simple steps:

PR should not change plugins defined in README — it only contains favorite plugins
moderated by the PostCSS author.

Plugins submitted by the community are located in [`docs/plugins`].

* **Keep plugins ordered**

    Be sure that a plugin is not already present and find a suitable position
    for it in alphabetical order.
    However plugins with `postcss-` prefix should come first.

* **Check spelling**

    Before submitting a PR make sure the spelling check is passing.
    To run the check use `npm test`.
    If it fails with an unknown word error, add it as a word
    to `.yaspellerrc` dictionary.

* **Check PostCSS plugin guidelines**

    The suggested plugin should match plugin [guidelines].

- **Provide link to suggested plugin**

    Make sure your pull request description contains a link to the plugin
    you want to add.

[`docs/plugins`]: https://github.com/postcss/postcss/blob/main/docs/plugins.md
[guidelines]:     https://github.com/postcss/postcss/blob/main/docs/guidelines/plugin.md


## TypeScript Declaration Improvements

If you found a bug or want to add certain improvements to types declaration file:

* **Check current TypeScript styling**

   Be sure that your changes match TypeScript styling rules defined in typings file.
    * We use classes for existing JS classes like `Stringifier`.
    * Namespaces used for separating functions related to the same subject.
    * Interfaces used for defining custom types.

   Make sure you read through declaration file writing [best practices]
   by the TypeScript team.

[best practices]: https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html


## Core Development

If you want to add new features or fix existing issues

- **Become familiar with PostCSS architecture**

    For a gentle intro to PostCSS architecture look through our [guide].

[guide]: https://github.com/postcss/postcss/blob/main/docs/architecture.md
