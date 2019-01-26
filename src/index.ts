import * as React from "react";
import * as FreeStyle from "free-style";
import * as helpers from "style-helper";

/**
 * Re-export the `free-style` module.
 */
export { FreeStyle, helpers };

/**
 * Tag the element for rendering later.
 */
export const STYLE_ID = "__react_free_style__";

/**
 * Basic `noop` renderer. Used as the default context for testing.
 */
export class NoopRenderer {
  merge(freeStyle: FreeStyle.FreeStyle) {
    return; // Do nothing.
  }

  unmerge(freeStyle: FreeStyle.FreeStyle) {
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

  merge(freeStyle: FreeStyle.FreeStyle) {
    this.freeStyle.merge(freeStyle);
  }

  unmerge(freeStyle: FreeStyle.FreeStyle) {
    this.freeStyle.unmerge(freeStyle);
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
  sheet: helpers.StyleSheet<T> = {} as helpers.StyleSheet<T>,
  css?: helpers.StyleValue,
  hash?: FreeStyle.HashFunction,
  debug?: boolean
) {
  const Style = FreeStyle.create(hash, debug);
  const styles = helpers.registerStyleSheet(Style, sheet, css);

  return Object.assign(
    function useStyles() {
      useStyle(Style); // Automatically use "own styles".
      return styles;
    },
    { styles }
  );
}

/**
 * Dynamically register other `FreeStyle` instance.
 */
export function useStyle<T extends FreeStyle.FreeStyle>(Style: T): T {
  const context = React.useContext(Context);

  // Unmount styles automatically.
  React.useEffect(() => () => context.unmerge(Style));

  // Mount styles automatically.
  context.merge(Style);

  return Style;
}

/**
 * Type-safe styled component.
 */
export function styled<T extends keyof JSX.IntrinsicElements>(
  type: keyof JSX.IntrinsicElements,
  style: helpers.StyleValue
) {
  const useStyle = createStyles({ style });

  return Object.assign(
    function Component(props: JSX.IntrinsicElements[T]) {
      const { style } = useStyle();
      const className = props.className ? `${style} ${props.className}` : style;
      return React.createElement(type, Object.assign({}, props, { className }));
    },
    {
      styles: useStyle.styles,
      displayName: `Styled<${type}>`
    }
  );
}
