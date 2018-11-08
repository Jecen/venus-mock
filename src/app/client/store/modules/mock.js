import { http } from '../../app'

// 定义action type
const FETCH_HOST_LIST = 'FETCH_HOST_LIST'

const FETCH_PROJECTS_LIST = 'FETCH_PROJECTS_LIST'
const INSERT_PROJECT = 'INSERT_PROJECT'
const UPDATE_PROJECT = 'UPDATE_PROJECT'
const GET_PROJECT_BY_ID = 'GET_PROJECT_BY_ID'
const DEL_PROJECT_BY_ID = 'DEL_PROJECT_BY_ID'
const GET_METHOD_LIST = 'GET_METHOD_LIST'

// 指定对应api
const api = {
  [FETCH_HOST_LIST]: '/mock/host/getList',
  [FETCH_PROJECTS_LIST]: '/mock/project/getList',
  [INSERT_PROJECT]: '/mock/project/insert',
  [UPDATE_PROJECT]: '/mock/project/update',
  [GET_PROJECT_BY_ID]: '/mock/project/getProject',
  [DEL_PROJECT_BY_ID]: '/mock/project/delProject',
  [GET_METHOD_LIST]: '/mock/method/getList',
}

// 初始化store对象
const state = {
  hosts: [],
  projects: [],
}

// 异步操作放到action handler里
const actions = {
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
  getMethodList({ commit }, payload) { //eslint-disable-line
    return new Promise((resolve) => {
      http.get(api[GET_METHOD_LIST], payload)
        .then(rst => {
          resolve(rst)
        })
        .catch(e => console.log(e, 'error'))
    })
  },

  insertProject({ state }, payload) { // eslint-disable-line
    return new Promise((resolve) => {
      http.post(api[INSERT_PROJECT], payload)
        .then(rst => {
          resolve(rst)
        })
        .catch(e => console.log(e, 'error'))
    })
  },
  updateProject({ state }, payload) { // eslint-disable-line
    return new Promise((resolve) => {
      http.post(api[UPDATE_PROJECT], payload)
        .then(rst => {
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
  getProjectById({ state }, payload) { // eslint-disable-line
    return new Promise((resolve) => {
      http.get(api[GET_PROJECT_BY_ID], payload)
        .then(rst => {
          resolve(rst)
        })
        .catch(e => console.log(e, 'error'))
    })
  },
  delProject({ state }, payload) { // eslint-disable-line
    return new Promise((resolve) => {
      http.delete(api[DEL_PROJECT_BY_ID], payload)
        .then(rst => {
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
