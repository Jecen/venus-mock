import Mock from '@/mock'

const Host = () => import('@/mock/children/host')
const Api = () => import('@/mock/children/api')

export default {
  path: '/mock',
  component: Mock,
  redirect: '/mock/host',
  children: [{
    path: '/mock/host',
    component: Host,
  }, {
    path: '/mock/api/:hostId',
    component: Api,
  }],
}
