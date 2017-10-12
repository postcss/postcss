## Contributing guide to PostCSS

If you want contribute to PostCSS, there are few things that you should be familiar with

### In case you have question about using PostCSS

- *Ask for help in `Gitter`*

    If you stuck on something there is a big chance that someone had similar problem before.

    Just ask your question in our Gitter [channel](https://gitter.im/postcss/postcss) but be polite and kind with other people.

- *Check official PostCSS [documentation](https://github.com/postcss/postcss/tree/master/docs)*

    If you can not find answer to your question try to search proper Q/A resources (Stack Overflow etc.) before creating issue with question.

   If you still can not solve certain problem, create an issue with proper naming for help request.


### Adding your plugin to the list

If you created or found a plugin and want to add it to PostCSS plugins list follow this simple steps.

`Note!` *PR should not change plugins defined in README it contains only favorite plugins and moderated by PostCSS author.*

Plugins submitted by community located in [`docs/plugins`](https://github.com/postcss/postcss/blob/master/docs/plugins.md)

- *Carefully check current list of plugins*

    Be sure that plugin not presented yet and find suitable position in alphabetic order for it.
    But plugins with `postcss-` prefix should come first.

- *Check spelling*

    Before submitting PR be sure that spelling check pass. For that run command `npm test`.
    If it fails with unknown word error, add it as word to `.yaspellerrc` dictionary.


- *Check PostCSS plugin guideline*

    Provided plugin should match plugin [guidance](https://github.com/postcss/postcss/blob/master/docs/guidelines/plugin.md).

- *Create a pull request with descriptive naming*

   "*Updated readme*" is tell nothing for PR reviewer. Try to come with more specific name like
    "*Added my-awesome-postcss-plugin to plugins list*". Also be sure to include updates in other translations as well.

    Also your pull request should have link to plugin your are willing to add.



### TypeScript declaration file improvements

If you found a bug or want to add certain improvements to types declaration file

- *Check current TypeScript styling*

   Be sure that your changes wont break anything as well as match TypeScript styling rules defined in typings file.

   Make sure you read through declaration file writing best practices [here](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

### Core development

If you want to add new feature or fix existed issue

- *Become familiar with PostCSS architecture*

    For adding new feature you certainly should be good understanding of PostCSS architecture as well as principles it follows.

    For gentle intro to PostCSS architecture look through our [guide]()

