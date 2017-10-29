import * as React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'
import { styled } from '../'

function reducer (state = {}, action) {
  if (action.type === 'RANDOM_COLOR') {
    const color = '#' + `000000${(Math.random()*0xFFFFFF|0).toString(16)}`.slice(-6)
    return Object.assign({}, state, { color })
  }

  return state
}

const store = createStore(reducer)

const App = (props) => {
  const { dispatch, color, freeStyle, styles } = props
  const backgroundColor = freeStyle.registerStyle({ backgroundColor: color })

  return React.createElement(
    'div',
    { className: `${backgroundColor} ${styles.container}` },
    React.createElement(
      'button',
      { onClick: () => dispatch({ type: 'RANDOM_COLOR' }) },
      'Random Color'
    )
  )
}

const withState = connect(({ color }) => ({ color }))

const withStyle = styled(
  {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100vw',
      height: '100vh'
    }
  },
  {
    css: {
      body: {
        fontFamily: 'sans-serif',
        margin: 0
      }
    }
  }
)

render(
  React.createElement(
    Provider,
    { store },
    React.createElement(withStyle(withState(App), true))
  ),
  document.getElementById('app')
)
