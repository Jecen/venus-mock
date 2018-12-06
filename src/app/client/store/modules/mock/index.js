import { http } from 'root/app'

// 初始化store对象
const state = {
  projects: [],
  overView: { project: { hosts: { list: [] }}},

  hostField: {
    id: '',
    name: '',
    host: '',
    port: 80,
    path: '',
    protocol: 1,
    online: true,
  },
  apiField: {
    id: '',
    name: '',
    url: '',
    type: 7,
  },
  methodField: {
    id: '',
    name: '',
    method: 3,
    result: '',
    params: [],
  },
  currentMethod: null,
}

// 异步操作放到action handler里
const actions = {
  // graphql
  async getProjects({ commit }) {
    http.post('/graphql', {
      query: `query {
        __schema{
          types {
            name
            kind
            fields {
              name
            }
          }
        }
      }`,
      variable: { },
    })
    const { data, success } = await http.post('/graphql', {
      query: `query ($projectPage: Int!, $projectSize: Int!) {
        projectList (page: $projectPage, size: $projectSize) {
          list { id name img description crDate
            hosts (page: 1, size: 200) { total
              list {
                apis (page: 1, size: 200) { total
                  list {
                    methods (page: 1, size: 200) { total }
                  }
                }
              }
            }
            records (page: 1, size: 200) { total }
          }
        },
      }`,
      variable: { projectPage: 1, projectSize: 100 },
    })
    if (success) {
      const { projectList: { list }} = data
      commit('updateProjects', list)
    }
  },
  async insertProject({ state }, payload) { // eslint-disable-line
    const { data, success } = await http.post('/graphql', {
      query: `mutation ($project: projectField!) { insertProject(project: $project) }`,
      variable: { project: payload },
    })
    if (success) {
      return data
    }
  },
  async updateProject({ state }, payload) { // eslint-disable-line
    const { data, success } = await http.post('/graphql', {
      query: `mutation ($project: updateProjectField!) { updateProject(project: $project) }`,
      variable: { project: payload },
    })
    if (success) {
      return data
    }
  },
  async deleteProject({ state }, payload) { // eslint-disable-line
    const { data, success } = await http.post('/graphql', {
      query: `mutation ($id: ID!) { deleteProject(id: $id) }`,
      variable: { id: payload.id },
    })
    if (success) {
      return data
    }
  },
  async getOverViewDate({ commit }, payload) { // eslint-disable-line
    const { data, success } = await http.post('/graphql', {
      query: `query ($id: Int!) { project(id: $id) {
        id name description img crDate
        hosts (page: 1, size: 200) {
          list {
            id name host port path protocol protocolName online
            apis (page: 1, size: 200) {
              list {
                id name url type
                methods (page: 1, size: 200) {
                  list {
                    id name method methodName disable result
                    params (page: 1, size: 200) {
                      list {
                        id name key type info mandatory
                      }
                    }
                  }
                }
              }
            }
          }
        }
        records (page: 1, size: 200) {
          total
          list {
            success
          }
        }
      }}`,
      variable: { id: parseInt(payload.id) },
    })
    if (success) {
      commit('updateOverView', data)
      return data
    }
  },
  async insertHost({ state }, payload) { // eslint-disable-line
    const { data, success } = await http.post('/graphql', {
      query: `mutation ($host: hostField!) { insertHost(host: $host) }`,
      variable: { host: payload },
    })
    if (success) {
      return data
    }
  },
  async updateHost({ state }, payload) { // eslint-disable-line
    const { data, success } = await http.post('/graphql', {
      query: `mutation ($host: updateHostField!) { updateHost(host: $host) }`,
      variable: { host: payload },
    })
    if (success) {
      return data
    }
  },
  async insertApi({ state }, payload) { // eslint-disable-line
    const { data, success } = await http.post('/graphql', {
      query: `mutation ($api: apiField!) { insertApi(api: $api) }`,
      variable: { api: payload },
    })
    if (success) {
      return data
    }
  },
  async updateApi({ state }, payload) { // eslint-disable-line
    const { data, success } = await http.post('/graphql', {
      query: `mutation ($api: updateApiField!) { updateApi(api: $api) }`,
      variable: { api: payload },
    })
    if (success) {
      return data
    }
  },
  async insertMethod({ state }, payload) { // eslint-disable-line
    const { data, success } = await http.post('/graphql', {
      query: `mutation ($method: methodField!) { insertMethod(method: $method) }`,
      variable: { method: payload },
    })
    if (success) {
      return data
    }
  },
  async insertParams({ state }, payload) { // eslint-disable-line
    const { data, success } = await http.post('/graphql', {
      query: `mutation ($params: [paramField]!) { insertParams(params: $params) }`,
      variable: { params: payload },
    })
    if (success) {
      return data
    }
  },
}

const mutations = {
  updateProjects(state, payload) {
    state.projects = payload
  },
  updateOverView(state, payload) {
    state.overView = payload
  },

  updateHostField(state, payload) {
    state.hostField = payload || {
      id: '',
      name: '',
      host: '',
      port: 80,
      path: '',
      protocol: 1,
      online: true,
    }
  },
  updateApiField(state, payload) {
    state.apiField = payload || {
      id: '',
      name: '',
      url: '',
      type: 7,
    }
  },
  updateMethodField(state, payload) {
    state.methodField = payload || {
      id: '',
      name: '',
      method: 3,
      result: '',
      params: [],
    }
  },

  showCurrentMethod(state, payload) {
    state.currentMethod = payload
  },
}


const getters = {
  projects(state) {
    return state.projects
  },
  overview(state) {
    return state.overView
  },

  hostField(state) {
    return state.hostField
  },
  apiField(state) {
    return state.apiField
  },
  methodField(state) {
    return state.methodField
  },

  hosts(state) {
    const { overView: { project: { hosts: { list }}}} = state
    return list.map((h) => {
      const temp = Object.assign({}, h)
      delete temp['apis']
      return temp
    })
  },

  apis(state) {
    const { hostField: { id }, overView: { project: { hosts: { list }}}} = state
    if (id) {
      const [host] = list.filter(h => h.id === id)
      if (host) {
        const { apis: { list } = { list: [] }} = host
        return list.map((a) => {
          const temp = Object.assign({}, a)
          return temp
        })
      }
    }
    return []
  },

  methods(state) {
    const { hostField: { id: hostId }, apiField: { id: apiId }, overView: { project: { hosts: { list }}}} = state
    if (hostId && apiId) {
      const [host] = list.filter(h => h.id === hostId)
      if (host) {
        const { apis: { list } = { list: [] }} = host
        const [api] = list.filter(a => a.id === apiId)
        if (api) {
          const { methods: { list }} = api
          return list
        }
      }
    }
    return []
  },

  insertField(state) {
    return {
      host: state.hostField,
      api: state.apiField,
      method: state.methodField,
    }
  },

  currentMethod(state) {
    return state.currentMethod
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
