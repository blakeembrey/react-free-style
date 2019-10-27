/** @jsx jsx */

import { renderToStaticMarkup } from "react-dom/server";
import { jsx } from "./jsx";

describe("jsx", () => {
  it("should support element tags natively", () => {
    expect(renderToStaticMarkup(<a css={{ color: "red" }} />)).toMatch(
      /<a class="f\w+"><\/a>/
    );
  });
});
