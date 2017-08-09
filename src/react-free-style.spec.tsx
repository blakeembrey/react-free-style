/* global describe, it, beforeEach */

import { expect } from 'chai'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { FreeStyle, StyleComponent, wrap, rewind, styled, StyledComponentProps } from './react-free-style'

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

    expect(rewind().toString()).to.equal(
      `<style data-react-free-style="true">.${withStyles.styles.text}{background-color:red}*{box-sizing:border-box}</style>`
    )
  })

  it('should work with `wrap()`', function () {
    let inlineStyle = ''
    const Style = FreeStyle.create()

    const appStyle = Style.registerStyle({
      background: 'red'
    })

    const ChildComponent: React.StatelessComponent<{ inlineStyle: string }> = (props) => {
      return <span className={props.inlineStyle}>hello world</span>
    }

    const Child = wrap(ChildComponent, undefined, (props: {}, freeStyle) => {
      inlineStyle = freeStyle.registerStyle({ color: 'blue' })

      return Object.assign({}, props, { inlineStyle })
    })

    const App = wrap(
      () => <div className={appStyle}><Child /></div>,
      Style
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

  it('should work as a hoc', () => {
    const withStyles = styled({
      button: {
        color: 'red'
      }
    })

    const Component = withStyles((props) => {
      props.freeStyle.registerCss({ body: { color: 'blue' } })

      return <div className={props.styles.button}>Test</div>
    })

    expect(renderToStaticMarkup(React.createElement(Component))).to.equal(
      '<div class="' + withStyles.styles.button + '">Test</div>'
    )

    expect(rewind().toString()).to.equal(
      `<style data-react-free-style="true">.${withStyles.styles.button}{color:red}body{color:blue}</style>`
    )
  })
})
