'use strict'
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const _ = module.exports = {}

_.cwd = (file) => {
  return path.join(process.cwd(), file || '')
}
_.resolve = (dir) => {
  return path.join(__dirname, '..', dir)
}

_.cssLoader = 'css-loader?-autoprefixer'

_.cssProcessors = [{
  loader: '',
  test: /\.css$/,
},
{
  loader: 'sass-loader?sourceMap',
  test: /\.scss$/,
},
{
  loader: 'less-loader?sourceMap',
  test: /\.less$/,
},
{
  loader: 'stylus-loader?sourceMap',
  test: /\.styl$/,
},
{
  loader: 'sass-loader?indentedSyntax&sourceMap',
  test: /\.sass$/,
},
]

_.styleRules = (mode) => {
  const rules = []
  _.cssProcessors.forEach(processor => {
    let loaders
    if (processor.loader === '') {
      loaders = ['postcss-loader']
    } else {
      loaders = ['postcss-loader', processor.loader]
    }

    rules.push({
      test: processor.test,
      use: [
        mode === 'development' ? 'vue-style-loader' :
          MiniCssExtractPlugin.loader,
        'css-loader',
      ].concat(loaders),
    })
  })
  return rules
}
