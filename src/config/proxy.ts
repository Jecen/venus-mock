export default {
  port: 9001,
  rule: require('../common/mockRules'),
  webInterface: {
    enable: true,
    webPort: 9101,
    wsPort: 9102
  },
  // 限速设置 kb/s
  throttle: 1000,
  // 强制拦截https
  forceProxyHttps: false,
  // 屏蔽console输出
  silent: false,
  // 忽略证书错误
  dangerouslyIgnoreUnauthorized: false
}