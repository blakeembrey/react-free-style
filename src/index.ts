import * as React from "react";
import * as FreeStyle from "free-style";
import { PropertiesFallback } from "csstype";

/**
 * Re-export the `free-style` module.
 */
export { FreeStyle };

/**
 * Tag the element for rendering later.
 */
export const STYLE_ID = "__react_free_style__";

/**
 * Basic `noop` renderer. Used as the default context for testing.
 */
export class NoopRenderer {
  add(item: FreeStyle.Container<any>) {
    return; // Do nothing.
  }

  remove(item: FreeStyle.Container<any>) {
    return; // Do nothing.
  }

  toCss() {
    return "";
  }

  toString() {
    return `<style id="${STYLE_ID}">${this.toCss()}</style>`;
  }

  toComponent() {
    return React.createElement("style", {
      id: STYLE_ID,
      dangerouslySetInnerHTML: { __html: this.toCss() }
    });
  }
}

/**
 * In-memory renderer. Used for server-side rendering.
 */
export class MemoryRenderer extends NoopRenderer {
  freeStyle = FreeStyle.create();

  add(item: FreeStyle.Rule | FreeStyle.Style) {
    this.freeStyle.add(item);
  }

  remove(item: FreeStyle.Rule | FreeStyle.Style) {
    this.freeStyle.remove(item);
  }

  toCss() {
    return this.freeStyle.getStyles();
  }
}

/**
 * DOM style sheet renderer. Used for front-end applications.
 */
export class StyleSheetRenderer extends MemoryRenderer {
  constructor() {
    super();

    let element = document.getElementById(STYLE_ID) as HTMLStyleElement;
    let styleSheet: CSSStyleSheet;

    if (!element) {
      element = document.createElement("style");
      element.setAttribute("id", STYLE_ID);
      element.setAttribute("type", "text/css");
      document.head.appendChild(element);
    }

    for (let i = 0; i < document.styleSheets.length; i++) {
      const item = document.styleSheets.item(i)!;

      if (item.ownerNode === element) {
        styleSheet = item as CSSStyleSheet;
        break;
      }
    }

    this.freeStyle = FreeStyle.create(undefined, undefined, {
      add(style, index) {
        styleSheet.insertRule(style.getStyles(), index);
      },
      remove(style, index) {
        styleSheet.deleteRule(index);
      },
      change(style, oldIndex, newIndex) {
        styleSheet.deleteRule(oldIndex);
        styleSheet.insertRule(style.getStyles(), newIndex);
      }
    });
  }
}

/**
 * Export default React.js context object with `noop` behavior.
 */
export const Context = React.createContext<NoopRenderer>(new NoopRenderer());

/**
 * Create a pre-computed `useStyles` hook for React.
 */
export function createStyles<T extends string>(
  sheet: Record<T, CssValue>,
  globalCss?: CssValue,
  hash?: FreeStyle.HashFunction,
  debug?: boolean
) {
  const Style = FreeStyle.create(hash, debug);
  const styles: Record<T, string> = Object.create(null);

  for (const key of Object.keys(sheet) as T[]) {
    const css: CssValue = sheet[key];
    styles[key] = Style.registerStyle(
      typeof css === "function" ? css(Style) : css
    );
  }

  if (globalCss) {
    Style.registerCss(
      typeof globalCss === "function" ? globalCss(Style) : globalCss
    );
  }

  return Object.assign(
    function useStyles() {
      useStyle(Style); // Automatically use styles.
      return styles;
    },
    { styles }
  );
}

/**
 * Dynamically register other `FreeStyle` instance.
 */
export function useStyle<T extends FreeStyle.FreeStyle>(Style: T): T {
  const ContextStyle = React.useContext(Context);
  const values = Style.values(); // Cache values re-renders.

  // Unmount styles automatically.
  React.useEffect(
    () => () => {
      for (const item of values) ContextStyle.remove(item);
    },
    values
  );

  // Mount styles automatically.
  for (const item of values) ContextStyle.add(Style);

  return Style;
}

export interface StyledProperties {
  styleName: string;
  displayName: string;
}

/**
 * Type-safe styled component.
 */
export function styled<T extends keyof JSX.IntrinsicElements, P = {}>(
  type: T,
  cssValue?: CssValue,
  debugName?: string
) {
  const Style = FreeStyle.create();
  const name = debugName || type;
  const displayName = `styled(${name})`;
  const styleName = cssValue
    ? Style.registerStyle(
        typeof cssValue === "function" ? cssValue(Style) : cssValue,
        `${name}_styled`
      )
    : "";

  return Object.assign(
    React.forwardRef(function Component(
      props: JSX.IntrinsicElements[T] & P & { css?: Css },
      ref: React.Ref<HTMLElement> | null
    ) {
      const elementProps = { ...props, ref };

      if (styleName) {
        elementProps.className = elementProps.className
          ? `${elementProps.className} ${styleName}`
          : styleName;
      }

      if (props.css) {
        const cssName = Style.registerStyle(props.css, `${name}_css`);
        elementProps.css = undefined;
        elementProps.className = elementProps.className
          ? `${props.className} ${styleName}`
          : cssName;
      }

      // Register styles after registration.
      useStyle(Style);

      return React.createElement(type, elementProps);
    }),
    {
      styleName,
      displayName
    }
  );
}

/**
 * Typed style object.
 *
 * Based on https://github.com/typestyle/typestyle/pull/245/files
 */
export interface Css extends PropertiesFallback<string | number> {
  /** State selector */
  "&:active"?: Css;
  "&:any"?: Css;
  "&:checked"?: Css;
  "&:default"?: Css;
  "&:disabled"?: Css;
  "&:empty"?: Css;
  "&:enabled"?: Css;
  "&:first"?: Css;
  "&:first-child"?: Css;
  "&:first-of-type"?: Css;
  "&:fullscreen"?: Css;
  "&:focus"?: Css;
  "&:hover"?: Css;
  "&:indeterminate"?: Css;
  "&:in-range"?: Css;
  "&:invalid"?: Css;
  "&:last-child"?: Css;
  "&:last-of-type"?: Css;
  "&:left"?: Css;
  "&:link"?: Css;
  "&:only-child"?: Css;
  "&:only-of-type"?: Css;
  "&:optional"?: Css;
  "&:out-of-range"?: Css;
  "&:read-only"?: Css;
  "&:read-write"?: Css;
  "&:required"?: Css;
  "&:right"?: Css;
  "&:root"?: Css;
  "&:scope"?: Css;
  "&:target"?: Css;
  "&:valid"?: Css;
  "&:visited"?: Css;
  /**
   * Pseudo-elements
   * https://developer.mozilla.org/en/docs/Web/CSS/Pseudo-elements
   */
  "&::after"?: Css;
  "&::before"?: Css;
  "&::first-letter"?: Css;
  "&::first-line"?: Css;
  "&::selection"?: Css;
  "&::backdrop"?: Css;
  "&::placeholder"?: Css;
  "&::marker"?: Css;
  "&::spelling-error"?: Css;
  "&::grammar-error"?: Css;

  /** Children */
  "&>*"?: Css;

  /**
   * Mobile first media query example
   */
  "@media screen and (min-width: 700px)"?: Css;

  /**
   * Desktop first media query example
   */
  "@media screen and (max-width: 700px)"?: Css;

  [selector: string]: string | number | (string | number)[] | Css | undefined;
}

/**
 * Functional CSS value.
 */
type CssValue = ((freeStyle: FreeStyle.FreeStyle) => Css) | Css;
