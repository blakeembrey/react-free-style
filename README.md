# React Free Style

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

**React Free Style** was designed to combine the benefits of [Free Style](https://github.com/blakeembrey/free-style) with [React.js](https://github.com/facebook/react) by automatically managing the style state of React components and re-rendering `<style />`. This even works with server-side rendering.

## Installation

```
npm install react-free-style --save
```

## Usage

```js
var Style = require('react-free-style').create()

var TEXT_STYLE = Style.registerStyle({
  backgroundColor: 'red'
})

var App = Reacte.createClass({

  mixins: [Style.Mixin],

  render: function () {
    return (
      <div>
        <div className={TEXT_STYLE.className}>Hello world!</div>
        <Style.Element />
      </div>
    )
  }

})

React.render(React.createElement(App), document.body)
```

**Please note:** `<Style.Element />` should be rendered last if you want to support server-side rendering. This is a limitation with React.js because we can not trigger the state updates that are required by the mixin for inline styles.

### Register Style

Register a [name spaced style](https://github.com/blakeembrey/free-style#namespaced-styles) object.

```js
Style.registerStyle({
  backgroundColor: 'red',
  padding: 10
})
```

### Register Keyframes

Register a [name spaced keyframes](https://github.com/blakeembrey/free-style#keyframes) object.

```js
Style.registerKeyframes({
  from: { color: 'red' },
  to: { color: 'blue' }
})
```

### Dynamic Styles

Inline (dynamic) styles can be registered using the `registerStyle` and `registerKeyframes` methods on your React component. Any styles registered will follow the React lifecycle and automatically remove when the component is unmounted.

```js
var Style = require('react-free-style').create()

var BUTTON_STYLE = Style.registerStyle({
  backgroundColor: 'red',
  padding: 10
})

var ButtonComponent = React.createClass({

  mixins: [Style.Mixin],

  componentWillMount: function () {
    this.inlineStyle = this.registerStyle(this.props.style)
  },

  render: function () {
    return <button className={Style.join(this.inlineStyle.className, BUTTON_STYLE.className)}>{this.props.children}</button>
  }

})

var App = React.createClass({

  mixins: [Style.Mixin],

  render: function () {
    return <div><ButtonComponent>Hello world!</ButtonComponent><Style.Element /></div>
  }

})

React.render(React.createElement(App), document.body)
```

**Please note:** Inline style registration can not occur in the `render` method.

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
