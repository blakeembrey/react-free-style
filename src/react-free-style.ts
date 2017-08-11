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

  Style = FreeStyle.create()
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
export function createStyleContext (globalStyle: GlobalStyleContext): StyleContext {
  const Style = FreeStyle.create()

  function mount () {
    globalStyle.Style.merge(Style)
    globalStyle.changed()
  }

  function unmount () {
    globalStyle.Style.unmerge(Style)
    globalStyle.changed()
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
let globalStyle = new GlobalStyleContext()

/**
 * Get the current render styles.
 */
export function rewind () {
  if (canUseDOM) {
    throw new TypeError('You must call `rewind()` on the server. Call `peek()` to read the current styles.')
  }

  const styles = peek()
  globalStyle = new GlobalStyleContext()
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
  return new Peek(globalStyle.Style.getStyles())
}

/**
 * Style component properties.
 */
export interface StyleComponentProps {
  Style: FreeStyle.FreeStyle
  freeStyle: StyleContext
}

/**
 * Create a style component.
 */
export class StyleComponent extends React.Component<StyleComponentProps, {}> {

  static displayName = 'Style'

  componentWillMount () {
    this.props.freeStyle.Style.merge(this.props.Style)
    this.props.freeStyle.mount()
  }

  componentWillUnmount () {
    this.props.freeStyle.Style.unmerge(this.props.Style)
    this.props.freeStyle.unmount()
  }

  render () {
    return React.Children.only(this.props.children)
  }

}

/**
 * Wrap a component instead of adding it to the markup manually.
 */
export function wrap <P, U> (
  Component: React.ComponentType<P>,
  Style: FreeStyle.FreeStyle = FreeStyle.create(),
  cb?: (props: P, freeStyle: StyleContext) => U,
  name = 'anonymous'
) {
  const Wrapped: React.StatelessComponent<P> = (props: P) => {
    const freeStyle = createStyleContext(globalStyle)

    // Allow `cb` hook before rendering child component.
    const childProps = cb ? cb(props, freeStyle) : props

    return React.createElement(
      StyleComponent,
      { Style, freeStyle },
      React.createElement(Component as any, childProps)
    )
  }

  Wrapped.displayName = `Wrap<${Component.displayName || Component.name || name}>`

  return Object.assign(Wrapped, { Style })
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
  freeStyle: StyleContext
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

  return Object.assign(<P> (Component: React.ComponentType<P & StyledComponentProps<T>>) => {
    const Styled: React.StatelessComponent<P> = (props: P & StyledProps<T>) => {
      const freeStyle = createStyleContext(globalStyle)

      return React.createElement(
        StyleComponent,
        { Style, freeStyle },
        React.createElement(
          Component as any,
          Object.assign({}, props, {
            freeStyle,
            styles: Object.assign({}, styles, props.styles)
          })
        )
      )
    }

    Styled.displayName = `Styled<${Component.displayName || Component.name || 'anonymous'}>`

    return Styled
  }, { Style, styles })
}
