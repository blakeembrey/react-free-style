import React = require('react')
import ReactCurrentOwner = require('react/lib/ReactCurrentOwner')
import extend = require('xtend')
export import FreeStyle = require('free-style')

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
    const freeStyle = this

    return class ReactFreeStyleComponent extends React.Component <any, any> {
      context: any
      _freeStyle = freeStyle
      _parentFreeStyle = this.context.freeStyle || new ReactFreeStyle()

      static contextTypes: React.ValidationMap<any> = {
        freeStyle: React.PropTypes.object
      }

      static childContextTypes: React.ValidationMap<any> = {
        freeStyle: React.PropTypes.object.isRequired
      }

      getChildContext () {
        return {
          freeStyle: this._parentFreeStyle
        }
      }

      componentWillUpdate () {
        // Hook into component updates to keep styles in sync over hot code
        // reloads. This works great with React Hot Loader!
        if (this._freeStyle.id !== freeStyle.id) {
          this._parentFreeStyle.unmerge(this._freeStyle)
          this._parentFreeStyle.merge(freeStyle)
          this._freeStyle = freeStyle
        }
      }

      componentWillMount () {
        this._parentFreeStyle.merge(this._freeStyle)
      }

      componentWillUnmount () {
        this._parentFreeStyle.unmerge(this._freeStyle)
      }

      render () {
        return React.createElement(Component, this.props)
      }

    }
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
