# React Free Style

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

**React Free Style** combines [Free Style](https://github.com/blakeembrey/free-style) with [React.js](https://github.com/facebook/react) by managing the style of React components dynamically. Works with server-side rendering, where only styles of rendered components will print.

## Why?

Check out why you should be [doing CSS in JS](https://github.com/blakeembrey/free-style#why). This module exposes the API directly to React.js.

**Even more improvements with React Free Style**

- Modular React.js components
- Style debugging in development mode
- Fast renders with automatic style for rendered React components
- Supports universal/isomorphic applications

## Installation

```
npm install react-free-style --save
```

## Usage

**Note:** This release requires [React.js hooks](https://reactjs.org/docs/hooks-intro.html) since it uses `useContext` and `useEffect` internally.

```js
import { createStyles } from "react-free-style";

const useStyles = createStyles({
  text: {
    backgroundColor: "red"
  }
});

const App = () => {
  const styles = useStyles();

  return <div className={styles.text}>Hello world!</div>;
};

// Render the application to the document.
React.render(<App />, document.body);
```

**Hot Tip:** You can create dynamic styles inline by invoking `createStyles({})()` inside `render()`.

### Client-side Rendering

`StyleSheetRenderer` is an efficient CSS renderer for DOM using `CSSStyleSheet` directly with `.insertRule()`.

```js
import { StyleSheetRenderer, Context } from "react-free-style";

// const renderer = new NoopRenderer();
const renderer = new StyleSheetRenderer();

React.render(
  <Context.Provider value={renderer}>
    <App />
  </Context.Provider>,
  document.body
);
```

### Server-side Rendering

`MemoryRenderer` collects all styles in-memory for output at a later time.

```js
import { MemoryRenderer, Context } from "react-free-style";

// const renderer = new NoopRenderer();
const renderer = new MemoryRenderer();

const content = ReactDOM.renderToString(
  <Context.Provider value={renderer}>
    <App />
  </Context.Provider>,
  document.body
);

const html = `
<!doctype html>
<html>
  <head>
    ${renderer.toString()}
  </head>
  <body>
    <div id="content">
      ${content}
    </div>
  </body>
</html>
`;
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
