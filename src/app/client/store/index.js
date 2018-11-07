import Vue from 'vue'
import Vuex from 'vuex'

// 导入各个模块
// 模块通常以页面为维度组织
// 公用数据可以单独放在一个公用模块中

import  * as modules from './modules/*.js'

Vue.use(Vuex)

const state = {
}

const mutations = {
}

const actions = {
}

const store = new Vuex.Store({
  state,
  mutations,
  actions,

  // 将模块添加到store
  modules,
})

export default store
