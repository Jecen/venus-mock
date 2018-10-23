import Vue from 'vue'
import Router from 'vue-router'
// import Home from '../views/Home/index'
// import HomeVue from '../views/Home/home.vue'
const Home = () => import('../views/Home/index')
const HomeVue = () => import('../views/Home/home.vue')

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      component: Home
    }, {
      path: '/home',
      component: HomeVue
    }
  ]
})
