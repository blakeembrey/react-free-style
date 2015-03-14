# React Free Style

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

**React Free Style** is designed to combine the benefits of [Free Style](https://github.com/blakeembrey/free-style) with [React.js](https://github.com/facebook/react) by automatically managing the style state of React components.

## Installation

```sh
npm install react-free-style --save
```

## Usage

```js
var style = require('react-free-style').create()

var STYLE = freeStyle.registerClass({
  backgroundColor: 'red'
})

React.render(
  <div className={STYLE.className}>Hello world!</div>,
  document.body
)
```

### Register Class

Register [name spaced styles](https://github.com/blakeembrey/free-style#namespaced-styles) for the component.

```js
style.registerClass({
  backgroundColor: 'red',
  padding: 10
})
```

### Register Keyframes

Register [name spaced keyframes](https://github.com/blakeembrey/free-style#keyframes) for the component.

```js
freeStyle.registerKeyframes({
  from: { color: 'red' },
  to: { color: 'blue' }
})
```

### Mixin

Use the mixin to automatically attach and detach styles when the component is mounted. The mixin will also add `registerClass` and `registerKeyframes` methods to the component for temporary inline styles.

```js
var style = require('react-free-style').create()

var BUTTON_STYLE = style.registerClass({
  backgroundColor: 'red',
  padding: 10
})

module.exports = React.createClass({

  mixin: [style.Mixin]

  render: function () {
    var inlineStyle = this.registerClass(this.props.style)

    return <button className={style.join(inlineStyle.className, BUTTON_STYLE.className)} />
  }

})
```

## License

MIT license

[npm-image]: https://img.shields.io/npm/v/react-free-style.svg?style=flat
[npm-url]: https://npmjs.org/package/react-free-style
[downloads-image]: https://img.shields.io/npm/dm/react-free-style.svg?style=flat
[downloads-url]: https://npmjs.org/package/react-free-style
[travis-image]: https://img.shields.io/travis/blakeembrey/react-free-style.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/react-free-style
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/react-free-style.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/react-free-style?branch=master
