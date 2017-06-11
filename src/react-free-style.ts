import React = require('react')
import PropTypes = require('prop-types')
import * as FreeStyle from 'free-style'

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

  style = create()
  prevChangeId = this.style.changeId
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
    if (canUseDOM && this.style.changeId !== this.prevChangeId) {
      this.prevChangeId = this.style.changeId
      this.element.textContent = this.style.getStyles()
    }
  }

}

/**
 * The style context object is passed to the child context to allow dynamic styles.
 */
export class StyleContext {

  Style = create()

  constructor (public global: GlobalStyleContext) {}

  registerStyle (styles: FreeStyle.Styles, displayName?: string) {
    this.global.style.unmerge(this.Style)
    const className = this.Style.registerStyle(styles, displayName)
    this.global.style.merge(this.Style)
    this.global.changed()
    return className
  }

  registerKeyframes (styles: FreeStyle.Styles, displayName?: string) {
    this.global.style.unmerge(this.Style)
    const keyframes = this.Style.registerKeyframes(styles, displayName)
    this.global.style.merge(this.Style)
    this.global.changed()
    return keyframes
  }

  registerRule (rule: string, styles: FreeStyle.Styles) {
    this.global.style.unmerge(this.Style)
    this.Style.registerRule(rule, styles)
    this.global.style.merge(this.Style)
    this.global.changed()
  }

  registerCss (styles: FreeStyle.Styles) {
    this.global.style.unmerge(this.Style)
    this.Style.registerCss(styles)
    this.global.style.merge(this.Style)
    this.global.changed()
  }

  mount () {
    this.global.style.merge(this.Style)
    this.global.changed()
  }

  unmount () {
    this.global.style.unmerge(this.Style)
    this.global.changed()
  }

}

/**
 * Re-export the `free-style` module.
 */
export { FreeStyle }

/**
 * Create a global style container.
 */
let global = new GlobalStyleContext()

/**
 * Get the current render styles.
 */
export function rewind () {
  if (canUseDOM) {
    throw new Error('You can only call `rewind()` on the server. Call `peek()` to read the current styles.')
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
  return new Peek(global.style.getStyles())
}

/**
 * Style properties.
 */
export interface StyleProps {
  Style?: FreeStyle.FreeStyle
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
export class StyleComponent extends React.Component<StyleProps, {}> {

  static displayName = 'Style'

  static propsTypes = {
    Style: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired
  }

  static childContextTypes = ReactFreeStyleContext

  _freeStyle = new StyleContext(global)

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
 * Create a Free Style instance.
 */
export function create (hash?: FreeStyle.HashFunction, debug?: boolean) {
  return FreeStyle.create(hash, debug)
}

/**
 * Input object for style HOC.
 */
export type Styled <T extends string> = {
  [K in T]: FreeStyle.Styles
}

/**
 * Styles as a component prop.
 */
export type StylesProp <T extends string> = {
  [K in T]: string
}

/**
 * Props passed to the HOC child.
 */
export type StyledProps <T extends string> = {
  styles: StylesProp<T>
  freeStyle: StyleContext
}

/**
 * Create a HOC for styles.
 */
export function styled <T extends string> (styleSheet: Styled<T>, hash?: FreeStyle.HashFunction, debug?: boolean) {
  const styles: StylesProp<T> = Object.create(null)
  const Style = create(hash, debug)

  for (const key of Object.keys(styleSheet)) {
    styles[key] = Style.registerStyle(styleSheet[key])
  }

  return <P> (Component: React.ComponentType<P & StyledProps<T>>) => {
    const Styled: React.StatelessComponent<P> = (props: P) => {
      return React.createElement(
        StyleComponent,
        { Style: Style },
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
