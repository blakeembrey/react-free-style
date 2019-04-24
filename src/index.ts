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
      this.freeStyle = FreeStyle.create(undefined, undefined, {
        add: () => (element.innerHTML = this.toCss()),
        remove: () => (element.innerHTML = this.toCss()),
        change: () => (element.innerHTML = this.toCss())
      });
    } else {
      this.freeStyle = FreeStyle.create(undefined, undefined, {
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
 * Create a pre-computed `useStyles` hook for React.
 */
export function createStyles<T extends string>(
  sheet: Record<T, Css | ComputedValue<Css>>,
  globalCss?: Css | ComputedValue<Css>,
  displayName = ""
) {
  const Style = FreeStyle.create();
  const styles: Record<T, string> = Object.create(null);

  for (const key of Object.keys(sheet) as T[]) {
    const cssValue: Css | ComputedValue<Css> = sheet[key];
    styles[key] = cssValueToString(Style, displayName, cssValue);
  }

  if (globalCss) {
    Style.registerCss(
      typeof globalCss === "function"
        ? globalCss(Style, displayName)
        : globalCss
    );
  }

  return Object.assign(
    function useStyles() {
      useStyle(Style); // Automatically use styles.
      return styles;
    },
    { Style, styles }
  );
}

/**
 * Dynamically register other `FreeStyle` instance.
 */
export function useStyle<T extends FreeStyle.FreeStyle>(Style: T): T {
  const ContextStyle = React.useContext(Context);
  const values = Style.values(); // Cache values re-renders.

  // Unmount styles automatically.
  React.useEffect(() => () => {
    for (const item of values) ContextStyle.remove(item);
  });

  // Mount styles automatically.
  for (const item of values) ContextStyle.add(item);

  return Style;
}

/**
 * CSS value to class name.
 */
function cssValueToString(
  Style: FreeStyle.FreeStyle,
  displayName: string,
  cssValue?: CssValue
) {
  if (typeof cssValue === "function") {
    const result = cssValue(Style, displayName);
    if (typeof result === "string") return result;
    return Style.registerStyle(result, displayName);
  }

  return cssValue ? Style.registerStyle(cssValue, displayName) : "";
}

/**
 * Extend styles with previously defined `styled` components.
 */
export function composeStyle(
  cssValue: CssValue,
  ...components: Array<{ Style: FreeStyle.FreeStyle; styleName: string }>
): ComputedValue<string> {
  return (Style, displayName) => {
    let styleName = "";
    for (const c of components) {
      Style.merge(c.Style); // Merge style instances.
      styleName = join(c.styleName, styleName); // Append composed style names.
    }
    return join(cssValueToString(Style, displayName, cssValue), styleName);
  };
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
  const styleName = cssValueToString(Style, `${name}_styled`, cssValue);

  return Object.assign(
    React.forwardRef(function Component(
      props: JSX.IntrinsicElements[T] & P & { css?: Css },
      ref: React.Ref<HTMLElement> | null
    ) {
      const typeProps = { ...props, ref };

      useStyle(Style);

      const dynamic = React.useMemo(
        () => {
          if (!props.css) return;
          const Style = FreeStyle.create();
          const styleName = Style.registerStyle(props.css, `${name}_css`);
          return { Style, styleName };
        },
        [props.css]
      );

      // Prepend component `styleName` to props.
      if (styleName) typeProps.className = join(styleName, typeProps.className);

      // Use dynamic styles after registered styles.
      if (dynamic) {
        typeProps.css = undefined;
        typeProps.className = join(dynamic.styleName, typeProps.className);
        useStyle(dynamic.Style);
      }

      return React.createElement(type, typeProps);
    }),
    {
      Style,
      styleName,
      displayName
    }
  );
}

/**
 * Append CSS class name.
 */
function join(className: string, origClassName?: string) {
  if (origClassName) return `${origClassName} ${className}`;
  return className;
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
export type ComputedValue<T> = (
  Style: FreeStyle.FreeStyle,
  displayName: string
) => T;

/**
 * Functional CSS value.
 */
export type CssValue = ComputedValue<string | Css> | Css;
