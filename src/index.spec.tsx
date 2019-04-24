import * as React from "react";
import { renderIntoDocument } from "react-dom/test-utils";
import { renderToStaticMarkup } from "react-dom/server";
import {
  createStyles,
  MemoryRenderer,
  Context,
  STYLE_ID,
  styled,
  composeStyle
} from "./index";

describe("index", () => {
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
      `<button class="${Button.styleName}"></button>`
    );

    expect(renderToStaticMarkup(<Button>Hello world!</Button>)).toEqual(
      `<button class="${Button.styleName}">Hello world!</button>`
    );

    expect(
      renderToStaticMarkup(
        <Button>
          <i className="test" /> Hello world!
        </Button>
      )
    ).toEqual(
      `<button class="${
        Button.styleName
      }"><i class="test"></i> Hello world!</button>`
    );

    expect(
      renderToStaticMarkup(<Button className="test">Text</Button>)
    ).toEqual(`<button class="test ${Button.styleName}">Text</button>`);
  });

  it("should correctly forward refs", () => {
    const ref = React.createRef<HTMLButtonElement>();
    const Button = styled("button", {});

    renderIntoDocument(<Button ref={ref}>Test</Button>);

    expect(ref.current).not.toBeNull();
  });

  it("should compose styled components", () => {
    const Button = styled("button", {
      color: "red"
    });

    const LargeButton = styled(
      "button",
      composeStyle(
        {
          fontSize: 10
        },
        Button
      )
    );

    expect(renderToStaticMarkup(<LargeButton />)).toEqual(
      `<button class="${LargeButton.styleName}"></button>`
    );

    expect(LargeButton.styleName).toMatch(/button_styled_\w+ button_styled_\w+/)
  });
});
