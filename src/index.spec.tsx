import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createStyles, MemoryRenderer, Context, STYLE_ID } from ".";

describe("react free style", function() {
  it("should render using hooks", function() {
    const useStyles = createStyles(
      {
        text: {
          backgroundColor: "red"
        }
      },
      {
        "*": {
          boxSizing: "border-box"
        }
      }
    );

    const App = () => {
      const styles = useStyles();

      return <div className={styles.text}>Hello world!</div>;
    };

    const renderer = new MemoryRenderer();

    expect(
      renderToStaticMarkup(
        <Context.Provider value={renderer}>
          <App />
        </Context.Provider>
      )
    ).toEqual(`<div class="${useStyles.styles.text}">Hello world!</div>`);

    const expectedCss = `.${
      useStyles.styles.text
    }{background-color:red}*{box-sizing:border-box}`;

    expect(renderer.toCss()).toEqual(expectedCss);
    expect(renderer.toString()).toEqual(
      `<style id="${STYLE_ID}">${expectedCss}</style>`
    );
  });
});
