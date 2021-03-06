// webpack common config

'use strict'

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const _ = require('./utils')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = (mode) => ({
  mode,
  context: _.resolve('./client'),
  entry: {
    client: 'index.js',
  },
  output: {
    filename: 'static/[name].[hash:7].js',
    chunkFilename: 'static/[name].[hash:7].js',
    path: _.resolve('./dist'),
    publicPath: '/',
  },
  performance: {
    hints: mode === 'production' ? 'warning' : false,
  },
  resolve: {
    extensions: ['.mjs', '.js', '.vue', '.css', '.json'],
    alias: {
      root: path.join(__dirname, '../client'),
      components: path.join(__dirname, '../client/components'),
      '@': path.join(__dirname, '../client/views'),
    },
    modules: [
      _.resolve('node_modules'),
      _.resolve('client'),
    ],
  },
  module: {
    rules: [{
      test: /\.vue$/,
      loader: 'vue-loader',
    }, {
      test: /\.js$/,
      use: ['babel-loader'],
      exclude: [/node_modules/],
    }, {
      test: /\.es6$/,
      use: ['babel-loader'],
    }, {
      test: /\.(ico|jpg|svg|png|gif|eot|otf|webp|ttf|woff|woff2)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 8192,
        name: 'static/media/[name].[hash:8].[ext]',
      },
    },
    ..._.styleRules(mode),
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Venus-Mock',
      template: path.resolve(__dirname, 'index.html'),
      inject: true,
    }),
    new CopyWebpackPlugin([{
      from: _.resolve('./static'),
      // to the root of dist path
      to: './static',
    }]),
    new VueLoaderPlugin(),
  ],
  target: 'web',
})
