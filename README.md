# React Free Style

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

**React Free Style** is designed to combine the benefits of [Free Style](https://github.com/blakeembrey/free-style) with [React.js](https://github.com/facebook/react) by automatically managing the style state of React components and updating the `<style />` component. This works even better with server-side rendering, as only the styles on the current page will be sent to clients.

## Why?

Check out why you should be [doing CSS in JS](https://github.com/blakeembrey/free-style#why). This module exposes the API directly to React.js.

**Even more improvements with React Free Style**

* Modular React.js components (automatically namespaced CSS)
* Fast renders with automatic style mounting (outputs only the styles on page)
* Supports isomorphic applications by default

## Installation

```
npm install react-free-style --save
```

## Usage

```js
// Create a style instance for the component.
var Style = require('react-free-style').create()

// Register some styles.
var TEXT_STYLE = Style.registerStyle({
  backgroundColor: 'red'
})

// Create a React component (also rendering the `Style.Element` component).
var App = React.createClass({

  render: function () {
    return (
      <div className={TEXT_STYLE}>
        Hello world!

        <Style.Element />
      </div>
    )
  }

})

// Wrap `App` to create a component with style merging.
App = Style.component(App)

// Render to the document.
React.render(<App />, document.body)
```

**Note:** You should render `Style.Element` at the root level of your application, but it must be a child of `Style.component()`. I recommend rendering it last so it receives all styles after the first render (required for isomorphic applications).

### Styles

Register a [style](https://github.com/blakeembrey/free-style#styles).

```js
Style.registerStyle({
  backgroundColor: 'red',
  padding: 10
})
```

### Keyframes

Register [keyframes](https://github.com/blakeembrey/free-style#keyframes).

```js
Style.registerKeyframes({
  from: {
    color: 'red'
  },
  to: {
    color: 'blue'
  }
})
```

### Rules

Register [rule](https://github.com/blakeembrey/free-style#rules).

```js
Style.registerRule('@media print', {
  body: {
    color: 'red'
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
