import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as tags from "./tags";

describe("tags", () => {
  it("should support element tags", () => {
    expect(renderToStaticMarkup(<tags.A css={{ color: "red" }} />)).toMatch(
      /<a class="f\w+"><\/a>/
    );
  });
});
