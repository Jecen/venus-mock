const webpack = require('webpack')
const _ = require('./utils')
const CleanWebpackPlugin = require('clean-webpack-plugin')
module.exports = {
  mode: 'production',
  entry: {
    vendor: ['vue', 'iview', 'vue-router', 'vuex'],
  },
  output: {
    path: _.cwd('./dist/dll'),
    filename: 'dll_[name].js',
    library: '[name]_[hash]',
  },
  plugins: [
    new webpack.DllPlugin({
      path: _.cwd('./dist/dll/[name]-manifest.json'),
      name: '[name]_[hash]',
    }),
    new CleanWebpackPlugin(['dist/dll'], {
      root: _.cwd('.'),
    }),
  ],
}

