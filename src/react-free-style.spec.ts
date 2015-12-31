/* global describe, it, beforeEach */

import { expect } from 'chai'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
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
          { className: TEXT_STYLE },
          'Hello world!',
          React.createElement(Style.Element)
        )
      }

    }))

    expect(renderToStaticMarkup(React.createElement(App))).to.equal(
      '<div class="' + TEXT_STYLE + '">' +
      'Hello world!' +
      '<style>.' + TEXT_STYLE + '{background-color:red}</style>' +
      '</div>'
    )
  })

  it('should render the example dynamic styles', function () {
    let inlineStyle: FreeStyle.Style

    const BUTTON_STYLE = Style.registerStyle({
      backgroundColor: 'red',
      padding: 10
    })

    const ButtonComponent = React.createClass<{ style: any }, {}>({

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
            className: Style.join(this.inlineStyle, BUTTON_STYLE)
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

    expect(renderToStaticMarkup(React.createElement(App))).to.equal(
      '<div>' +
      '<button class="' + inlineStyle + ' ' + BUTTON_STYLE + '">Hello world!</button>' +
      '<style>.' + BUTTON_STYLE + '{background-color:red;padding:10px}.' + inlineStyle + '{color:blue}</style>' +
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
          { className: BUTTON_STYLE },
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
          { className: APP_STYLE },
          React.createElement(Child),
          React.createElement(Style.Element)
        )
      }

    }))

    expect(renderToStaticMarkup(React.createElement(App))).to.equal(
      '<div class="' + APP_STYLE + '">' +
      '<div>' +
      '<button class="' + BUTTON_STYLE + '">Hello world!</button>' +
      '</div>' +
      '<style>.' + APP_STYLE + '{color:blue}.' + BUTTON_STYLE + '{background-color:red}</style>' +
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
          { className: TEXT_STYLE },
          'Hello world!',
          React.createElement(Style.Element)
        )
      }

    }

    expect(renderToStaticMarkup(React.createElement(App))).to.equal(
      '<div class="' + TEXT_STYLE + '">' +
      'Hello world!' +
      '<style>.' + TEXT_STYLE + '{background-color:red}</style>' +
      '</div>'
    )
  })
})
