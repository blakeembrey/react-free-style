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

  _parentCount: number = 0
  _mountedCount: number = 0

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
      var context: ChildContext = {
        _freeStyle: this.context._freeStyle || freeStyle
      }

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

    _parentFreeStyle (): ReactFreeStyle {
      var parent = this.context._freeStyle

      return parent && parent !== freeStyle ? parent : null
    },

    registerStyle () {
      return this._addFreeStyle(freeStyle.createStyle.apply(freeStyle, arguments))
    },

    registerKeyframes () {
      return this._addFreeStyle(freeStyle.createKeyframes.apply(freeStyle, arguments))
    },

    componentWillMount () {
      var parent = this._parentFreeStyle()

      this._freeStyleCache = {}

      if (parent) {
        freeStyle._parentCount++
        parent.attach(freeStyle)
      }
    },

    // TODO: Figure out how to do this on the server-side.
    componentDidMount () {
      if (!this.context._freeStyle && freeStyle._mountedCount === 0) {
        console.warn('React Free Style component has not been mounted (%s)', freeStyle.id)
      }
    },

    componentWillUnmount () {
      var cache = this._freeStyleCache
      var parent = this._parentFreeStyle()

      Object.keys(cache).forEach((key) => {
        return cache[key] && this._removeFreeStyle(cache[key])
      })

      this._freeStyleCache = undefined

      if (parent) {
        freeStyle._parentCount--
        parent.detach(freeStyle)
      }
    }

  }

  return Mixin
}

/**
 * Create an element to mount for the current instance.
 */
function createElement (freeStyle: ReactFreeStyle): React.ClassicComponentClass<{}> {
  var Style = React.createClass({

    displayName: 'Style.Element',

    componentWillMount () {
      freeStyle._mountedCount++

      if (ExecutionEnvironment.canUseDOM) {
        freeStyle.addChangeListener(this.onChange)
      }
    },

    componentWillUnmount () {
      freeStyle._mountedCount--
      freeStyle.removeChangeListener(this.onChange)
    },

    onChange () {
      this.forceUpdate()
    },

    render () {
      // Avoid rendering more than once.
      if (freeStyle._parentCount) {
        return null
      }

      return React.createElement('style', null, freeStyle.getStyles())
    }

  })

  return Style
}

export function create () {
  return new ReactFreeStyle()
}
