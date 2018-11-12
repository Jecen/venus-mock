
import apiFunc, { commonApi } from './api'

// 初始化store对象
const state = {
  dicts: {},
}

// 异步操作放到action handler里
const actions = {
  uploadImg({ state }, payload) { // eslint-disable-line
    return apiFunc[commonApi.UPLOAD_IMG](payload)
  },
  getDict({ commit }, payload) { //eslint-disable-line
    return apiFunc[commonApi.GET_DICT_BY_NAME](payload, (data) => {
      commit('saveDict', data)
    })
  },
}

const mutations = {
  saveDict(state, dict) {
    state.dicts[dict.dictName] = dict
  },
}


const getters = {
  dict: (state) => (name) => {
    return state.dicts[name]
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
