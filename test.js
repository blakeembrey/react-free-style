/* global describe, it, beforeEach */

var expect = require('chai').expect
var React = require('react')
var ReactFreeStyle = require('./')

describe('react free style', function () {
  var Style

  beforeEach(function () {
    Style = ReactFreeStyle.create()
  })

  it('should render the main example', function () {
    var TEXT_STYLE = Style.registerStyle({
      backgroundColor: 'red'
    })

    var App = Style.component(React.createClass({

      displayName: 'App',

      render: function () {
        return React.createElement(
          'div',
          { className: TEXT_STYLE.className },
          'Hello world!',
          React.createElement(Style.Element)
        )
      }

    }))

    expect(React.renderToStaticMarkup(React.createElement(App))).to.equal(
      '<div class="' + TEXT_STYLE.className + '">Hello world!' +
      '<style>' + TEXT_STYLE.selector + '{background-color:red;}</style>' +
      '</div>'
    )
  })

  it('should render the example dynamic styles', function () {
    var inlineStyle

    var BUTTON_STYLE = Style.registerStyle({
      backgroundColor: 'red',
      padding: 10
    })

    var ButtonComponent = React.createClass({

      contextTypes: {
        freeStyle: React.PropTypes.object.isRequired
      },

      componentWillMount: function () {
        inlineStyle = this.inlineStyle = this.context.freeStyle.registerStyle(this.props.style)
      },

      render: function () {
        return React.createElement(
          'button',
          {
            className: Style.join(this.inlineStyle.className, BUTTON_STYLE.className)
          },
          this.props.children
        )
      }

    })

    var App = Style.component(React.createClass({

      render: function () {
        return React.createElement(
          'div',
          null,
          React.createElement(
            ButtonComponent,
            { style: { color: 'blue'} },
            'Hello world!'
          ),
          React.createElement(Style.Element)
        )
      }

    }))

    expect(React.renderToStaticMarkup(React.createElement(App))).to.equal(
      '<div>' +
      '<button class="' + inlineStyle.className + ' ' + BUTTON_STYLE.className + '">Hello world!</button>' +
      '<style>' + BUTTON_STYLE.selector + '{background-color:red;padding:10px;}' + inlineStyle.selector + '{color:blue;}</style>' +
      '</div>'
    )
  })

  it('should work with children', function () {
    var ChildStyle = ReactFreeStyle.create()

    var APP_STYLE = Style.registerStyle({
      color: 'blue'
    })

    var BUTTON_STYLE = ChildStyle.registerStyle({
      backgroundColor: 'red'
    })

    var Button = ChildStyle.component(React.createClass({

      render: function () {
        return React.createElement(
          'button',
          { className: BUTTON_STYLE.className },
          'Hello world!'
        )
      }

    }))

    var Child = ChildStyle.component(React.createClass({

      render: function () {
        return React.createElement(
          'div',
          null,
          React.createElement(Button)
        )
      }

    }))

    var App = Style.component(React.createClass({

      mixins: [Style.Mixin],

      render: function () {
        return React.createElement(
          'div',
          { className: APP_STYLE.className },
          React.createElement(Child),
          React.createElement(Style.Element)
        )
      }

    }))

    expect(React.renderToStaticMarkup(React.createElement(App))).to.equal(
      '<div class="' + APP_STYLE.className + '">' +
      '<div>' +
      '<button class="' + BUTTON_STYLE.className + '">Hello world!</button>' +
      '</div>' +
      '<style>' + APP_STYLE.selector + '{color:blue;}' + BUTTON_STYLE.selector + '{background-color:red;}</style>' +
      '</div>'
    )
  })
})
