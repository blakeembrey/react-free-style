import * as React from "react";
import { render } from "react-dom";
import { createStyles, Context, StyleSheetRenderer } from "../dist";

const useStyles = createStyles(
  {
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100vw",
      height: "100vh"
    }
  },
  {
    body: {
      fontFamily: "sans-serif",
      margin: 0
    }
  }
);

function randomColor() {
  return (
    "#" + `000000${((Math.random() * 0xffffff) | 0).toString(16)}`.slice(-6)
  );
}

const App = () => {
  const styles = useStyles();
  const [color, setColor] = React.useState();
  const dynamicStyles = createStyles({
    background: { backgroundColor: color }
  })();

  return React.createElement(
    "div",
    { className: `${dynamicStyles.background} ${styles.container}` },
    React.createElement(
      "button",
      { onClick: () => setColor(randomColor()) },
      "Random Color"
    )
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
