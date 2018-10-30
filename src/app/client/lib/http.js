import Http, { httpConfig, HTTP_ERROR_MAP, HttpError } from 'venus-fetch' // eslint-disable-line

export default (Vue, opt = {}) => {
  const http = Http({
    conf: {
      credentials: 'include',
      baseUrl: '/api',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
    timeout: 5000,
    ...opt,
  })

  http.injectAfter(rst => {
    const { success, errorMsg } = rst
    if (!success) { // 请求失败
      return new HttpError({
        code: 'API_ERROR',
        message: errorMsg,
      })
    }
  })

  //   http.injectAfter

  Vue.prototype.http = http
}