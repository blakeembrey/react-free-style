import React = require('react')
import PropTypes = require('prop-types')
import * as FreeStyle from 'free-style'
import { create } from 'free-style'

/**
 * Re-export the `free-style` module.
 */
export { FreeStyle, create }

/**
 * Tag the element for rendering later.
 */
const STYLE_ATTRIBUTE = 'data-react-free-style'

/**
 * Check whether we can render on the server/browser.
 */
export const canUseDOM = !!(
  typeof (window as any) !== 'undefined' &&
  window.document &&
  window.document.createElement
)

/**
 * Create a class for passing down the style context.
 */
export class GlobalStyleContext {

  Style = create()
  prevChangeId = this.Style.changeId
  element: HTMLStyleElement

  constructor () {
    if (canUseDOM) {
      this.element = document.querySelector(`style[${STYLE_ATTRIBUTE}]`) as HTMLStyleElement

      if (!this.element) {
        this.element = document.createElement('style')
        this.element.setAttribute('type', 'text/css')
        this.element.setAttribute(STYLE_ATTRIBUTE, 'true')

        document.head.appendChild(this.element)
      }
    }
  }

  changed () {
    if (canUseDOM && this.Style.changeId !== this.prevChangeId) {
      this.prevChangeId = this.Style.changeId
      this.element.textContent = this.Style.getStyles()
    }
  }

}

/**
 * Object used for dynamic styles over the context.
 */
export type StyleContext = Pick<
  FreeStyle.FreeStyle,
  'registerStyle' | 'registerCss' | 'registerHashRule' | 'registerKeyframes' | 'registerRule'
> & {
  Style: FreeStyle.FreeStyle
  mount (): void
  unmount (): void
}

/**
 * Create the context object for style components.
 */
export function createStyleContext (global: GlobalStyleContext): StyleContext {
  const Style = create()

  function mount () {
    global.Style.merge(Style)
    global.changed()
  }

  function unmount () {
    global.Style.unmerge(Style)
    global.changed()
  }

  function wrap <T> (invoke: () => T): T {
    unmount()
    const result = invoke()
    mount()
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
    Style: Style,
    mount: mount,
    unmount: unmount
  }
}

/**
 * Create a global style container.
 */
let global = new GlobalStyleContext()

/**
 * Get the current render styles.
 */
export function rewind () {
  if (canUseDOM) {
    throw new TypeError('You must call `rewind()` on the server. Call `peek()` to read the current styles.')
  }

  const styles = peek()
  global = new GlobalStyleContext()
  return styles
}

/**
 * The interface for "peeking" results.
 */
export class Peek {
  constructor (public css: string) {}

  toComponent () {
    return React.createElement('style', {
      [STYLE_ATTRIBUTE]: true,
      dangerouslySetInnerHTML: { __html: this.css }
    })
  }

  toString () {
    return `<style ${STYLE_ATTRIBUTE}="true">${this.css}</style>`
  }

  toCss () {
    return this.css
  }
}

/**
 * Peek at the current styles without clearing.
 */
export function peek (): Peek {
  return new Peek(global.Style.getStyles())
}

/**
 * The free-style context object for React.
 */
export const ReactFreeStyleContext = {
  freeStyle: PropTypes.object.isRequired
}

/**
 * Context for child components.
 */
export interface ReactFreeStyleContext {
  freeStyle: StyleContext
}

/**
 * Create a style component.
 */
export class StyleComponent extends React.Component<{ Style?: FreeStyle.FreeStyle }, {}> {

  static displayName = 'Style'
  static childContextTypes = ReactFreeStyleContext

  _freeStyle = createStyleContext(global)

  getChildContext (): ReactFreeStyleContext {
    return {
      freeStyle: this._freeStyle
    }
  }

  componentWillMount () {
    if (this.props.Style) {
      this._freeStyle.Style.merge(this.props.Style)
    }

    this._freeStyle.mount()
  }

  componentWillUnmount () {
    if (this.props.Style) {
      this._freeStyle.Style.unmerge(this.props.Style)
    }

    this._freeStyle.unmount()
  }

  render () {
    return React.Children.only(this.props.children)
  }

}

/**
 * Wrap a component instead of adding it to the markup manually.
 */
export function wrap <P> (
  Component: React.ComponentType<P>,
  Style?: FreeStyle.FreeStyle,
  name = 'anonymous'
) {
  const Wrapped: React.StatelessComponent<P> = (props: P) => {
    return React.createElement(StyleComponent, { Style }, React.createElement(Component as any, props))
  }

  Wrapped.displayName = `Wrap<${Component.displayName || Component.name || name}>`

  return Wrapped
}

/**
 * Input object for style HOC.
 */
export type StyleSheet <T extends string> = {
  [K in T]: FreeStyle.Styles
}

/**
 * Styles as a component prop.
 */
export type StyleMap <T extends string> = {
  [K in T]: string
}

/**
 * Utility for registering a map of styles.
 */
export function registerStyleSheet <T extends string> (Style: FreeStyle.FreeStyle, styleSheet: StyleSheet<T>): StyleMap<T> {
  const styles: StyleMap<T> = Object.create(null)

  for (const key of Object.keys(styleSheet)) {
    styles[key] = Style.registerStyle(styleSheet[key])
  }

  return styles
}

/**
 * Props passed to the HOC child.
 */
export type StyledProps <T extends string> = {
  styles: StyleMap<T>
}

/**
 * Create a HOC for styles.
 */
export function styled <T extends string> (styleSheet: StyleSheet<T>, hash?: FreeStyle.HashFunction, debug?: boolean) {
  const Style = create(hash, debug)
  const styles = registerStyleSheet(Style, styleSheet)

  return <P> (Component: React.ComponentType<P & StyledProps<T>>) => {
    const Styled: React.StatelessComponent<P> = (props: P) => {
      return React.createElement(
        StyleComponent,
        { Style },
        React.createElement(
          Component as any,
          Object.assign({}, props, { styles })
        )
      )
    }

    Styled.displayName = `Styled<${Component.displayName || Component.name || 'anonymous'}>`

    return Object.assign(Styled, { Style, styles })
  }
}
