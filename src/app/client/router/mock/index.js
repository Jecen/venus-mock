import Mock from '@/mock'

const Project = () => import('@/mock/children/project')
const Host = () => import('@/mock/children/host')
const Api = () => import('@/mock/children/api')

export default {
  path: '/mock',
  component: Mock,
  redirect: '/mock/project',
  children: [{
    path: '/mock/project',
    component: Project,
  }, {
    path: '/mock/host/:projectId',
    component: Host,
  }, {
    path: '/mock/api/:hostId',
    component: Api,
  }],
}
