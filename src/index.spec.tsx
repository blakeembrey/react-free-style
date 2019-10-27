import * as React from "react";
import { renderIntoDocument } from "react-dom/test-utils";
import { renderToStaticMarkup } from "react-dom/server";
import { create } from "react-test-renderer";
import { styled, MemoryRenderer, Context } from "./index";

describe("index", () => {
  it("should support styled components", () => {
    const Button = styled("button", {
      color: "red"
    });

    expect(renderToStaticMarkup(<Button />)).toEqual(
      `<button class="${Button.style.className}"></button>`
    );

    expect(renderToStaticMarkup(<Button>Hello world!</Button>)).toEqual(
      `<button class="${Button.style.className}">Hello world!</button>`
    );

    expect(
      renderToStaticMarkup(
        <Button>
          <i className="test" /> Hello world!
        </Button>
      )
    ).toEqual(
      `<button class="${Button.style.className}"><i class="test"></i> Hello world!</button>`
    );

    expect(
      renderToStaticMarkup(<Button className="test">Text</Button>)
    ).toEqual(`<button class="test ${Button.style.className}">Text</button>`);
  });

  it("should forward refs", () => {
    const ref = React.createRef<HTMLButtonElement>();
    const Button = styled("button", {});

    renderIntoDocument(<Button ref={ref}>Test</Button>);

    expect(ref.current).not.toBeNull();
  });

  it("should attach and detach styles", () => {
    const memoryCss = new MemoryRenderer();

    const Button = styled("button", {
      color: "red"
    });

    const renderer = create(
      <Context.Provider value={memoryCss}>
        <Button>Test</Button>
      </Context.Provider>
    );

    expect(memoryCss.toCss()).toEqual(`.${Button.style.className}{color:red}`);

    renderer.unmount();

    expect(memoryCss.toCss()).toEqual("");
  });

  it("should compose styled components", () => {
    const Button = styled("button", {
      color: "red"
    });

    const LargeButton = styled("button", [
      {
        fontSize: 10
      },
      Button.style
    ]);

    expect(renderToStaticMarkup(<LargeButton />)).toEqual(
      `<button class="${LargeButton.style.className}"></button>`
    );

    expect(LargeButton.style.className).toMatch(/f\w+ f\w+/);
  });
});
