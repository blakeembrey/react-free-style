# React Free Style

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

**React Free Style** combines [Free Style](https://github.com/blakeembrey/free-style) with [React.js](https://github.com/facebook/react) by managing the style of React components and updating the `<style />`. This works wonderfully with server-side rendering, where only styles of the currently rendered components will delivered.

## Why?

Check out why you should be [doing CSS in JS](https://github.com/blakeembrey/free-style#why). This module exposes the API directly to React.js.

**Even more improvements with React Free Style**

* Modular React.js components
* Style debugging in development mode
* Fast renders with automatic style for rendered React components
* Supports universal/isomorphic applications

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

Exports [`helpers`](https://github.com/blakeembrey/style-helper) and [`FreeStyle`](https://github.com/blakeembrey/free-style). Supports options from [`registerStyleSheet`](https://github.com/blakeembrey/style-helper#register-style-sheet) with `styled(sheet, options?)`.

### HOC

The `styled` function accepted an object of styles and maps the styles to CSS class names. It returns a HOC which provides the `styles` prop to the component (merged with passed props).

```js
const withStyle = styled({
  button: {
    color: 'red'
  },
  {
    css: {
      'html, body': {
        width: '100%',
        height: '100%',
        margin: 0
      }
    }
  }
})

export default withStyle(props => {
  return <button className={props.styles.button}>Test</button>
})
```

Styles can also be functions:

```js
{
  button: (styles, keyframes, hashRules) => ({
    animation: `${keyframes.keyframe} 0.6s linear`,
    animationIterationCount: 'infinite'
  })
}
```

By default, the `styles` prop will merge with `styles` passed into the component from above. To skip this behaviour, use `styled().styles` instead of `props.styles`.

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
          // React rendering here.
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
        ${/* React rendering here. */}
      </div>
    </body>
  </html>
`

// Output CSS only.
const css = styles.toCss()
```

### Free-Style Methods

The second argument to `withStyles` and third argument to `wrap` is `withFreeStyle`. When `true`, `freeStyle` is merged with the component props for runtime CSS (supports [styles](https://github.com/blakeembrey/free-style#styles), [keyframes](https://github.com/blakeembrey/free-style#keyframes), [rules](https://github.com/blakeembrey/free-style#rules) and [CSS objects](https://github.com/blakeembrey/free-style#css-object)).

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
