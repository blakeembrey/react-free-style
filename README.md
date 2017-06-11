# React Free Style

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Greenkeeper badge](https://badges.greenkeeper.io/blakeembrey/react-free-style.svg)](https://greenkeeper.io/)

**React Free Style** is designed to combine the benefits of [Free Style](https://github.com/blakeembrey/free-style) with [React.js](https://github.com/facebook/react) by automatically managing the style state of React components and updating the `<style />` component. This works even better with server-side rendering, as only the styles on the current page will be sent to clients.

## Why?

Check out why you should be [doing CSS in JS](https://github.com/blakeembrey/free-style#why). This module exposes the API directly to React.js.

**Even more improvements with React Free Style**

* Modular React.js components (automatically namespaced CSS)
* Fast renders with automatic style mounting (outputs only the styles on the current page)
* Supports isomorphic applications

## Installation

```
npm install react-free-style --save
```

## Usage

```js
import { styled } from 'react-free-style'

const App = styled({
  text: {
    backgroundColor: 'red'
  }
})((props) => {
  return <div className={props.styles.text}>Hello world!</div>
})

// Render the application to the document.
React.render(<App />, document.body)
```

### Server Usage

```js
ReactDOM.renderToString(<Handler />);

const styles = ReactFreeStyle.rewind()

// Use as a React component.
function html () {
  return (
    <html>
      <head>
        {styles.toComponent()}
      </head>
      <body>
        <div id="content">
          // React stuff here.
        </div>
      </body>
    </html>
  )
}

// Use as a string.
const html = `
  <!doctype html>
  <html>
    <head>
      ${styles.toString()}
    </head>
    <body>
      <div id="content">
        // React stuff here.
      </div>
    </body>
  </html>
`

// Use the CSS only.
const css = styles.toCss()
```

### HOC

The `styled` function accepted a keyed map of styles and maps the styles to class names. It returns a HOC which provides the `styles` and `freeStyle` props to the component.

```js
const withStyle = styled({
  button: {
    color: 'red'
  }
})

export default withStyle(props => {
  props.freeStyle.registerCss({
    html: {
      color: '#111'
    }
  })

  return <button className={props.styles.button}>Test</button>
})
```

**Tip:** `Style` and `styles` are properties of the HOC function so you can alter the styles (e.g. `registerKeyframes`, `registerCss`) before rendering.

### `registerStyleSheet`

Exports a small helper function for registering a map of styles (e.g. `styled`).

```js
import { create, registerStyleSheet } from 'react-free-style'

const Style = FreeStyle.create()

export const styles = registerStyleSheet(Style, {
  button: {
    color: 'red'
  },
  text: {
    color: 'blue'
  }
})
```

### Free-Style Methods

Supports registering a [style](https://github.com/blakeembrey/free-style#styles), [keyframes](https://github.com/blakeembrey/free-style#keyframes), [rule](https://github.com/blakeembrey/free-style#rules) or [CSS object](https://github.com/blakeembrey/free-style#css-object) on the `context.freeStyle` and the result of `create()` (which is a `free-style` instance).

### Dynamical Styles Using Context

```js
import { wrap, ReactFreeStyleContext } from 'react-free-style'

class MyComponent extends React.Component {

  static contextTypes = ReactFreeStyleContext

  componentWillMount () {
    // Or: `registerKeyframes`, `registerRule`, `registerCss`.
    this.inlineClassName = this.context.freeStyle.registerStyle(this.props.style)
  }

  render () {
    return React.createElement(
      'button',
      {
        className: this.inlineClassName
      },
      this.props.children
    )
  }

}

export default wrap(MyComponent)
```

#### And With Stateless React Components

```js
import { wrap, ReactFreeStyleContext } from 'react-free-style'

const MyComponent = (props, context) => {
  const className = context.freeStyle.registerStyle({ color: 'blue' })

  return <span className={className}>hello world</span>
}

MyComponent.contextTypes = ReactFreeStyleContext

export default wrap(MyComponent)
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
