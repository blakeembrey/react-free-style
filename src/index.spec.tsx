import * as React from "react";
import { renderIntoDocument } from "react-dom/test-utils";
import { renderToStaticMarkup } from "react-dom/server";
import { join, styled } from "./index";

describe("index", () => {
  it("should support styled components", () => {
    const Button = styled("button", {
      color: "red"
    });

    expect(renderToStaticMarkup(<Button />)).toEqual(
      `<button class="${Button.style[0]}"></button>`
    );

    expect(renderToStaticMarkup(<Button>Hello world!</Button>)).toEqual(
      `<button class="${Button.style[0]}">Hello world!</button>`
    );

    expect(
      renderToStaticMarkup(
        <Button>
          <i className="test" /> Hello world!
        </Button>
      )
    ).toEqual(
      `<button class="${
        Button.style[0]
      }"><i class="test"></i> Hello world!</button>`
    );

    expect(
      renderToStaticMarkup(<Button className="test">Text</Button>)
    ).toEqual(`<button class="test ${Button.style[0]}">Text</button>`);
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
      join(
        {
          fontSize: 10
        },
        Button.style
      )
    );

    expect(renderToStaticMarkup(<LargeButton />)).toEqual(
      `<button class="${LargeButton.style[0]}"></button>`
    );

    expect(LargeButton.style[0]).toMatch(/button_styled_\w+ button_styled_\w+/);
  });
});
