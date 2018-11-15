import apiFunc, {projectApi, hostApi, apiApi, methodApi, paramApi} from './api' // eslint-disable-line

// 初始化store对象
const state = {
  hosts: [],
  projects: [],
  overView: {},
}

// 异步操作放到action handler里
const actions = {
  insertHost({ state }, payload) { // eslint-disable-line
    return apiFunc[hostApi.INSERT_HOST](payload)
  },
  updateHost({ state }, payload) { // eslint-disable-line
    return apiFunc[hostApi.UPDATE_HOST](payload)
  },
  delHost({ state }, payload) { // eslint-disable-line
    return apiFunc[hostApi.DEL_HOST](payload)
  },
  getHostList({ commit }, payload) {
    return apiFunc[hostApi.FETCH_HOST_LIST](payload, (data) => {
      const { list } = data
      commit('updateHostList', list)
    })
  },


  // Project action
  insertProject({ state }, payload) { // eslint-disable-line
    return apiFunc[projectApi.INSERT_PROJECT](payload)
  },
  updateProject({ state }, payload) { // eslint-disable-line
    return apiFunc[projectApi.UPDATE_PROJECT](payload)
  },
  getProjectsList({ commit }, payload) {
    return apiFunc[projectApi.FETCH_PROJECTS_LIST](payload, (data) => {
      const { list } = data
      commit('updateProjectList', list)
    })
  },
  getProjectById({ state }, payload) { // eslint-disable-line
    return apiFunc[projectApi.GET_PROJECT](payload)
  },
  delProject({ state }, payload) { // eslint-disable-line
    return apiFunc[projectApi.DEL_PROJECT](payload)
  },

  async getHostOverviewData({ state }, payload) {// eslint-disable-line
    const { id: hostId } = payload
    const { list: apiList } = await apiFunc[apiApi.FETCH_API_LIST]({ id: hostId })
    const actions = []
    apiList.forEach((api) => {
      actions.push(apiFunc[methodApi.FETCH_METHOD_LIST]({ id: api.id }))
    })
    const methodArray = await Promise.all(actions)
    const rstApis = methodArray.map(({ list: methods }, index) => {
      return {
        ...apiList[index],
        methods,
      }
    })
    return rstApis
  },

  // business api
  async getOverViewDate({ state, commit }, payload) { // eslint-disable-line
    const { id: projectId } = payload
    const rst = {}
    rst['project'] = await apiFunc[projectApi.GET_PROJECT]({ id: projectId })
    const hosts = await apiFunc[hostApi.FETCH_HOST_LIST]({ id: projectId, size: 100 })
    rst['host'] = hosts.list
    return rst
  },

  async addMockRule({ state }, payload) {// eslint-disable-line
    const { id: projectId, host, api, method } = payload
    let rollBackHostId = ''
    let rollBackApiId = ''
    const rollBackMethods = []
    const rollBackParams = []
    try {
      const { id: hostId } = host.id ? host : await apiFunc[hostApi.INSERT_HOST]({
        ...host,
        projectId,
      })
      rollBackHostId = hostId
      const { id: apiId } = api.id ? api : await apiFunc[apiApi.INSERT_API]({
        ...api,
        projectId,
        hostId,
      })
      rollBackApiId = apiId
      await Object.keys(method).forEach(async (key) => {

        const m = method[key]
        if (m.name) {
          const { params } = m
          const { id: methodId } = m.id ? m : await apiFunc[methodApi.INSERT_METHOD]({
            ...m,
            projectId,
            hostId,
            apiId,
          })
          rollBackMethods.push(methodId)
          if (m.id) {
            await params.forEach(async (p) => {
              const { id: paramId } = await apiFunc[paramApi.INSERT_PARAM]({
                ...p,
                projectId,
                hostId,
                apiId,
                methodId,
              })
              rollBackParams.push(paramId)
            })
          }
        }
      })
    } catch (error) {
      rollBackParams.length > 0 && await rollBackParams.forEach(async (id) => {
        await apiFunc[paramApi.DEL_PARAM]({ id })
      })
      rollBackMethods.length > 0 && await rollBackMethods.forEach(async (id) => {
        await apiFunc[methodApi.DEL_METHOD]({ id })
      })
      rollBackApiId && await apiFunc[apiApi.DEL_API]({ id: rollBackApiId })
      rollBackHostId && await apiFunc[hostApi.DEL_HOST]({ id: rollBackHostId })
      console.log(error)
    }
  },
}

const mutations = {
  updateHostList(state, payload) {
    state.hosts = payload
  },
  updateProjectList(state, payload) {
    state.projects = payload
  },
}


const getters = {
  hosts(state) {
    return state.hosts
  },
  projects(state) {
    return state.projects
  },
}

// 导出vuex模块
export default {
  // 模块开启命名空间
  namespaced: true,

  state,
  actions,
  mutations,
  getters,
}
