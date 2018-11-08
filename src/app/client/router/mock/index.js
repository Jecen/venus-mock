import Mock from '@/mock'

const Project = () => import('@/mock/children/project')
const Overview = () => import('@/mock/children/overview')
const Api = () => import('@/mock/children/api')

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
  }, {
    path: '/mock/api/:hostId',
    component: Api,
  }],
}
