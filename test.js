/* global describe, it, beforeEach */

var expect = require('chai').expect
var React = require('react')
var ReactFreeStyle = require('./')

describe('react free style', function () {
  var Style

  beforeEach(function () {
    Style = ReactFreeStyle.create()
  })

  it('should render the style element', function () {
    var TEXT_STYLE = Style.registerStyle({
      backgroundColor: 'red'
    })

    var App = React.createClass({

      mixins: [Style.Mixin],

      render: function () {
        return React.createElement(
          'div',
          null,
          React.createElement('div', { className: TEXT_STYLE.className }, 'Hello world!'),
          React.createElement(Style.Element)
        )
      }

    })

    expect(React.renderToStaticMarkup(React.createElement(App))).to.match(new RegExp(
      '<div>' +
      '<div class="' + TEXT_STYLE.className + '">Hello world!</div>' +
      '<style>' + TEXT_STYLE.selector + '{background-color:red;}</style>' +
      '</div>'
    ))
  })

  it('should support mixin methods', function () {
    var inlineStyle

    var BUTTON_STYLE = Style.registerStyle({
      backgroundColor: 'red'
    })

    var Button = React.createClass({

      mixins: [Style.Mixin],

      render: function () {
        return React.createElement(
          'button',
          { className: BUTTON_STYLE.className },
          React.createElement(Child)
        )
      }

    })

    var Child = React.createClass({

      mixins: [Style.Mixin],

      componentWillMount: function () {
        inlineStyle = this.inlineStyle = this.registerStyle({ color: 'blue' })
      },

      render: function () {
        return React.createElement(GrandChild, { className: this.inlineStyle.className })
      }

    })

    var GrandChild = React.createClass({

      render: function () {
        return React.createElement('div', this.props, 'Hello world!')
      }

    })

    var App = React.createClass({

      mixins: [Style.Mixin],

      render: function () {
        return React.createElement(
          'div',
          null,
          React.createElement(Button),
          React.createElement(Style.Element)
        )
      }

    })

    expect(React.renderToStaticMarkup(React.createElement(App))).to.match(new RegExp(
      '<div>' +
      '<button class="' + BUTTON_STYLE.className + '"><div class="' + inlineStyle.className + '">Hello world!</div></button>' +
      '<style>' + BUTTON_STYLE.selector + '{background-color:red;}' + inlineStyle.selector + '{color:blue;}</style>' +
      '</div>'
    ))
  })
})
