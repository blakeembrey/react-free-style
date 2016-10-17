/* global describe, it, beforeEach */

import { expect } from 'chai'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { create, Style, wrap, rewind, FreeStyle, ReactFreeStyleContext } from './react-free-style'

describe('react free style', function () {
  let TestStyle: FreeStyle.FreeStyle

  beforeEach(function () {
    TestStyle = create()
  })

  it('should render the main example', function () {
    const textStyle = TestStyle.registerStyle({
      backgroundColor: 'red'
    })

    const Component = React.createClass({

      displayName: 'App',

      render () {
        return React.createElement(
          Style,
          { style: TestStyle },
          React.createElement(
            'div',
            { className: textStyle },
            'Hello world!'
          )
        )
      }

    })

    const App = wrap(Component, TestStyle)

    expect(renderToStaticMarkup(React.createElement(App))).to.equal(
      `<div class="${textStyle}">Hello world!</div>`
    )

    expect(rewind().toString()).to.equal(
      `<style data-react-free-style="true">.${textStyle}{background-color:red}</style>`
    )
  })

  it('should render the example dynamic styles', function () {
    let inlineStyle = ''

    const buttonStyle = TestStyle.registerStyle({
      backgroundColor: 'red',
      padding: 10
    })

    class ButtonComponent extends React.Component<{ style: any }, {}> {

      static contextTypes = {
        freeStyle: React.PropTypes.object.isRequired
      }

      inlineStyle: string

      componentWillMount () {
        const style = (this.context as ReactFreeStyleContext).freeStyle.registerStyle(this.props.style)

        inlineStyle = this.inlineStyle = style
      }

      render () {
        return React.createElement<{ className: string }, HTMLButtonElement>(
          'button',
          {
            className: `${this.inlineStyle} ${buttonStyle}`
          },
          this.props.children as any
        )
      }

    }

    const Component = React.createClass({

      render () {
        return React.createElement(
          'div',
          {},
          React.createElement(
            ButtonComponent,
            { style: { color: 'blue'} },
            'Hello world!'
          )
        )
      }

    })

    const App = wrap(Component, TestStyle)

    expect(renderToStaticMarkup(React.createElement(App))).to.equal(
      '<div>' +
      '<button class="' + inlineStyle + ' ' + buttonStyle + '">Hello world!</button>' +
      '</div>'
    )

    expect(rewind().toString()).to.equal(
      `<style data-react-free-style="true">.${buttonStyle}{background-color:red;` +
      `padding:10px}.${inlineStyle}{color:blue}</style>`
    )
  })

  it('should work with nested styles', function () {
    const NestedStyle = create()

    const appStyle = TestStyle.registerStyle({
      color: 'blue'
    })

    const buttonStyle = NestedStyle.registerStyle({
      backgroundColor: 'red'
    })

    const Button = wrap(
      React.createClass({

        render () {
          return React.createElement(
            'button',
            { className: buttonStyle },
            'Hello world!'
          )
        }

      }),
      NestedStyle
    )

    const Child = React.createClass({

      render () {
        return React.createElement(
          'div',
          {},
          React.createElement(Button)
        )
      }

    })

    const App = wrap(
      React.createClass({

        render () {
          return React.createElement(
            'div',
            { className: appStyle },
            React.createElement(Child)
          )
        }

      }),
      TestStyle
    )

    expect(renderToStaticMarkup(React.createElement(App))).to.equal(
      '<div class="' + appStyle + '">' +
      '<div>' +
      '<button class="' + buttonStyle + '">Hello world!</button>' +
      '</div>' +
      '</div>'
    )

    expect(rewind().toString()).to.equal(
      `<style data-react-free-style="true">.${appStyle}{color:blue}.${buttonStyle}{background-color:red}</style>`
    )
  })

  it('should work with stateless components', function () {
    let inlineStyle = ''

    const appStyle = TestStyle.registerStyle({
      background: 'red'
    })

    const ChildComponent: React.StatelessComponent<{}> = (props: {}, context: ReactFreeStyleContext) => {
      inlineStyle = context.freeStyle.registerStyle({ color: 'blue' })

      return <span className={inlineStyle}>hello world</span>
    }

    ChildComponent.contextTypes = {
      freeStyle: React.PropTypes.object.isRequired
    }

    const Child = wrap(ChildComponent)

    const App = wrap(
      () => <div className={appStyle}><Child /></div>,
      TestStyle
    )

    expect(renderToStaticMarkup(React.createElement(App))).to.equal(
      '<div class="' + appStyle + '">' +
      '<span class="' + inlineStyle + '">hello world</span>' +
      '</div>'
    )

    expect(rewind().toString()).to.equal(
      `<style data-react-free-style="true">.${appStyle}{background:red}.${inlineStyle}{color:blue}</style>`
    )
  })
})
