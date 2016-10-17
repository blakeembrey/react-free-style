import React = require('react')
import ReactCurrentOwner = require('react/lib/ReactCurrentOwner')
import * as FreeStyle from 'free-style'

/**
 * Re-export the `free-style` module.
 */
export { FreeStyle }

/**
 * The context used with `react-free-style`.
 */
export interface ReactFreeStyleContext {
  freeStyle: StyleContext
  rootFreeStyle: RootStyleContext
}

/**
 * Wrap a React component to automatically attach and detach styles.
 */
export function wrap <T> (
  Component: React.ComponentClass<T> | React.StatelessComponent<T>,
  ...styles: FreeStyle.FreeStyle[]
): React.ComponentClass<T> {
  const displayName = Component.displayName || (Component as any).name
  const componentStyles = styles.map(x => x.clone())

  return class StyleContainer <T> extends React.Component <T, any> {

    static displayName = `FreeStyleContainer(${displayName || 'Component'})`

    static contextTypes: React.ValidationMap<any> = {
      freeStyle: React.PropTypes.object,
      rootFreeStyle: React.PropTypes.object
    }

    static childContextTypes: React.ValidationMap<any> = {
      freeStyle: React.PropTypes.object.isRequired,
      rootFreeStyle: React.PropTypes.object.isRequired
    }

    _rootFreeStyle = (this.context as ReactFreeStyleContext).rootFreeStyle || new RootStyleContext()
    _freeStyle = new StyleContext(this._rootFreeStyle)

    getChildContext () {
      return {
        freeStyle: this._freeStyle,
        rootFreeStyle: this._rootFreeStyle
      }
    }

    componentWillMount () {
      for (const style of componentStyles) {
        this._rootFreeStyle.style.merge(style)
      }

      this._freeStyle.mount()
    }

    componentWillUnmount () {
      for (const style of componentStyles) {
        this._rootFreeStyle.style.unmerge(style)
      }

      this._freeStyle.unmount()
    }

    render () {
      return React.createElement(Component, this.props as any)
    }

  }
}

/**
 * Create the `<style />` element.
 */
export class StyleElement extends React.Component<{}, {}> {

  static displayName = 'Style'

  static contextTypes: React.ValidationMap<any> = {
    rootFreeStyle: React.PropTypes.object.isRequired
  }

  onChange = () => {
    if (ReactCurrentOwner.current != null) {
      console.warn(
        'React Free Style: Inline styles can not be registered during `render`. ' +
        'If you want to style dynamically, use `componentWillMount` instead.'
      )
    }

    return this.forceUpdate()
  }

  componentWillMount () {
    ;(this.context as ReactFreeStyleContext).rootFreeStyle.addChangeListener(this.onChange)
  }

  componentWillUnmount () {
    ;(this.context as ReactFreeStyleContext).rootFreeStyle.removeChangeListener(this.onChange)
  }

  render () {
    const style = (this.context as ReactFreeStyleContext).rootFreeStyle.style.getStyles()

    return React.createElement('style', {
      dangerouslySetInnerHTML: { __html: style }
    })
  }

}

/**
 * Create a class for passing down the style context.
 */
export class RootStyleContext {

  listeners: Array<() => void> = []
  style = create()
  prevChangeId = this.style.changeId

  changed () {
    if (this.style.changeId !== this.prevChangeId) {
      this.prevChangeId = this.style.changeId
      this.listeners.forEach(x => x())
    }
  }

  addChangeListener (cb: () => void) {
    this.listeners.push(cb)
  }

  removeChangeListener (cb: () => void) {
    const indexOf = this.listeners.indexOf(cb)

    if (indexOf > -1) {
      this.listeners.splice(indexOf, 1)
    }
  }

}

/**
 * The style context object is passed to the child context to allow dynamic styles.
 */
export class StyleContext {

  style = create()

  constructor (public root: RootStyleContext) {}

  registerStyle (styles: FreeStyle.UserStyles, displayName?: string) {
    this.root.style.unmerge(this.style)
    const className = this.style.registerStyle(styles, displayName)
    this.root.style.merge(this.style)
    this.root.changed()
    return className
  }

  registerKeyframes (styles: FreeStyle.UserStyles, displayName?: string) {
    this.root.style.unmerge(this.style)
    const keyframes = this.style.registerKeyframes(styles, displayName)
    this.root.style.merge(this.style)
    this.root.changed()
    return keyframes
  }

  registerRule (rule: string, styles: FreeStyle.UserStyles) {
    this.root.style.unmerge(this.style)
    this.style.registerRule(rule, styles)
    this.root.style.merge(this.style)
    this.root.changed()
  }

  mount () {
    this.root.style.merge(this.style)
    this.root.changed()
  }

  unmount () {
    this.root.style.unmerge(this.style)
    this.root.changed()
  }

}

/**
 * Create a Free Style instance.
 */
export function create (hash?: FreeStyle.HashFunction, debug?: boolean) {
  return FreeStyle.create(hash, debug)
}
