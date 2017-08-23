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

Exports [`helpers`](https://github.com/blakeembrey/style-helper) and [`FreeStyle`](https://github.com/blakeembrey/free-style). Supports options from [`registerStyleSheet`](https://github.com/blakeembrey/style-helper#register-style-sheet) in `styled(sheet, options?, hash?, debug?)`.

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

**Tip!** If you're hydrating React on the client-side, feel free to remove the server rendered styles _after_ hydration (e.g. `document.head.removeChild(document.getElementById(FreeStyle.STYLE_ID))`).

### HOC

The `styled` function accepted a keyed map of styles and maps the styles to class names. It returns a HOC which provides the `styles` prop to the component (in addition to existing props).

```js
const withStyle = styled({
  button: {
    color: 'red'
  }
})

withStyle.Style.registerCss({
  'html, body': {
    width: '100%',
    height: '100%',
    margin: 0
  }
})

export default withStyle(props => {
  return <button className={props.styles.button}>Test</button>
})
```

**P.S.** The `styles` property will merge with any styles passed into the styled component. If you don't want this feature, use the `styles` object on `withStyles` HOC instead of `props.styles`.

### Free-Style Methods

The second argument to `withStyles` and third argument to `wrap` is `withFreeStyle`. When `true`, `freeStyle` is merged with the component props for inline styles. It supports [styles](https://github.com/blakeembrey/free-style#styles), [keyframes](https://github.com/blakeembrey/free-style#keyframes), [rules](https://github.com/blakeembrey/free-style#rules) and [CSS objects](https://github.com/blakeembrey/free-style#css-object) during render/runtime.

### Using `wrap(...)`

```js
import { wrap, FreeStyle } from 'react-free-style'

const Style = FreeStyle.create()

const myClassName = Style.registerStyle({
  color: 'red'
})

class MyComponent extends React.Component {

  render () {
    const inlineClassName = this.props.freeStyle.registerStyle(props.style)

    return React.createElement(
      'button',
      {
        // Class names from `props`, `Style` and runtime context.
        className: `${this.props.className} ${myClassName} ${this.props.inlineClassName}`
      },
      this.props.children
    )
  }

}

// Change `props` using the style callback.
export default wrap(MyComponent, Style, true)
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
