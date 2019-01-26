import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createStyles, MemoryRenderer, Context, STYLE_ID, styled } from ".";

describe("react free style", () => {
  it("should render using hooks", () => {
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

  it("should support styled components", () => {
    const Button = styled("button", {
      color: "red"
    });

    expect(renderToStaticMarkup(<Button />)).toEqual(
      `<button class="${Button.styles.style}"></button>`
    );

    expect(renderToStaticMarkup(<Button>Hello world!</Button>)).toEqual(
      `<button class="${Button.styles.style}">Hello world!</button>`
    );

    expect(
      renderToStaticMarkup(
        <Button>
          <i className="test" /> Hello world!
        </Button>
      )
    ).toEqual(
      `<button class="${
        Button.styles.style
      }"><i class="test"></i> Hello world!</button>`
    );

    expect(
      renderToStaticMarkup(<Button className="test">Text</Button>)
    ).toEqual(`<button class="${Button.styles.style} test">Text</button>`);
  });
});
