/// <reference path="../typings/tsd.d.ts" />

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

  component (Component: React.ComponentClass<any>): React.ComponentClass<any> {
    /**
     * Keep a reference to the current free style instance.
     */
    var freeStyle = this

    /**
     * Create a higher order style component.
     */
    var ReactStyleElement = React.createClass({

      displayName: 'Style',

      contextTypes: {
        freeStyle: React.PropTypes.object
      },

      childContextTypes: {
        freeStyle: React.PropTypes.object.isRequired
      },

      getChildContext () {
        return {
          freeStyle: this.rootStyle
        }
      },

      componentWillMount () {
        this.rootStyle = this.context.freeStyle || new RootReactFreeStyle(this)

        this.rootStyle.attach(freeStyle)
      },

      componentWillUnmount () {
        this.rootStyle.detach(freeStyle)
      },

      render () {
        if (this.rootStyle.element !== this) {
          return React.createElement(Component, this.props)
        }

        return React.createElement(
          'div',
          null,
          React.createElement(Component, this.props),
          React.createElement(StyleElement, { freeStyle })
        )
      }

    })

    return ReactStyleElement
  }
}

/**
 * Create the <style /> element.
 */
class StyleElement extends React.Component<{ freeStyle: ReactFreeStyle }, {}> {

  static contextTypes: React.ValidationMap<any> = {
    freeStyle: React.PropTypes.object
  }

  componentWillMount () {
    if (ExecutionEnvironment.canUseDOM) {
      this.context.freeStyle.addChangeListener(this.onChange)
    }
  }

  componentWillUnmount () {
    this.context.freeStyle.removeChangeListener(this.onChange)
  }

  onChange () {
    this.forceUpdate()
  }

  render () {
    return React.createElement('style', {
      dangerouslySetInnerHTML: { __html: this.context.freeStyle.getStyles() }
    })
  }

}

/**
 * Specialized root implementation.
 */
class RootReactFreeStyle extends ReactFreeStyle {

  constructor (public element: any) {
    super()
  }

}

var createFreeStyle: () => ReactFreeStyle

if (module.hot) {
  var freeStyleCache: { [id: string]: ReactFreeStyle } = {}

  createFreeStyle = function () {
    var e: any = new Error()
    var id = e.stack.split('\n')[2]
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
