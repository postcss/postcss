### Quick start

#### Выбираем тип плагина
Плагины для PostCSS можно писать в следующих стилях:
- в объектном стиле; 
- в стиле посетитель;

**Какой стиль выбрать?**

**объектный стиль** - для тех, кто пишет в первый раз и хочет попробовать себя в 
этом деле. Так вам будет проще стартовать.
Плагин получает CSS в виде AST дерева. Внутри плагина нужно организовать 
обход дерева в поисках нужного узла. Это можно сравнить с DOM API.
Есть много информации по написанию таких плагинов. 
Вы можете почитать: [Writing Your First PostCSS Plugin](https://dockyard.com/blog/2018/02/01/writing-your-first-postcss-plugin) 
или [Create Your Own Plugin tutorial](http://webdesign.tutsplus.com/tutorials/postcss-deep-dive-create-your-own-plugin--cms-24605)
Вы также можете посмотреть на уже написанные плагины [PostCSS Plugins](https://github.com/postcss/postcss/blob/master/docs/plugins.md)

**стиль посетитель** - для тех, кто имеете опыт написания плагинов для PostCSS.
Плагин подписывается на нужный тип узла. Само ядро PostCSS 
осуществляет обход AST дерева. Все плагины обрабатываются параллельно, а, следовательно, 
быстрее. Если вы писали Babel-плагины, то написать PostCSS плагин будет просто. 
Писать плагины в этом стиле предпочтительнее, так как это ускоряет обработку 
файла стилей за счет параллельной работы плагинов. АПИ для посетителя достаточно простое.
Писать плагины в таком стиле не сложнее, чем в объектном стиле

### Пишем плагин объектном стиле

##### Шаг 1
Возьмите [postcss-plugin-boilerplate](https://github.com/postcss/postcss-plugin-boilerplate)

##### Шаг 2
Решили писать в объектном стиле - изучите АПИ по работе с PostCSS [http://api.postcss.org](http://api.postcss.org/postcss.html).
Чтобы лучше изучить и понять АПИ, можно поиграться в песочнице [AST Explorer](https://astexplorer.net/),
выбрав сответствующий раздел. (CSS → CSS; Transform → postcss;)

##### Шаг 3
В шаблонном коде есть строчка: `return function (root, result) { }`
Здесь плагину в переменной `root` передается весь файл стиля в виде AST дерева.
Решите, какой с каким типом узла необходимо работать. Это можно определить, изучив 
пример в песочнице [AST Explorer](https://astexplorer.net/)

С помощью методов `walk` (а именно: 
[walk](http://api.postcss.org/Root.html#walk), 
[walkAtRules](http://api.postcss.org/Root.html#walkAtRules), 
[walkComments](http://api.postcss.org/Root.html#walkComments), 
[walkDecls](http://api.postcss.org/Root.html#walkDecls), 
[walkRules](http://api.postcss.org/Root.html#walkRules))
вы можете найти интересующий узел.

**Нет необходимости вкладывать их друг в друга**. Достаточно использовать любой из них.

Пример: нужно найти свойство `animation-play-state`
```javascript
return function(root) {
  root.walkDecls('animation-play-state', function(decl) {
    decl.cloneBefore({
      prop: '-webkit-animation-play-state',
      value: decl.value,
    });
  });
}
```

##### Шаг 4
Внести изменения в найденный узел.
Есть два способа внести изменения:
- через методы [cloneBefore](http://api.postcss.org/Node.html#cloneBefore) и [cloneAfter](http://api.postcss.org/Node.html#cloneAfter) 
- через методы создания
[atRule](http://api.postcss.org/postcss.html#.atRule),
[comment](http://api.postcss.org/postcss.html#.comment),
[decl](http://api.postcss.org/postcss.html#.decl),
[rule](http://api.postcss.org/postcss.html#.rule).
Не забудьте указать [source](http://api.postcss.org/Node.html#source).
 
Например, нужно найти свойство `animation-play-state`
```javascript
return function(root) {
  root.walkDecls('animation-play-state', function(decl) {
    decl.cloneAfter({ prop: '-moz-' + decl.prop })
  });
}
```

##### Шаг 5
Для большего понимания - изучаете статью [Writing Your First PostCSS Plugin](https://dockyard.com/blog/2018/02/01/writing-your-first-postcss-plugin)
Так же можете посмотреть примеры уже написанных плагинов [PostCSS Plugins](https://github.com/postcss/postcss/blob/master/docs/plugins.md)

### Пишем плагин в стиле посетитель

##### Шаг 1
Пока нет шаблонного генератора кода, можно воспользоваться следующим шаблоном:
```javascript
var postcss = require('postcss')

module.exports = postcss.plugin('PLUGIN_NAME', function() {
  return function(root) {
    root.on('TYPE_NODE', node => {
      // your code
    });
  };
});
````

##### Шаг 2
Решили писать плагин в стиле посетитель - изучите АПИ по работе с PostCSS [http://api.postcss.org](http://api.postcss.org/postcss.html).
Чтобы лучше изучить и понять АПИ можно поиграться в песочнице [AST Explorer](https://astexplorer.net/)
выбрав сответствующий раздел. (CSS → CSS; Transform → postcss;)

##### Шаг 3
Решите, какой с каким типом узла необходимо работать. Это можно определить - изучив 
пример в песочнице [AST Explorer](https://astexplorer.net/)

##### Шаг 4
Подпишитесь на этот тип узла. 
Пример: подпишимся на тип узла `decl`
```javascript
root.on('decl', node => {
  // your code
});
````
Ваш код будет получать только `decl` узлы.

##### Шаг 5
Внести изменения в найденный узел (`node`).
Есть два способа внести изменения:
- через методы [cloneBefore](http://api.postcss.org/Node.html#cloneBefore) и [cloneAfter](http://api.postcss.org/Node.html#cloneAfter) 
- через методы создания
[atRule](http://api.postcss.org/postcss.html#.atRule),
[comment](http://api.postcss.org/postcss.html#.comment),
[decl](http://api.postcss.org/postcss.html#.decl),
[rule](http://api.postcss.org/postcss.html#.rule).
Не забудьте указать [source](http://api.postcss.org/Node.html#source). 

### Фазы обхода AST дерева
Плагин можно зарегистрировать для разных фаз обхода:
- на фазе `enter` (по умолчанию). Пример: `css.on("decl.enter", (node, index) => {})` 
Это равнозначно `css.on("decl", (node, index) => {})`. Эта фаза происходит при входе в узел.
- на фазе `exit`. Пример: `css.on("decl.exit", (node, index) => {})`. 
Эта фаза происходит, когда узел полностью обошли.

**Пример**
```css
@media screen and (min-width: 1024px) {
  body { 
    background-color: lightgreen; 
    padding: 10px; 
  }
  p {
    color: #f15a22;
    font-size: 16px;
  }
}
```

Последовательность обхода следующая:
```
1.  enter:  atrule  (media)
2.  enter:  rule    (body)
3.  enter:  decl    (background-color: lightgreen)
4.  exit:   decl    (background-color: lightgreen)
5.  enter:  decl    (padding: 10px)
6.  exit:   decl    (padding: 10px)
7.  exit:   rule    (body)
8.  enter:  rule    (p)
9.  enter:  decl    (color: #f15a22)
10. exit:   decl    (color: #f15a22)
11. enter:  decl    (font-size: 16px)
12. exit:   decl    (font-size: 16px)
13. exit:   rule    (p)
14. exit:   atrule  (media)
```

Подробнее про фазы можно посмотреть [Tree_traversal]()https://en.wikipedia.org/wiki/Tree_traversal).
В данной статье следует считать, что `Pre-order === enter`, а `Post-order === exit`

### Пример конвертации плагина из объектного стиля в плагин в стиле посетитель 

Для простоты - рассмотрим плагин [postcss-will-change](https://github.com/postcss/postcss-will-change).

В объектном стиле он имеет вид:
```javascript
var postcss = require('postcss')

module.exports = postcss.plugin('postcss-will-change', function() {
  return function(css) {
    css.walkDecls('will-change', function(decl) {
      var already = decl.parent.some(function(i) {
        return i.type === 'decl' && i.prop === 'backface-visibility';
      });

      if (already) return;

      decl.cloneBefore({
        prop: 'backface-visibility',
        value: 'hidden',
      });
    });
  };
});
```

Перепишем его в стиле посетитель:
```javascript
var postcss = require('postcss')

module.exports = postcss.plugin('postcss-will-change', function() {
  return function(css) {
    css.on('decl', node => {
      if (node.prop !== 'will-change') {
        return;
      }

      let already = node.parent.some(function(i) {
        return i.type === 'decl' && i.prop === 'backface-visibility';
      });

      if (already) return;

      node.cloneBefore({
        prop: 'backface-visibility',
        value: 'hidden',
      });
    });
  };
});
```

Объяснение:

Подписываемся на тип узла `'decl'`
```javascript 
css.on('decl', … );
```  

Правило фильтрации `css.walkDecls('will-change', … ` заменяется на 
```javascript
if (node.prop !== 'will-change') {
  return;
}
``` 
Т.к. в функцию обратного вызова css.on('decl', `node => { … }` … ) попадают все узлы, необходимо выбрать нужный.  

ВСЁ. Всё остальное осталось без изменений.

## Getting Started

* [Writing Your First PostCSS Plugin](https://dockyard.com/blog/2018/02/01/writing-your-first-postcss-plugin)
* [Create Your Own Plugin tutorial](http://webdesign.tutsplus.com/tutorials/postcss-deep-dive-create-your-own-plugin--cms-24605)
* [Plugin Boilerplate](https://github.com/postcss/postcss-plugin-boilerplate)
* [Plugin Guidelines](https://github.com/postcss/postcss/blob/master/docs/guidelines/plugin.md)
* [AST explorer with playground](http://astexplorer.net/#/2uBU1BLuJ1)

## Documentation and Support

* [PostCSS API](http://api.postcss.org/)
* [Ask questions](https://gitter.im/postcss/postcss)
* [PostCSS twitter](https://twitter.com/postcss) with latest updates.

## Tools

* [Selector parser](https://github.com/postcss/postcss-selector-parser)
* [Value parser](https://github.com/TrySound/postcss-value-parser)
* [Property resolver](https://github.com/jedmao/postcss-resolve-prop)
* [Function resolver](https://github.com/andyjansson/postcss-functions)
* [Font parser](https://github.com/jedmao/parse-css-font)
* [Dimension parser](https://github.com/jedmao/parse-css-dimension)
  for `number`, `length` and `percentage`.
* [Sides parser](https://github.com/jedmao/parse-css-sides)
  for `margin`, `padding` and `border` properties.
* [Font helpers](https://github.com/jedmao/postcss-font-helpers)
* [Margin helpers](https://github.com/jedmao/postcss-margin-helpers)
* [Media query parser](https://github.com/dryoma/postcss-media-query-parser)
