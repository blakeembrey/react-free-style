# React Free Style

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Bundle size][bundlephobia-image]][bundlephobia-url]

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

### Styled

```js
import { styled } from "react-free-style";

const Button = styled("button", {
  backgroundColor: "red",
});

const App = () => {
  return <Button css={{ color: "blue" }}>Hello world!</Button>;
};
```

### JSX

```js
/** @jsx jsx */

import { jsx } from "react-free-style";

const App = () => {
  return (
    <button css={{ color: "blue", backgroundColor: "red" }}>
      Hello world!
    </button>
  );
};
```

### Imperative

```js
import { css, useCss } from "react-free-style";

// Creates "cached CSS":
const style = css({ color: "red" });
// But you can also write `const style = { color: "red" }`.

const Button = () => {
  const className = useCss(style);

  return <button className={className}>Hello world!</button>;
};
```

This is how the [`styled`](#styled) and [`jsx`](#jsx) work! Knowing how it works can help you when you need to extract the class name for integrating with an existing UI library using `className`.

## Recipes

### Valid Styles

Every CSS method accepts:

- CSS-in-JS object
- String, i.e. a class name
- Cached CSS, created using the `css(...)` method
- Computed CSS, a function which accepts `Style` and returns a valid style
- Array of the above

### Composition

Components created using `styled` expose "cached CSS" on the `style` property.

```js
const LargeButton = styled("button", [
  {
    fontSize: 16,
  },
  Button.style,
  {
    marginBottom: 8,
  },
]);
```

### Animations

A "computed CSS" function can be used to register and use `@keyframes`.

```ts
import { css } from "react-free-style";

const style = css((Style) => {
  const animationName = Style.registerStyle({
    $global: true,
    "@keyframes &": styles,
  });

  return { animationName };
});
```

## Themes

### CSS Variables

The most effective CSS themes I've seen use [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) to dynamically change styles.

```js
// Register this CSS wherever you want the theme to apply, e.g. `:root`.
const theme = {
  "--color": "red",
};

const Button = styled("button", {
  color: "var(--color)",
});

// Later on you can change the theme.
const style = css({
  "--color": "blue",
});
```

### Context

Use `React.Context` to define a theme and custom components with `css` props.

```js
const ThemeContext = React.createContext({
  color: "red",
});

const Button = () => {
  const theme = React.useContext(ThemeContext);

  return <button css={{ color: theme.color }}>Hello world!</button>;
};
```

## Rendering

By default, CSS output is discarded (a "no op" useful for testing) because you may have different output requirements depending on the environment.

### Client-side Rendering

`StyleSheetRenderer` is an efficient CSS renderer for browsers.

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
[travis-image]: https://img.shields.io/travis/com/blakeembrey/react-free-style.svg?style=flat
[travis-url]: https://travis-ci.com/github/blakeembrey/react-free-style
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/react-free-style.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/react-free-style?branch=master
[bundlephobia-image]: https://img.shields.io/bundlephobia/minzip/react-free-style.svg
[bundlephobia-url]: https://bundlephobia.com/result?p=react-free-style
