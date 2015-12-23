declare module 'react/lib/ReactCurrentOwner' {
  import React = require('react')

  var ReactCurrentOwner: {
    current: React.ReactElement<any> | void
  }

  export = ReactCurrentOwner
}
