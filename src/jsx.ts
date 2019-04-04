import * as React from "react";
import { styled, Css } from "./index";

export const jsx: typeof React.createElement = (
  type: any,
  ...args: any[]
): any => {
  if (typeof type === "string") {
    return React.createElement(
      styled(type as keyof JSX.IntrinsicElements),
      ...args
    );
  }

  return React.createElement(type, ...args);
};

declare module "react" {
  interface HTMLAttributes<T> {
    css?: Css;
  }
}
