/// <reference path="../typings/tsd.d.ts" />

import React = require('react')
import FreeStyle = require('free-style')
import ReactCurrentOwner = require('react/lib/ReactCurrentOwner')
import ExecutionEnvironment = require('react/lib/ExecutionEnvironment')

/**
 * Create a specialized free style instance.
 */
export class ReactFreeStyle extends FreeStyle.FreeStyle {
  Mixin = createMixin(this)
  Element = createElement(this)

  emitChange (type: string, style: FreeStyle.StyleType) {
    if (ReactCurrentOwner.current != null) {
      console.warn('Inline styles must be registered before `render`')

      return
    }

    return super.emitChange(type, style)
  }
}

export type ChildContext = {
  _freeStyle: ReactFreeStyle
}

export interface ReactFreeStyleMixin {
  contextTypes: { _freeStyle: any }
  childContextTypes: { _freeStyle: any }

  getChildContext: () => ChildContext
  registerStyle: () => FreeStyle.Style
  registerKeyframes: () => FreeStyle.Keyframes

  componentWillMount: () => void
  componentWillUnmount: () => void
}

/**
 * Create a mixin for the free style instance.
 */
function createMixin (freeStyle: ReactFreeStyle): ReactFreeStyleMixin {
  var Mixin: ReactFreeStyleMixin = {

    contextTypes: {
      _freeStyle: React.PropTypes.object
    },

    childContextTypes: {
      _freeStyle: React.PropTypes.object.isRequired
    },

    getChildContext () {
      var context: ChildContext = { _freeStyle: freeStyle }

      return context
    },

    _addFreeStyle (o: FreeStyle.StyleType): FreeStyle.StyleType {
      var cache = this._freeStyleCache

      if (!cache[o.id]) {
        cache[o.id] = o
        freeStyle.add(o)
      }

      return o
    },

    _removeFreeStyle (o: FreeStyle.StyleType): void {
      var cache = this._freeStyleCache

      if (cache[o.id]) {
        cache[o.id] = undefined
        freeStyle.remove(o)
      }
    },

    registerStyle () {
      return this._addFreeStyle(freeStyle.createStyle.apply(freeStyle, arguments))
    },

    registerKeyframes () {
      return this._addFreeStyle(freeStyle.createKeyframes.apply(freeStyle, arguments))
    },

    componentWillMount () {
      var parent = this.context._freeStyle

      this._freeStyleCache = {}

      if (parent) {
        parent.attach(freeStyle)
      }
    },

    componentWillUnmount () {
      var cache = this._freeStyleCache
      var parent = this.context._freeStyle

      Object.keys(cache).forEach((key) => {
        return cache[key] && this._removeFreeStyle(cache[key])
      })

      this._freeStyleCache = undefined

      if (parent) {
        parent.detach(freeStyle)
      }
    }

  }

  return Mixin
}

/**
 * Create an element to mount for the current instance.
 */
function createElement (style: ReactFreeStyle): React.ClassicComponentClass<{}> {
  var Style = React.createClass({

    displayName: 'Style.Element',

    componentWillMount () {
      if (ExecutionEnvironment.canUseDOM) {
        style.addChangeListener(this.onChange)
      }
    },

    componentWillUnmount () {
      style.removeChangeListener(this.onChange)
    },

    onChange () {
      this.forceUpdate()
    },

    render () {
      return React.createElement('style', null, style.getStyles())
    }

  })

  return Style
}

export function create () {
  return new ReactFreeStyle()
}
