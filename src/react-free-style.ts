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
 * Create a global style container.
 */
let globalStyle = FreeStyle.create()

/**
 * Create and append a style element to the DOM.
 */
const addStyle = canUseDOM ?
  ((cache, counters) => {
    return (Style: FreeStyle.FreeStyle, componentName: string) => {
      if (!counters[Style.id]) {
        const element = document.createElement('style')

        element.setAttribute('type', 'text/css')
        element.setAttribute('data-react-free-style', Style.id)
        element.setAttribute('data-react-component', componentName)
        element.textContent = Style.getStyles()
        document.head.appendChild(element)

        cache[Style.id] = () => {
          if (counters[Style.id] === 1) {
            delete cache[Style.id]
            delete counters[Style.id]
            document.head.removeChild(element)
            return
          }

          counters[Style.id]--
        }

        counters[Style.id] = 0
      }

      counters[Style.id]++

      return cache[Style.id]
    }
  })(Object.create(null), Object.create(null)) :
  (Style: FreeStyle.FreeStyle) => {
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
export function createStyleContext (name: string): StyleContext {
  const Style = FreeStyle.create()
  let unmount = addStyle(Style, name)

  function wrap <T> (invoke: () => T): T {
    const result = invoke()
    unmount()
    unmount = addStyle(Style, name)
    return result
  }

  return {
    registerStyle (styles: FreeStyle.Styles, displayName?: string) {
      return wrap(() => Style.registerStyle(styles, displayName))
    },
    registerCss (css: FreeStyle.Styles) {
      return wrap(() => Style.registerCss(css))
    },
    registerHashRule (prefix: string, styles: FreeStyle.Styles, displayName?: string) {
      return wrap(() => Style.registerHashRule(prefix, styles, displayName))
    },
    registerKeyframes (keyframes: FreeStyle.Styles, displayName?: string) {
      return wrap(() => Style.registerKeyframes(keyframes, displayName))
    },
    registerRule (rule: string, styles: FreeStyle.Styles) {
      return wrap(() => Style.registerRule(rule, styles))
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
  globalStyle = FreeStyle.create()
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
  unmountStyle: () => void

  componentWillMount () {
    this.unmountStyle = addStyle(this.props.Style, this.props.componentName)
  }

  componentWillUpdate (nextProps: StyleComponentProps<any>) {
    if (this.props.Style.id === nextProps.Style.id) return

    this.unmountStyle()
    this.unmountStyle = addStyle(nextProps.Style, nextProps.componentName)
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
  const Style = FreeStyle.create(hash, debug)
  const styles = helpers.registerStyleSheet(Style, sheet, options)

  return Object.assign(<P> (Component: React.ComponentType<P & StyledComponentProps<T>>, withFreeStyle?: boolean) => {
    const componentName = Component.displayName || Component.name || 'anonymous'

    const Styled: React.StatelessComponent<P> = (props: P & StyledProps<T>) => {
      const componentProps = Object.assign({}, props, {
        styles: props.styles ? Object.assign({}, styles, props.styles) : styles
      })

      return React.createElement(
        StyleComponent,
        { Style, Component, componentName, componentProps, withFreeStyle }
      )
    }

    Styled.displayName = `Styled(${componentName})`

    return Styled
  }, { Style, styles })
}
