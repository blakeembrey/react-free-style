import * as React from "react";
import * as FreeStyle from "free-style";
import { PropertiesFallback } from "csstype";

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
  constructor(debug?: boolean) {
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

    if (debug) {
      this.freeStyle = FreeStyle.create({
        add: () => (element.innerHTML = this.toCss()),
        remove: () => (element.innerHTML = this.toCss()),
        change: () => (element.innerHTML = this.toCss())
      });
    } else {
      this.freeStyle = FreeStyle.create({
        add: (style, index) => {
          styleSheet.insertRule(style.getStyles(), index);
        },
        remove: (_, index) => {
          styleSheet.deleteRule(index);
        },
        change: (style, oldIndex, newIndex) => {
          styleSheet.deleteRule(oldIndex);
          styleSheet.insertRule(style.getStyles(), newIndex);
        }
      });
    }
  }
}

/**
 * Export default React.js context object with `noop` behavior.
 */
export const Context = React.createContext<NoopRenderer>(new NoopRenderer());

/**
 * Pre-computed CSS style.
 */
export class CachedCss {
  constructor(public className: string, public Style: FreeStyle.FreeStyle) {}
}

/**
 * Dynamically register other `FreeStyle` instance.
 */
export function useStyle<T extends FreeStyle.FreeStyle>(Style: T): T {
  const ContextStyle = React.useContext(Context);
  const values = Style.values(); // Cache `values` for unmount.

  // Unmount styles automatically.
  React.useEffect(() => () => {
    for (const item of values) ContextStyle.remove(item);
  });

  // Mount styles automatically.
  for (const item of values) ContextStyle.add(item);

  return Style;
}

/**
 * React hook for dynamically registering CSS values in a component.
 */
export function useCss(cssValue: CssValue): string {
  const { className, Style } = React.useMemo(() => css(cssValue), [cssValue]);
  useStyle(Style);
  return className;
}

/**
 * Create a cached CSS object.
 */
export function css(cssValue: CssValue): CachedCss {
  const Style = FreeStyle.create();
  const className = cssValueToString(Style, cssValue);
  return new CachedCss(className, Style);
}

/**
 * Type-safe styled component.
 */
export function styled<T extends keyof JSX.IntrinsicElements>(
  type: T,
  cssValue?: CssValue
) {
  const displayName = `styled(${type})`;
  const style = css(cssValue);

  return Object.assign(
    React.forwardRef(function Component(
      props: JSX.IntrinsicElements[T] & { css?: CssValue },
      ref: React.Ref<HTMLElement> | null
    ) {
      const className = useCss([props.className, style, props.css]);

      return React.createElement(type, {
        ...props,
        ref,
        className,
        css: undefined // Remove `css` property.
      });
    }),
    { displayName, style }
  );
}

/**
 * CSS value to class name.
 */
function cssValueToString(
  Style: FreeStyle.FreeStyle,
  cssValue: CssValue
): string {
  if (typeof cssValue === "string") return cssValue;

  if (typeof cssValue === "function") {
    const result = cssValue(Style);
    if (typeof result === "string") return result;
    return Style.registerStyle(result);
  }

  if (Array.isArray(cssValue)) {
    let className = "";
    for (const value of cssValue) {
      const cssClassName = cssValueToString(Style, value);
      if (className) {
        if (cssClassName) className = `${className} ${cssClassName}`;
      } else {
        className = cssClassName;
      }
    }
    return className;
  }

  if (cssValue instanceof CachedCss) {
    Style.merge(cssValue.Style);
    return cssValue.className;
  }

  return cssValue ? Style.registerStyle(cssValue) : "";
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
 * Functional compute styles.
 */
export type ComputedCss = (Style: FreeStyle.FreeStyle) => string | Css;

/**
 * Recursive CSS values array.
 */
export interface CssValueArray extends Array<CssValue> {}

/**
 * Any supported CSS value.
 */
export type CssValue =
  | CachedCss
  | ComputedCss
  | Css
  | string
  | undefined
  | CssValueArray;
