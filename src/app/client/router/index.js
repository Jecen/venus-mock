import Vue from 'vue'
import Router from 'vue-router'
// module
import Mock from './mock'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      redirect: '/mock/project',
    },
    Mock,
  ],
})
