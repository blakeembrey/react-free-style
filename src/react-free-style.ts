import React = require('react')
import FreeStyle = require('free-style')
import ReactCurrentOwner = require('react/lib/ReactCurrentOwner')
import ExecutionEnvironment = require('react/lib/ExecutionEnvironment')

declare var module: any

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
  component (component: React.ComponentClass<any>): React.ComponentClass<any> {
    /**
     * Keep a reference to the current free style instance.
     */
    var freeStyle = this

    /**
     * Create a higher order style component.
     */
    return React.createClass({

      displayName: 'ReactFreeStyle',

      contextTypes: {
        freeStyle: React.PropTypes.object
      },

      childContextTypes: {
        freeStyle: React.PropTypes.object.isRequired
      },

      getChildContext () {
        return {
          freeStyle: this._rootFreeStyle
        }
      },

      componentWillMount () {
        this._rootFreeStyle = this.context.freeStyle || new ReactFreeStyle()
        this._rootFreeStyle.attach(freeStyle)
      },

      componentWillUnmount () {
        this._rootFreeStyle.detach(freeStyle)
      },

      render () {
        return React.createElement(component, this.props)
      }

    })
  }
}

/**
 * Create the <style /> element.
 */
export class StyleElement extends React.Component<{}, {}> {

  onChange = () => this.forceUpdate()

  static displayName = 'Style'

  static contextTypes: React.ValidationMap<any> = {
    freeStyle: React.PropTypes.object.isRequired
  }

  componentWillMount () {
    if (ExecutionEnvironment.canUseDOM) {
      this.context.freeStyle.addChangeListener(this.onChange)
    }
  }

  componentWillUnmount () {
    if (ExecutionEnvironment.canUseDOM) {
      this.context.freeStyle.removeChangeListener(this.onChange)
    }
  }

  render () {
    return React.createElement('style', {
      dangerouslySetInnerHTML: { __html: this.context.freeStyle.getStyles() }
    })
  }

}

var createFreeStyle: () => ReactFreeStyle

/* istanbul ignore next */
if (module.hot) {
  var freeStyleCache: { [id: string]: ReactFreeStyle } = {}

  createFreeStyle = function () {
    var id = (<any>new Error()).stack.replace(/Error.*?\r?\n/, '').split('\n')[1]
    var instance = freeStyleCache[id]

    if (instance) {
      instance.empty()

      return instance
    }

    return (freeStyleCache[id] = new ReactFreeStyle())
  }
} else {
  createFreeStyle = function () {
    return new ReactFreeStyle()
  }
}

export var create = createFreeStyle
