import React = require('react')
import * as FreeStyle from 'free-style'

/**
 * Tag the element for rendering later.
 */
const STYLE_ATTRIBUTE = 'data-react-free-style'

/**
 * Check whether we can render on the server/browser.
 */
export const canUseDOM = !!(
  typeof window !== 'undefined' &&
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

  style = create()

  constructor (public global: GlobalStyleContext) {}

  registerStyle (styles: FreeStyle.UserStyles, displayName?: string) {
    this.global.style.unmerge(this.style)
    const className = this.style.registerStyle(styles, displayName)
    this.global.style.merge(this.style)
    this.global.changed()
    return className
  }

  registerKeyframes (styles: FreeStyle.UserStyles, displayName?: string) {
    this.global.style.unmerge(this.style)
    const keyframes = this.style.registerKeyframes(styles, displayName)
    this.global.style.merge(this.style)
    this.global.changed()
    return keyframes
  }

  registerRule (rule: string, styles: FreeStyle.UserStyles) {
    this.global.style.unmerge(this.style)
    this.style.registerRule(rule, styles)
    this.global.style.merge(this.style)
    this.global.changed()
  }

  mount () {
    this.global.style.merge(this.style)
    this.global.changed()
  }

  unmount () {
    this.global.style.unmerge(this.style)
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
export interface Peek {
  toComponent (): React.DOMElement<{}, HTMLStyleElement>
  toString (): string
  toCss (): string
}

/**
 * Peek at the current styles without clearing.
 */
export function peek (): Peek {
  const css = global.style.getStyles()

  return {
    toComponent () {
      return React.createElement('style', {
        [STYLE_ATTRIBUTE]: true,
        dangerouslySetInnerHTML: { __html: css }
      })
    },
    toString () {
      return `<style ${STYLE_ATTRIBUTE}="true">${css}</style>`
    },
    toCss () {
      return css
    }
  }
}

/**
 * Wrap a component instead of adding it to the markup manually.
 */
export function wrap <T> (
  Component: React.ComponentClass<T> | React.StatelessComponent<T>,
  style?: FreeStyle.FreeStyle
) {
  return function (props: T, context: any) {
    return React.createElement(Style, { style }, React.createElement(Component, props))
  }
}

/**
 * Style properties.
 */
export interface StyleProps {
  style?: FreeStyle.FreeStyle
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
export class Style extends React.Component<StyleProps, {}> {

  static displayName = 'Style'

  static propsTypes: React.ValidationMap<any> = {
    style: React.PropTypes.object.isRequired,
    children: React.PropTypes.node.isRequired
  }

  static childContextTypes: React.ValidationMap<any> = {
    freeStyle: React.PropTypes.object.isRequired
  }

  _freeStyle = new StyleContext(global)

  getChildContext (): ReactFreeStyleContext {
    return {
      freeStyle: this._freeStyle
    }
  }

  componentWillMount () {
    if (this.props.style) {
      this._freeStyle.style.merge(this.props.style)
    }

    this._freeStyle.mount()
  }

  componentWillUnmount () {
    if (this.props.style) {
      this._freeStyle.style.unmerge(this.props.style)
    }

    this._freeStyle.unmount()
  }

  render () {
    return React.Children.only(this.props.children as any)
  }

}

/**
 * Create a Free Style instance.
 */
export function create (hash?: FreeStyle.HashFunction, debug?: boolean) {
  return FreeStyle.create(hash, debug)
}
