/* global describe, it, afterEach */

var expect = require('chai').expect
var React = require('react')
var Style = require('./')

describe('react free style', function () {
  afterEach(function () {
    Style.empty()
  })

  it('should render the style element', function () {
    var TEXT_STYLE = Style.registerStyle({
      backgroundColor: 'red'
    })

    var App = React.createElement(
      'div',
      null,
      React.createElement('div', { className: TEXT_STYLE.className }, 'Hello world!'),
      React.createElement(Style.Element)
    )

    expect(React.renderToStaticMarkup(App)).to.match(new RegExp(
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

      mixins: [Style.mixin()],

      componentWillMount: function () {
        inlineStyle = this.inlineStyle = this.registerStyle(this.props.style)
      },

      render: function () {
        return React.createElement(
          'button',
          { className: Style.join(this.inlineStyle.className, BUTTON_STYLE.className) },
          this.props.children
        )
      }

    })

    var App = React.createElement(
      'div',
      null,
      React.createElement(Button, { style: { color: 'red' } }, 'Hello world!'),
      React.createElement(Style.Element)
    )

    expect(React.renderToStaticMarkup(App)).to.match(new RegExp(
      '<div>' +
      '<button class="' + inlineStyle.className + ' ' + BUTTON_STYLE.className + '">Hello world!</button>' +
      '<style>' + BUTTON_STYLE.selector + '{background-color:red;}' + inlineStyle.selector + '{color:red;}</style>' +
      '</div>'
    ))
  })
})
