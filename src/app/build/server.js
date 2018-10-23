/**
 * dev service config
 */

const path = require('path')

module.exports = {
  contentBase: path.join(__dirname, '../dist'),
  hot: true,
  host: 'localhost',
  port: 5001,
  proxy: {
    // 代理示例
    '/api': {
      target: 'http://venus-mock.com/api',
      pathRewrite: {
        '/api': '',
      },
    },
  },
}