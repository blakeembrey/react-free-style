import React = require('react')
import ReactCurrentOwner = require('react/lib/ReactCurrentOwner')
import extend = require('xtend')
export import FreeStyle = require('free-style')

declare const module: any

/**
 * Create a specialized free style instance.
 */
export class ReactFreeStyle extends FreeStyle.FreeStyle {

  /**
   * Expose the `StyleElement` for use.
   */
  Element = StyleElement

  /**
   * Override emit change to warn when changing styles during render.
   */
  emitChange (type: string, path: any) {
    if (ReactCurrentOwner.current != null) {
      console.warn('Inline styles must be registered before `render`')
      return
    }

    return super.emitChange(type, path)
  }

  /**
   * Create a React component that inherits from a user component. This is
   * required for methods on the user component to continue working once
   * wrapped with the style functionality.
   */
  component (Component: React.ComponentClass<any>): React.ComponentClass<any> {
    /**
     * Alias `free-style` instance for changes.
     */
    const freeStyle = this
    const proto = Component.prototype

    class ReactFreeStyleComponent extends Component {
      context: any
      _freeStyle = freeStyle
      _parentFreeStyle = this.context.freeStyle || new ReactFreeStyle()

      // Make sure debugging with React looks the same.
      static displayName = (<any> Component).displayName || (<any> Component).name

      static contextTypes = extend(Component.contextTypes, {
        freeStyle: React.PropTypes.object
      })

      static childContextTypes = extend(Component.childContextTypes, {
        freeStyle: React.PropTypes.object.isRequired
      })

      getChildContext () {
        return extend((proto.getChildContext || noop).call(this), {
          freeStyle: this._parentFreeStyle
        })
      }

      componentWillUpdate () {
        console.log(this.context)

        // Hook into component updates to keep styles in sync over hot code
        // reloads. This works great with React Hot Loader!
        if (module.hot && this._freeStyle.id !== freeStyle.id) {
          this._parentFreeStyle.unmerge(this._freeStyle)
          this._parentFreeStyle.merge(freeStyle)
          this._freeStyle = freeStyle
        }

        ;(proto.componentWillUpdate || noop).apply(this, arguments)
      }

      componentWillMount () {
        this._parentFreeStyle.merge(this._freeStyle)

        ;(proto.componentWillMount || noop).call(this)
      }

      componentWillUnmount () {
        this._parentFreeStyle.unmerge(this._freeStyle)

        ;(proto.componentWillUnmount || noop).call(this)
      }
    }

    // Alias `render` to the prototype for React Hot Loader to pick up changes.
    ;(<any> ReactFreeStyleComponent).prototype.render = proto.render

    return ReactFreeStyleComponent
  }

}

/**
 * Create the <style /> element.
 */
export class StyleElement extends React.Component<{}, {}> {

  static displayName = 'Style'

  static contextTypes: React.ValidationMap<any> = {
    freeStyle: React.PropTypes.object.isRequired
  }

  onChange = () => this.forceUpdate()

  componentWillMount () {
    ;(this.context as any).freeStyle.addChangeListener(this.onChange)
  }

  componentWillUnmount () {
    ;(this.context as any).freeStyle.removeChangeListener(this.onChange)
  }

  render () {
    return React.createElement('style', {
      dangerouslySetInnerHTML: { __html: (this.context as any).freeStyle.getStyles() }
    })
  }

}

/**
 * Create a React Free Style instance.
 */
export function create () {
  return new ReactFreeStyle()
}

/**
 * Accept a style instance for use with decorators.
 */
export function injectStyle (Style: ReactFreeStyle) {
  return function <T> (Component: T): T {
    return <any> Style.component(<any> Component)
  }
}

/**
 * Noop.
 */
function noop () {}
