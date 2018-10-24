import { http } from '../../app'

// 定义action type
const FETCH_HOST_LIST = 'FETCH_HOST_LIST'

// 指定对应api
const api = {
  [FETCH_HOST_LIST]: '/mock/host/getList',
}

// 初始化store对象
const state = {
  hosts: [],
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
}

const mutations = {
  [FETCH_HOST_LIST](state, payload) {
    state.hosts = payload
  },
}


const getters = {
  hosts(state) {
    return state.hosts
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
