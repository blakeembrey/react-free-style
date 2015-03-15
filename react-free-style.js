var React = require('react')
var FreeStyle = require('free-style').FreeStyle
var ReactCurrentOwner = require('react/lib/ReactCurrentOwner')

/**
 * Create a React Free Style instance.
 */
function ReactFreeStyle () {
  FreeStyle.call(this)

  this.Element = createElement(this)
}

/**
 * Inherits from `free-style`.
 */
ReactFreeStyle.prototype = Object.create(FreeStyle.prototype)

/**
 * Create a new React Free Style instance.
 *
 * @return {ReactFreeStyle}
 */
ReactFreeStyle.prototype.fresh = function () {
  return new ReactFreeStyle()
}

/**
 * Create a mixin for React.
 *
 * @return {Object}
 */
ReactFreeStyle.prototype.mixin = function () {
  return createMixin(this)
}

/**
 * Override `emitChange` to catch invalid uses in React.
 */
ReactFreeStyle.prototype.emitChange = function () {
  if (ReactCurrentOwner.current != null) {
    console.warn('Inline styles must be registered before `render`')

    return
  }

  FreeStyle.prototype.emitChange.apply(this, arguments)
}

/**
 * Create a mixin from a `ReactFreeStyle` instance.
 *
 * @param  {ReactFreeStyle} reactFreeStyle
 * @return {Object}
 */
function createMixin (reactFreeStyle) {
  /**
   * Create a React.js mixin for inline styles.
   *
   * @type {Object}
   */
  var Mixin = {

    registerStyle: function () {
      var o = reactFreeStyle.registerStyle.apply(reactFreeStyle, arguments)
      this._freeStyleCache[o.hash] = o
      return o
    },

    registerKeyframes: function () {
      var o = reactFreeStyle.registerKeyframes.apply(reactFreeStyle, arguments)
      this._freeStyleCache[o.hash] = o
      return o
    },

    componentWillMount: function () {
      this._freeStyleCache = {}
    },

    componentWillUnmount: function () {
      var cache = this._freeStyleCache

      Object.keys(cache).forEach(function (key) {
        reactFreeStyle.remove(cache[key])
      })

      this._freeStyleCache = undefined
    }

  }

  return Mixin
}

/**
 * Create a React style component.
 *
 * @param  {ReactFreeStyle} reactFreeStyle
 * @return {ReactElement}
 */
function createElement (reactFreeStyle) {
  /**
   * Create a style element.
   */
  var Style = React.createClass({

    componentDidMount: function () {
      reactFreeStyle.addChangeListener(this.onChange)
    },

    componentWillUnmount: function () {
      reactFreeStyle.removeChangeListener(this.onChange)
    },

    onChange: function () {
      this.forceUpdate()
    },

    render: function () {
      return React.createElement('style', null, reactFreeStyle.getStyles())
    }

  })

  return Style
}

/**
 * Export the interface.
 */
module.exports = new ReactFreeStyle()
