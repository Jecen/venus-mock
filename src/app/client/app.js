import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import App from './components/App'
import router from './router'
import store from './store'
import iView from 'iview'
import Http, { httpConfig, HTTP_ERROR_MAP, HttpError } from 'venus-fetch' // eslint-disable-line
import components from './components'
import 'venus-ui'
import Socket from './lib/io'

import 'iview/dist/styles/iview.css'
Vue.use(iView)
Vue.use(components)
Vue.use(Socket, { path: 'http://localhost:9000', namespace: 'mock' })
sync(store, router)

const app = new Vue({
  router,
  store,
  ...App,
})

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
})
Vue.prototype.http = http
Vue.prototype.$isDev = process.env.NODE_ENV === 'development'
export {
  app, router, store, http,
}
