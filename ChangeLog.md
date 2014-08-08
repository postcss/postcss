## 2.1.2
* Fix UTF-8 support in inline source map.
* Fix source map `sourcesContent` if there is no `from` and `to` options.

## 2.1.1
* Allow to miss `to` and `from` options for inline source maps.
* Add `Node#source.id` if file name is unknown.
* Better detect splitter between rules in CSS concatenation tools.
* Automatically clone node in insert methods.

## 2.1 “King Amdusias”
* Change Traceur ES6 compiler to ES6 Transpiler.
* Show broken CSS line in syntax error.

## 2.0 “King Belial”
* Project was rewritten from CoffeeScript to ES6.
* Add Safe Mode to works with live input or with hacks from legacy code.
* More safer parser to pass all hacks from Browserhacks.com.
* Use real properties instead of magic getter/setter for raw propeties.

## 1.0 “Marquis Decarabia”
* Save previous source map for each node to support CSS concatenation
  with multiple previous maps.
* Add `map.sourcesContent` option to add origin content to `sourcesContent`
  inside map.
* Allow to set different place of output map in annotation comment.
* Allow to use arrays and `Root` in `Container#append` and same methods.
* Add `Root#prevMap` with information about previous map.
* Allow to use latest PostCSS from GitHub by npm.
* `Result` now is lazy and it will stringify output CSS only if you use `css` or
  `map` property.
* Use separated `map.prev` option to set previous map.
* Rename `inlineMap` option to `map.inline`.
* Rename `mapAnnotation` option to `map.annotation`.
* `Result#map` now return `SourceMapGenerator` object, instead of string.
* Run previous map autodetect only if input CSS contains annotation comment.
* Add `map: 'inline'` shortcut for `map: { inline: true }` option.
* `Node#source.file` now will contains absolute path.
* Clean `Declaration#between` style on node clone.

## 0.3.5
* Allow to use `Root` or `Result` as first argument in `process()`.
* Save parsed AST to `Result#root`.

## 0.3.4
* Better space symbol detect to read UTF-8 BOM correctly.

## 0.3.3
* Remove source map hacks by using new Mozilla’s `source-map` (by Simon Lydell).

## 0.3.2
* Add URI encoding support for inline source maps.

## 0.3.1
* Fix relative paths from previous source map.
* Safer space split in `Rule#selectors` (by Simon Lydell).

## 0.3 “Prince Seere”
* Add `Comment` node for comments between declarations or rules.
* Add source map annotation comment to output CSS.
* Allow to inline source map to annotation comment by data:uri.
* Fix source maps on Windows.
* Fix source maps for styles in subdirectory (by @nDmitry and @lydell).
* Autodetect previous source map.
* Add `first` and `last` shortcuts to container nodes.
* Parse `!important` to separated property in `Declaration`.
* Allow to break iteration by returning `false`.
* Copy code style to new nodes.
* Add `eachInside` method to recursivelly iterate all nodes.
* Add `selectors` shortcut to get selectors array.
* Add `toResult` method to `Rule` to simplify work with several input files.
* Clean declaration’s `value`, rule’s `selector` and at-rule’s `params`
  by storing spaces in `between` property.

## 0.2 “Duke Dantalion”
* Add source map support.
* Add shortcuts to create nodes.
* Method `process()` now returns object with `css` and `map` keys.
* Origin CSS file option was renamed from `file` to `from`.
* Rename `Node#remove()` method to `removeSelf()` to fix name conflict.
* Node source was moved to `source` property with origin file
  and node end position.
* You can set own stringify function.

## 0.1 “Count Andromalius”
* Initial release.
