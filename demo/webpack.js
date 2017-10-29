const path = require('path')

module.exports = {
  entry: path.join(__dirname, 'app.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'static')
  }
}
