import { http } from '../../app'

// 定义action type
const FETCH_HOST_LIST = 'FETCH_HOST_LIST'
const FETCH_PROJECTS_LIST = 'FETCH_PROJECTS_LIST'
const INSERT_PROJECT = 'INSERT_PROJECT'

// 指定对应api
const api = {
  [FETCH_HOST_LIST]: '/mock/host/getList',
  [FETCH_PROJECTS_LIST]: '/mock/project/getList',
  [INSERT_PROJECT]: '/mock/project/insert',
}

// 初始化store对象
const state = {
  hosts: [],
  projects: [],
}

// 异步操作放到action handler里
const actions = {
  insertProject({ state }, payload) { // eslint-disable-line
    return new Promise((resolve) => {
      http.post(api[INSERT_PROJECT], payload)
        .then(rst => {
          resolve(rst)
        })
        .catch(e => console.log(e, 'error'))
    })
  },
  getHostList({ commit }, payload) {
    return new Promise((resolve) => {
      http.get(api[FETCH_HOST_LIST], payload)
        .then(rst => {
          const { list } = rst.data
          commit(FETCH_HOST_LIST, list)
          resolve(rst)
        })
        .catch(e => console.log(e, 'error'))
    })
  },
  getProjectsList({ commit }, payload) {
    return new Promise((resolve) => {
      http.get(api[FETCH_PROJECTS_LIST], payload)
        .then(rst => {
          const { list } = rst.data
          commit(FETCH_PROJECTS_LIST, list)
          resolve(rst)
        })
        .catch(e => console.log(e, 'error'))
    })
  },
}

const mutations = {
  [FETCH_HOST_LIST](state, payload) {
    state.hosts = payload
  },
  [FETCH_PROJECTS_LIST](state, payload) {
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
