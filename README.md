# babel-plugin-imports-transform

分为两种情形使用：index.js文件作为Babel插件来使用，而index-transform.js可以在js代码中单独调用函数来使用。  

会将下面的import代码:

```javascript
    import { Row, Grid as MyGrid } from 'react-bootstrap';
    import { merge } from 'lodash';
```

转化为引入单个对应文件:

```javascript
    import Row from 'react-bootstrap/lib/Row';
    import MyGrid from 'react-bootstrap/lib/Grid';
    import merge from 'lodash/merge';
```


## 为什么要这么做？

当Babel遇到下面的模块引入代码的时候:

```javascript
    import { Grid, Row, Col } from 'react-bootstrap';
```

它会简单的把上面的代码编译为下面的代码:

```javascript
    var reactBootstrap = require('react-bootstrap');
    var Grid = reactBootstrap.Grid;
    var Row = reactBootstrap.Row;
    var Col = reactBootstrap.Col;
```

一些库, 比如 `react-bootstrap` 和 `lodash`, 其体积是相当大的，如果只是使用其中的部分API的话，上面的代码也会把整个库打包进去，从而导致打出的包的体积会特别大。唯一的处理方式是只引入对应的子模块:

```javascript
    import Grid from 'react-bootstrap/lib/Grid';
    import Row from 'react-bootstrap/lib/Row';
    import Col from 'react-bootstrap/lib/Col';
```

但是，我们引用的部分越多，上面的代码写的就会越多。 而这个插件可以让你用简单的语法来引入对应的模块，只打包对应的文件，而不是将整个库打包进去。  
另外，这个插件可以配置：如果某个同学书写了`会打包进整个库`的代码的话就会抛出异常，比如:

```javascript
    import Bootstrap, { Grid } from 'react-bootstrap';
    // -- or --
    import * as Bootstrap from 'react-bootstrap';
```

## 安装

```
npm install --save-dev babel-plugin-imports-transform
```

## 使用

*In .babelrc:*

```json
    {
        "plugins": [
            ["babel-plugin-imports-transform", {
                "next": {
                    "transform": "next/lib/${member-lowercase}",
                    "preventFullImport": true,
                    "style": "next/lib/${member-lowercase}/index.scss",
                },
                "lodash": {
                    "transform": "lodash/${member}",
                    "preventFullImport": true
                }
            }]
        ]
    }
```

## style支持

如上面的示例，我们支持如果配置了style属性我们会自动帮引入style文件，而且会做只能匹配，只有该样式文件存在的情形下才会做对应的引入，否则不引入。  

## 高级转换

默认提供的字符串替换的转换形式并不能满足所有的需求，比如，需要对import的名字进行正则匹配的情形下，你可以提供行一个js文件路径，该文件exports出一个执行函数来替代字符串的转换。记住，.js文件的路径需要是根据这个插件的相对路径，一般这个插件的路径都是：`/node_modules/babel-plugin-imports-transform`。你可以提供任意的文件名字，只要以.js结尾。  

示例如下：

.babelrc:
```json
    {
        "plugins": [
            ["babel-plugin-imports-transform", {
                "my-library": {
                    "transform": "../../path/to/transform.js",
                    "preventFullImport": true
                }
            }]
        ]
    }
```

/path/to/transform.js:
```js
module.exports = function(importName) {
    return 'my-library/etc/' + importName.toUpperCase();
};
```

这有点hack,但是是因为.babelrc配置文件是一个纯JSON，值只能配置字符串而不能配置函数。 在Babel 7.0, 貌似.babelrc.js配置文件会被提供, 到时候这个插件会被升级来支持配置函数。  
相关问题参考: https://github.com/babel/babel/pull/4892
