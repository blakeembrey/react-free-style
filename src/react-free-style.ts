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

class RefReactFreeStyle extends ReactFreeStyle {
  constructor (public parent: ReactFreeStyle) {
    super()
  }

  _mountedCount: number = 0
}

export type ChildContext = {
  freeStyle: ReactFreeStyle
}

export interface ReactFreeStyleMixin {
  contextTypes: { freeStyle: any }
  childContextTypes: { freeStyle: any }

  getChildContext: () => ChildContext
  registerStyle: () => FreeStyle.Style
  registerKeyframes: () => FreeStyle.Keyframes

  componentWillMount: () => void
  componentWillUnmount: () => void
}

/**
 * Create a mixin for the free style instance.
 */
function createMixin (Style: ReactFreeStyle): ReactFreeStyleMixin {
  var _freeStyle: ReactFreeStyle

  /**
   * Add a style to the temporary cache.
   */
  function add (Element: any, o: FreeStyle.StyleType): FreeStyle.StyleType {
    var cache = Element._freeStyleCache

    if (!cache[o.id]) {
      cache[o.id] = o
      Style.add(o)
    }

    return o
  }

  /**
   * Remove a style from the temporary cache.
   */
  function remove (Element: any, o: FreeStyle.StyleType): void {
    var cache = Element._freeStyleCache

    if (cache[o.id]) {
      cache[o.id] = undefined
      Style.remove(o)
    }
  }

  /**
   * Get the element root style instance.
   */
  function getInstance (Element: any): RefReactFreeStyle {
    return Element.context.freeStyle || _freeStyle || (_freeStyle = new RefReactFreeStyle(Style))
  }

  /**
   * Create a render mixin for styles.
   */
  var Mixin: ReactFreeStyleMixin = {

    contextTypes: {
      freeStyle: React.PropTypes.object
    },

    childContextTypes: {
      freeStyle: React.PropTypes.object.isRequired
    },

    getChildContext () {
      var context: ChildContext = {
        freeStyle: getInstance(this)
      }

      return context
    },

    registerStyle () {
      return <FreeStyle.Style>add(this, Style.createStyle.apply(Style, arguments))
    },

    registerKeyframes () {
      return <FreeStyle.Keyframes>add(this, Style.createKeyframes.apply(Style, arguments))
    },

    componentWillMount () {
      var parent = getInstance(this)

      parent.attach(Style)
      this._freeStyleCache = {}
    },

    // TODO: Figure out how to do this on the server-side.
    componentDidMount () {
      if (getInstance(this)._mountedCount === 0) {
        console.warn('React Free Style component has not been mounted (%s)', Style.id)
      }
    },

    componentWillUnmount () {
      var cache = this._freeStyleCache
      var parent = getInstance(this)

      Object.keys(cache).forEach((key) => {
        return cache[key] && remove(this, cache[key])
      })

      parent.detach(Style)
      this._freeStyleCache = undefined
    }

  }

  return Mixin
}

/**
 * Create an element to mount for the current instance.
 */
function createElement (Style: ReactFreeStyle): React.ClassicComponentClass<any> {
  /**
   * Create a <Style /> element.
   */
  var StyleElement = React.createClass({

    displayName: 'Style.Element',

    mixins: [Style.Mixin],

    getInitialState() {
      return {
        styles: this.context.freeStyle.getStyles()
      }
    },

    componentWillMount () {
      if (!this.context.freeStyle) {
        throw new Error('Styles must be attached using `Style.Mixin`')
      }

      this.context.freeStyle._mountedCount++

      if (ExecutionEnvironment.canUseDOM) {
        this.context.freeStyle.addChangeListener(this.onChange)
      }
    },

    componentWillUnmount () {
      this.context.freeStyle._mountedCount--
      this.context.freeStyle.removeChangeListener(this.onChange)
    },

    onChange () {
      this.setState({ styles: this.context.freeStyle.getStyles() })
    },

    render () {
      // Mount when this is the root style.
      if (this.context.freeStyle.parent === Style) {
        return React.createElement('style', null, this.state.styles)
      }

      return null
    }

  })

  return StyleElement
}

export function create () {
  return new ReactFreeStyle()
}
