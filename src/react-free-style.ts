import React = require('react')
import * as FreeStyle from 'free-style'
import * as helpers from 'style-helper'

/**
 * Re-export the `free-style` module.
 */
export { FreeStyle, helpers }

/**
 * Tag the element for rendering later.
 */
export const STYLE_ID = '_react_free_style_'

/**
 * Check whether we can render on the server/browser.
 */
export const canUseDOM = !!(
  typeof (window as any) !== 'undefined' &&
  window.document &&
  window.document.createElement
)

/**
 * Create a new "global" instance.
 */
function createGlobal () {
  // Skip DOM lookup.
  if (!canUseDOM) return FreeStyle.create()

  let element = document.getElementById(STYLE_ID) as HTMLStyleElement
  let styleSheet: CSSStyleSheet

  if (!element) {
    element = document.createElement('style')
    element.setAttribute('id', STYLE_ID)
    element.setAttribute('type', 'text/css')
    document.head.appendChild(element)
  }

  for (let i = 0; i < document.styleSheets.length; i++) {
    const item = document.styleSheets.item(i)!

    if (item.ownerNode === element) {
      styleSheet = item as CSSStyleSheet
      break
    }
  }

  return FreeStyle.create(undefined, undefined, {
    add (style, index) {
      styleSheet.insertRule(style.getStyles(), index)
    },
    remove (style, index) {
      styleSheet.deleteRule(index)
    },
    change (style, oldIndex, newIndex) {
      styleSheet.deleteRule(oldIndex)
      styleSheet.insertRule(style.getStyles(), newIndex)
    }
  })
}

/**
 * Create a global style container.
 */
let globalStyle = createGlobal()

/**
 * Create and append a style element to the DOM.
 */
const addStyle = (Style: FreeStyle.FreeStyle) => {
  const global = globalStyle
  global.merge(Style)

  return () => { global.unmerge(Style) }
}

/**
 * Object used for dynamic styles over the context.
 */
export type StyleContext = Pick<
  FreeStyle.FreeStyle,
  'registerStyle' | 'registerCss' | 'registerHashRule' | 'registerKeyframes' | 'registerRule'
> & { unmount (): void }

/**
 * Create the context object for style components.
 */
export function createStyleContext (componentName: string): StyleContext {
  const Style: FreeStyle.FreeStyle = FreeStyle.create()
  let unmount = addStyle(Style)

  function wrap <T> (invoke: () => T): T {
    const result = invoke()
    unmount()
    unmount = addStyle(Style)
    return result
  }

  return {
    registerStyle (styles: FreeStyle.Styles, displayName?: string) {
      const debugName = displayName ? `${componentName}_${displayName}` : componentName
      return wrap(() => Style.registerStyle(styles, debugName))
    },
    registerHashRule (prefix: string, styles: FreeStyle.Styles, displayName?: string) {
      const debugName = displayName ? `${componentName}_${displayName}` : componentName
      return wrap(() => Style.registerHashRule(prefix, styles, debugName))
    },
    registerKeyframes (keyframes: FreeStyle.Styles, displayName?: string) {
      const debugName = displayName ? `${componentName}_${displayName}` : componentName
      return wrap(() => Style.registerKeyframes(keyframes, debugName))
    },
    registerRule (rule: string, styles: FreeStyle.Styles) {
      return wrap(() => Style.registerRule(rule, styles))
    },
    registerCss (css: FreeStyle.Styles) {
      return wrap(() => Style.registerCss(css))
    },
    unmount () {
      return unmount()
    }
  }
}

/**
 * Get the current render styles.
 */
export function rewind () {
  if (canUseDOM) {
    throw new TypeError('You must call `rewind()` on the server. Call `peek()` to read the current styles.')
  }

  const styles = peek()
  globalStyle = createGlobal()
  return styles
}

/**
 * The interface for "peeking" results.
 */
export class Peek {
  constructor (public Style: FreeStyle.FreeStyle) {}

  toComponent () {
    return React.createElement('style', {
      id: STYLE_ID,
      dangerouslySetInnerHTML: { __html: this.Style.getStyles() }
    })
  }

  toString () {
    return `<style id="${STYLE_ID}">${this.Style.getStyles()}</style>`
  }

  toCss () {
    return this.Style.getStyles()
  }
}

/**
 * Peek at the current styles without clearing.
 */
export function peek (): Peek {
  return new Peek(globalStyle)
}

/**
 * Style component properties.
 */
export interface StyleComponentProps <P> {
  Style: FreeStyle.FreeStyle
  Component: React.ComponentType<P>
  componentName: string
  componentProps: P
  withFreeStyle?: boolean
}

/**
 * Create a style component.
 */
export class StyleComponent extends React.Component<StyleComponentProps<any>, {}> {

  static displayName = 'Style'

  freeStyle?: StyleContext
  unmountStyle: () => void = () => undefined

  componentWillMount () {
    this.unmountStyle = addStyle(this.props.Style)
  }

  componentWillUpdate (nextProps: StyleComponentProps<any>) {
    if (this.props.Style.id === nextProps.Style.id) return

    this.unmountStyle()
    this.unmountStyle = addStyle(nextProps.Style)
  }

  componentWillUnmount () {
    this.unmountStyle()
    if (this.freeStyle) this.freeStyle.unmount()
  }

  render () {
    const { componentProps, Component, withFreeStyle } = this.props
    const props = withFreeStyle ? Object.assign({}, componentProps, {
      freeStyle: this.freeStyle || (this.freeStyle = createStyleContext(this.props.componentName))
    }) : componentProps

    return React.createElement(Component as any, props)
  }

}

/**
 * Wrap a component instead of adding it to the markup manually.
 */
export function wrap <P, U> (
  Component: React.ComponentType<U>,
  Style: FreeStyle.FreeStyle,
  withFreeStyle?: boolean,
  name = 'anonymous'
) {
  const componentName = Component.displayName || Component.name || name

  const Wrapped: React.StatelessComponent<P> = (componentProps: P) => {
    return React.createElement(
      StyleComponent,
      { Style, Component, componentName, componentProps, withFreeStyle }
    )
  }

  Wrapped.displayName = `Wrap(${componentName}, Style)`

  return Wrapped
}

/**
 * Props passed through to the component.
 */
export type StyledProps <T extends string> = {
  styles?: helpers.StyleMap<T>
}

/**
 * Props provided by the `styled` wrapper.
 */
export type StyledComponentProps <T extends string> = {
  styles: helpers.StyleMap<T>
  freeStyle?: StyleContext
}

/**
 * Create a HOC for styles.
 */
export function styled <T extends string> (
  sheet: helpers.StyleSheet<T> = {} as helpers.StyleSheet<T>,
  options?: helpers.Options<T>,
  hash?: FreeStyle.HashFunction,
  debug?: boolean
) {
  return <P> (
    Component: React.ComponentType<P & StyledComponentProps<T>>,
    withFreeStyle?: boolean
  ) => {
    const Style = FreeStyle.create(hash, debug)
    const componentName = Component.displayName || Component.name || 'anonymous'
    const styles = helpers.registerStyleSheet(Style, sheet, options, componentName)
    const displayName = `Styled(${componentName})`

    return Object.assign(
      ((props: P & StyledProps<T>) => {
        const componentProps = Object.assign({}, props, {
          styles: props.styles ? Object.assign({}, styles, props.styles) : styles
        })

        return React.createElement(
          StyleComponent,
          { Style, Component, componentName, componentProps, withFreeStyle }
        )
      }) as React.StatelessComponent<P>,
      { displayName, styles, Style }
    )
  }
}
