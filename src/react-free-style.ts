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
   *
   * @type {StyleElement}
   */
  Element = StyleElement

  /**
   * Override emit change to warn when changing styles during render.
   *
   * @param {string}              type
   * @param {FreeStyle.StyleType} style
   */
  emitChange (type: string, style: FreeStyle.StyleType) {
    if (ReactCurrentOwner.current != null) {
      console.warn('Inline styles must be registered before `render`')
      return
    }

    return super.emitChange(type, style)
  }

  /**
   * Wrap a React component in a higher order `ReactFreeStyle` component.
   *
   * @param  {React.ComponentClass<any>} component
   * @return {React.ComponentClass<any>}
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

      static contextTypes = extend(Component.contextTypes, {
        freeStyle: React.PropTypes.object
      })

      static childContextTypes = extend(Component.childContextTypes, {
        freeStyle: React.PropTypes.object.isRequired
      })

      getChildContext () {
        return extend((proto.componentWillUpdate || noop).call(this), {
          freeStyle: this._parentFreeStyle
        })
      }

      componentWillUpdate () {
        // Hook into component updates to keep styles in sync over hot code
        // reloads. This works great with React Hot Loader!
        if (module.hot && this._freeStyle.id !== freeStyle.id) {
          this._parentFreeStyle.detach(this._freeStyle)
          this._parentFreeStyle.attach(freeStyle)
          this._freeStyle = freeStyle
        }

        ;(proto.componentWillUpdate || noop).call(this)
      }

      componentWillMount () {
        this._parentFreeStyle.attach(this._freeStyle)

        ;(proto.componentWillMount || noop).call(this)
      }

      componentWillUnmount () {
        this._parentFreeStyle.detach(this._freeStyle)

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
    this.context.freeStyle.addChangeListener(this.onChange)
  }

  componentWillUnmount () {
    this.context.freeStyle.removeChangeListener(this.onChange)
  }

  render () {
    return React.createElement('style', {
      dangerouslySetInnerHTML: { __html: this.context.freeStyle.getStyles() }
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
 * Noop.
 */
function noop () {}
