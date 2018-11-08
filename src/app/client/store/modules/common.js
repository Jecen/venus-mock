import { http } from '../../app'

// 定义action type
const UPLOAD_IMG = 'UPLOAD_IMG'
const GET_DICT_BY_NAME = 'GET_DICT_BY_NAME'

// 指定对应api
const api = {
  [UPLOAD_IMG]: '/mock/common/upload',
  [GET_DICT_BY_NAME]: '/mock/common/dict',
}

// 初始化store对象
const state = {
}

// 异步操作放到action handler里
const actions = {
  uploadImg({ state }, payload) { // eslint-disable-line
    return new Promise((resolve) => {
      http.post(api[UPLOAD_IMG], payload, { type: 'upload' })
        .then(rst => {
          resolve(rst)
        })
        .catch(e => console.log(e, 'error'))
    })
  },
  getDict({ commit }, payload) { //eslint-disable-line
    return new Promise((resolve) => {
      http.get(api[GET_DICT_BY_NAME], payload)
        .then(rst => {
          // const { list } = rst.data
          // commit(FETCH_HOST_LIST, list)
          resolve(rst)
        })
        .catch(e => console.log(e, 'error'))
    })
  },
}

const mutations = {
}


const getters = {
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
