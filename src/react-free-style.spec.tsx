/* global describe, it, beforeEach */

import { expect } from 'chai'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { FreeStyle, StyleComponent, wrap, rewind, styled, StyledComponentProps, StyleContext, STYLE_ID } from './react-free-style'

describe('react free style', function () {
  it('should render the main example', function () {
    const withStyles = styled({
      text: {
        backgroundColor: 'red'
      }
    }, {
      css: {
        '*': {
          boxSizing: 'border-box'
        }
      }
    })

    const App = withStyles((props) => {
      return <div className={props.styles.text}>Hello world!</div>
    })

    expect(renderToStaticMarkup(React.createElement(App))).to.equal(
      `<div class="${withStyles.styles.text}">Hello world!</div>`
    )

    const rewound = rewind()
    const expectedCss = `.${withStyles.styles.text}{background-color:red}*{box-sizing:border-box}`

    expect(rewound.toCss()).to.equal(expectedCss)
    expect(rewound.toString()).to.equal(`<style id="${STYLE_ID}">${expectedCss}</style>`)
  })

  it('should work with `wrap()`', function () {
    let inlineStyle = ''
    const Style = FreeStyle.create()

    const appStyle = Style.registerStyle({
      background: 'red'
    })

    const ChildComponent: React.StatelessComponent<{ freeStyle: StyleContext }> = (props) => {
      inlineStyle = props.freeStyle.registerStyle({ color: 'blue' })

      return <span className={inlineStyle}>hello world</span>
    }

    const Child = wrap(ChildComponent, Style, true)

    const App = wrap(
      () => <div className={appStyle}><Child /></div>,
      Style
    )

    expect(renderToStaticMarkup(React.createElement(App))).to.equal(
      '<div class="' + appStyle + '">' +
      '<span class="' + inlineStyle + '">hello world</span>' +
      '</div>'
    )

    expect(rewind().toCss()).to.equal(
      `.${appStyle}{background:red}.${inlineStyle}{color:blue}`
    )
  })

  it('should work as a hoc', () => {
    const withStyles = styled({
      button: {
        color: 'red'
      }
    })

    const Component = withStyles((props: StyledComponentProps<'button'> & { freeStyle: StyleContext }) => {
      props.freeStyle.registerCss({ body: { color: 'blue' } })

      return <div className={props.styles.button}>Test</div>
    }, true)

    expect(renderToStaticMarkup(React.createElement(Component))).to.equal(
      '<div class="' + withStyles.styles.button + '">Test</div>'
    )

    expect(rewind().toCss()).to.equal(
      `.${withStyles.styles.button}{color:red}body{color:blue}`
    )
  })
})
