import Vue from 'vue'
import Router from 'vue-router'
const Home = () => import('../views/Home/index')
const HomeVue = () => import('../views/Home/home.vue')
// module
import Mock from './mock'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      component: Home,
    }, {
      path: '/home',
      component: HomeVue,
    },
    Mock,
  ],
})
