import React = require('react')
import FreeStyle = require('free-style')
import ReactCurrentOwner = require('react/lib/ReactCurrentOwner')
import ExecutionEnvironment = require('react/lib/ExecutionEnvironment')

declare var module: any

/**
 * Create a specialized free style instance.
 */
export class ReactFreeStyle extends FreeStyle.FreeStyle {
  emitChange (type: string, style: FreeStyle.StyleType) {
    if (ReactCurrentOwner.current != null) {
      console.warn('Inline styles must be registered before `render`')
      return
    }

    return super.emitChange(type, style)
  }

  component (component: React.ComponentClass<any>): React.ComponentClass<any> {
    /**
     * Keep a reference to the current free style instance.
     */
    var freeStyle = this

    /**
     * Create a higher order style component.
     */
    return React.createClass({

      displayName: 'FreeStyle',

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
        this.isRoot = !this.context.freeStyle
        this._rootFreeStyle = this.context.freeStyle || new ReactFreeStyle()

        this._rootFreeStyle.attach(freeStyle)

        if (this.context.freeStyle) {
          this.context.freeStyle.attach(this._rootFreeStyle)
        }
      },

      componentWillUnmount () {
        this._rootFreeStyle.detach(freeStyle)

        if (this.context.freeStyle) {
          this.context.freeStyle.detach(this._rootFreeStyle)
        }
      },

      render () {
        if (!this.isRoot) {
          return React.createElement(component, this.props)
        }

        return React.createElement(
          'div',
          null,
          React.createElement(component, this.props),
          React.createElement(StyleElement)
        )
      }

    })
  }
}

/**
 * Create the <style /> element.
 */
class StyleElement extends React.Component<{}, {}> {

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
    this.context.freeStyle.removeChangeListener(this.onChange)
  }

  render () {
    return React.createElement('style', {
      dangerouslySetInnerHTML: { __html: this.context.freeStyle.getStyles() }
    })
  }

}

var createFreeStyle: () => ReactFreeStyle

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
