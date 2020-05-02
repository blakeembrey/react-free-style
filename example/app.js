import * as React from "react";
import { render } from "react-dom";
import { styled, Context, StyleSheetRenderer } from "../dist";

const Container = styled("div", (freeStyle) => {
  freeStyle.registerStyle({
    $global: true,
    body: {
      fontFamily: "sans-serif",
      margin: 0,
    },
  });

  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100vw",
    height: "100vh",
  };
});

const Pre = styled("pre", {
  margin: 10,
  maxWidth: 300,
  wordBreak: "break-all",
  whiteSpace: "normal",
});

function randomColor() {
  return (
    "#" + `000000${((Math.random() * 0xffffff) | 0).toString(16)}`.slice(-6)
  );
}

const App = () => {
  const Style = React.useContext(Context);
  const [color, setColor] = React.useState();

  return React.createElement(
    Container,
    { css: { backgroundColor: color } },
    React.createElement(
      "button",
      { onClick: () => setColor(randomColor()) },
      "Random Color"
    ),
    React.createElement(Pre, {}, Style.toCss())
  );
};

render(
  React.createElement(
    Context.Provider,
    { value: new StyleSheetRenderer() },
    React.createElement(App)
  ),
  document.body
);
