var FreeStyle = require('free-style').FreeStyle

/**
 * Create a React Free Style instance.
 */
function ReactFreeStyle () {
  FreeStyle.call(this)

  this.refs = 0
  this.counter = {}
  this.el = undefined

  this.Mixin = createMixin(this)
}

/**
 * Inherits from `free-style`.
 */
ReactFreeStyle.prototype = Object.create(FreeStyle.prototype)

/**
 * Create and register a new class.
 */
ReactFreeStyle.prototype.registerClass = function () {
  return this.add(this.createClass.apply(this, arguments))
}

/**
 * Create and register key frame animations.
 */
ReactFreeStyle.prototype.registerKeyframes = function () {
  return this.add(this.createKeyframes.apply(this, arguments))
}

/**
 * Increment the style reference count and append on initial increment.
 *
 * @return {Element}
 */
ReactFreeStyle.prototype.ref = function () {
  if (this.refs === 0) {
    this.el = document.createElement('style')
    this.el.innerHTML = this.getStyles()
    document.head.appendChild(this.el)
  }

  this.refs++

  return this.el
}

/**
 * Decrement the style reference count and remove at zero.
 */
ReactFreeStyle.prototype.unref = function () {
  this.refs--

  if (this.refs === 0) {
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el)
    }

    this.el = undefined
  }
}

/**
 * Add to the cache and style sheet automatically.
 *
 * @param {(Namespace|Keyframes)} o
 */
ReactFreeStyle.prototype.add = function (o) {
  var hash = o.getHash()

  // Increment the reference counter.
  this.counter[hash] = (this.counter[hash] || 0) + 1

  // Append to the style element automatically.
  if (!this.has(o)) {
    FreeStyle.prototype.add.call(this, o)

    if (this.el) {
      this.el.innerHTML = this.getStyles()
    }
  }

  return o
}

/**
 * Remove from the cache and style sheet automatically.
 *
 * @param {(Namespace|Keyframes)} o
 */
ReactFreeStyle.prototype.remove = function (o) {
  var hash = o.getHash()
  var refs = this.counter[hash]

  if (refs > 0) {
    refs--
    this.counter[hash] = refs

    if (!refs) {
      FreeStyle.prototype.remove.call(this, o)

      if (this.el) {
        this.el.innerHTML = this.getStyles()
      }
    }
  }
}

/**
 * Create a mixin from a `ReactFreeStyle` instance.
 *
 * @param  {ReactFreeStyle} reactFreeStyle
 * @return {Object}
 */
function createMixin (reactFreeStyle) {
  /**
   * Add to the temporary style cache.
   *
   * @param {Object}                cache
   * @param {(Namespace|Keyframes)} style
   */
  function addCache (cache, o) {
    var hash = o.getHash()

    if (!cache[hash]) {
      cache[hash] = o
      reactFreeStyle.add(o)
    }

    return o
  }

  /**
   * Remove all temporary styles.
   *
   * @param {Object} cache
   */
  function emptyCache (cache) {
    Object.keys(cache).forEach(function (key) {
      reactFreeStyle.remove(cache[key])
    })
  }

  /**
   * Create the mixin interface.
   *
   * @type {Object}
   */
  var Mixin = {

    registerClass: function () {
      return addCache(
        this._freeStyleCache,
        reactFreeStyle.style.createClass.apply(reactFreeStyle.style, arguments)
      )
    },

    registerKeyframes: function () {
      return addCache(
        this._freeStyleCache,
        reactFreeStyle.style.createKeyframes.apply(reactFreeStyle.style, arguments)
      )
    },

    componentWillMount: function () {
      this._freeStyleSheet = reactFreeStyle.ref()
      this._freeStyleCache = {}
    },

    componentWillUnmount: function () {
      this._freeStyleSheet = reactFreeStyle.unref()
      this._freeStyleCache = emptyCache(this._freeStyleCache)
    }

  }

  return Mixin
}

/**
 * Export the external API.
 *
 * @type {Object}
 */
module.exports = {

  fresh: function () {
    return new ReactFreeStyle()
  }

}
