'use strict'

const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ProgressPlugin = require('webpack/lib/ProgressPlugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const OfflinePlugin = require('offline-plugin')
const base = require('./webpack.common')('production')
const _ = require('./utils')
// use chunk hash
base.output = {
  filename: 'static/[name].[chunkhash:7].js',
  chunkFilename: 'static/[name].[chunkhash:7].js',
  path: _.resolve('./dist'),
  publicPath: '/',
}
// add webpack plugins
base.plugins.push(
  new ProgressPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  new MiniCssExtractPlugin({
    filename: 'static/style/[name].[contenthash:8].css',
    chunkFilename: 'static/style/[id].[contenthash:8].css',
  }),
  new CleanWebpackPlugin(['dist/appcache', 'dist/static', 'dist/index.html', 'dist/sw.js'], {
    root: _.cwd('.'),
  }),
  new OfflinePlugin({
    relativePaths: false,
    ServiceWorker: {
      events: true,
      navigateFallbackURL: '/',
    },
    AppCache: {
      events: true,
      FALLBACK: {
        '/': '/',
      },
    },
  })
)

base.optimization = {
  minimizer: [
    new UglifyJSPlugin({
      cache: true,
      parallel: true,
      sourceMap: false, // set to true if you want JS source maps
      uglifyOptions: {
        compress: {
          drop_console: true,
        },
      },
    }),
  ],
  splitChunks: {
    chunks: 'all',
    minSize: 30000,
    minChunks: 2,
    maxAsyncRequests: 2,
    maxInitialRequests: 2,
    name: true,
  },
}

// minimize webpack output
base.stats = {
  // Add children information
  children: false,
  // Add chunk information (setting this to `false` allows for a less verbose output)
  chunks: false,
  // Add built modules information to chunk information
  chunkModules: false,
  chunkOrigins: false,
  modules: false,
}

module.exports = base