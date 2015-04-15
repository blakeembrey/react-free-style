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
        this.rootStyle = new RefReactFreeStyle(this.context.freeStyle)

        this.rootStyle.attach(freeStyle)

        if (this.context.freeStyle) {
          this.context.freeStyle.attach(this.rootStyle)
        }
      },

      componentWillUnmount () {
        this.rootStyle.detach(freeStyle)

        if (this.context.freeStyle) {
          this.context.freeStyle.detach(this.rootStyle)
        }
      },

      render () {
        if (this.rootStyle.parent) {
          return React.createElement(Component, this.props)
        }

        return React.createElement(
          'div',
          null,
          React.createElement(Component, this.props),
          React.createElement(StyleElement, { style: this.rootStyle })
        )
      }

    })

    return ReactStyleElement
  }
}

/**
 * Create the <style /> element.
 */
class StyleElement extends React.Component<{ style: RefReactFreeStyle }, {}> {

  componentWillMount () {
    if (ExecutionEnvironment.canUseDOM) {
      this.props.style.addChangeListener(this.onChange)
    }
  }

  componentWillUnmount () {
    this.props.style.removeChangeListener(this.onChange)
  }

  onChange () {
    this.forceUpdate()
  }

  render () {
    return React.createElement('style', {
      dangerouslySetInnerHTML: { __html: this.props.style.getStyles() }
    })
  }

}

/**
 * Specialized root implementation.
 */
class RefReactFreeStyle extends ReactFreeStyle {

  constructor (public parent?: ReactFreeStyle) {
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
