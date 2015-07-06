/* global describe, it, beforeEach */

import { expect } from 'chai'
import * as React from 'react'
import { create, ReactFreeStyle, FreeStyle, injectStyle } from './react-free-style'

describe('react free style', function () {
  let Style: ReactFreeStyle

  beforeEach(function () {
    Style = create()
  })

  it('should render the main example', function () {
    const TEXT_STYLE = Style.registerStyle({
      backgroundColor: 'red'
    })

    const App = Style.component(React.createClass({

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
      '<div class="' + TEXT_STYLE.className + '">' +
      'Hello world!' +
      '<style>' + TEXT_STYLE.selector + '{background-color:red;}</style>' +
      '</div>'
    )
  })

  it('should render the example dynamic styles', function () {
    let inlineStyle: FreeStyle.Style

    const BUTTON_STYLE = Style.registerStyle({
      backgroundColor: 'red',
      padding: 10
    })

    const ButtonComponent = React.createClass({

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

    const App = Style.component(React.createClass({

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
    const ChildStyle = create()

    const APP_STYLE = Style.registerStyle({
      color: 'blue'
    })

    const BUTTON_STYLE = ChildStyle.registerStyle({
      backgroundColor: 'red'
    })

    const Button = ChildStyle.component(React.createClass({

      render: function () {
        return React.createElement(
          'button',
          { className: BUTTON_STYLE.className },
          'Hello world!'
        )
      }

    }))

    const Child = ChildStyle.component(React.createClass({

      render: function () {
        return React.createElement(
          'div',
          null,
          React.createElement(Button)
        )
      }

    }))

    const App = Style.component(React.createClass({

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

  it('should set display name to the component name', function () {
    const TEXT_STYLE = Style.registerStyle({
      backgroundColor: 'red'
    })

    @injectStyle(Style)
    class App extends React.Component<{}, {}> {

      render () {
        return React.createElement(
          'div',
          { className: TEXT_STYLE.className },
          'Hello world!',
          React.createElement(Style.Element)
        )
      }

    }

    expect((<any> App).displayName).to.equal('App')

    expect(React.renderToStaticMarkup(React.createElement(App))).to.equal(
      '<div class="' + TEXT_STYLE.className + '">' +
      'Hello world!' +
      '<style>' + TEXT_STYLE.selector + '{background-color:red;}</style>' +
      '</div>'
    )
  })
})
