import Mock from '@/mock'

const Project = () => import(/* webpackChunkName: "page-project" */'@/mock/children/project')
const Overview = () => import(/* webpackChunkName: "page-overview" */'@/mock/children/overview')
// const Api = () => import(/* webpackChunkName: "outer-redirect" */'@/mock/children/api')

export default {
  path: '/mock',
  component: Mock,
  redirect: '/mock/project',
  children: [{
    path: '/mock/project',
    component: Project,
  }, {
    path: '/mock/overview/:projectId',
    component: Overview,
  }],
}
