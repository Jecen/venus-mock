import apiFunc, {projectApi, hostApi, apiApi, methodApi, paramApi} from './api' // eslint-disable-line
import { http } from 'root/app'

// 初始化store对象
const state = {
  hosts: [],
  projects: [],
  overView: {},
}

// 异步操作放到action handler里
const actions = {
  // graphql
  async getProjects({ commit }) {
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
                    id name method methodName disable
                    params (page: 1, size: 200) {
                      list {
                        id name
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
  // insertHost({ state }, payload) { // eslint-disable-line
  //   return apiFunc[hostApi.INSERT_HOST](payload)
  // },
  // updateHost({ state }, payload) { // eslint-disable-line
  //   return apiFunc[hostApi.UPDATE_HOST](payload)
  // },
  // delHost({ state }, payload) { // eslint-disable-line
  //   return apiFunc[hostApi.DEL_HOST](payload)
  // },
  // getHostList({ commit }, payload) {
  //   return apiFunc[hostApi.FETCH_HOST_LIST](payload, (data) => {
  //     const { list } = data
  //     commit('updateHostList', list)
  //   })
  // },


  // // Project action
  // insertProject({ state }, payload) { // eslint-disable-line
  //   return apiFunc[projectApi.INSERT_PROJECT](payload)
  // },
  // updateProject({ state }, payload) { // eslint-disable-line
  //   return apiFunc[projectApi.UPDATE_PROJECT](payload)
  // },
  // getProjectsList({ commit }, payload) {
  //   http.post('/graphql', {
  //     query: `{
  //         __type (name: "Query") {
  //           name
  //           fields {
  //             name
  //             type {
  //               name
  //               kind
  //               fields {
  //                 name
  //               }
  //             }
  //             args {
  //               name
  //             }
  //           }
  //         }
  //     }`,
  //   })
  //   http.post('/graphql', {
  //     query: `query ($projectPage: Int!, $projectSize: Int!) {
  //       projectList (page: $projectPage, size: $projectSize)  {
  //         total
  //         page
  //         size
  //         list {
  //           name
  //           hosts (page: 1, size: 200){
  //             total
  //             list {
  //               apis{
  //                 total
  //                 list{
  //                   methods {
  //                     total
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //           records (page: 1, size: 200){
  //             total
  //           }
  //         }
  //       },
  //     }`,
  //     variable: { projectPage: 1, projectSize: 1 },
  //   })

  //   return apiFunc[projectApi.FETCH_PROJECTS_LIST](payload, (data) => {
  //     const { list } = data
  //     commit('updateProjectList', list)
  //   })
  // },
  // getProjectById({ state }, payload) { // eslint-disable-line
  //   return apiFunc[projectApi.GET_PROJECT](payload)
  // },
  // delProject({ state }, payload) { // eslint-disable-line
  //   return apiFunc[projectApi.DEL_PROJECT](payload)
  // },

  // async getHostOverviewData({ state }, payload) {// eslint-disable-line
  //   const { id: hostId } = payload
  //   const { list: apiList } = await apiFunc[apiApi.FETCH_API_LIST]({ id: hostId })
  //   const actions = []
  //   apiList.forEach((api) => {
  //     actions.push(apiFunc[methodApi.FETCH_METHOD_LIST]({ id: api.id }))
  //   })
  //   const methodArray = await Promise.all(actions)
  //   const rstApis = methodArray.map(({ list: methods }, index) => {
  //     return {
  //       ...apiList[index],
  //       methods,
  //     }
  //   })
  //   return rstApis
  // },

  // // business api
  // async getOverViewDate({ state, commit }, payload) { // eslint-disable-line
  //   const { id: projectId } = payload
  //   const rst = {}
  //   rst['project'] = await apiFunc[projectApi.GET_PROJECT]({ id: projectId })
  //   const hosts = await apiFunc[hostApi.FETCH_HOST_LIST]({ id: projectId, size: 100 })
  //   rst['host'] = hosts.list
  //   return rst
  // },

  // async addMockRule({ state }, payload) {// eslint-disable-line
  //   const { id: projectId, host, api, method } = payload
  //   let rollBackHostId = ''
  //   let rollBackApiId = ''
  //   const rollBackMethods = []
  //   const rollBackParams = []
  //   try {
  //     const { id: hostId } = host.id ? host : await apiFunc[hostApi.INSERT_HOST]({
  //       ...host,
  //       projectId,
  //     })
  //     rollBackHostId = hostId
  //     const { id: apiId } = api.id ? api : await apiFunc[apiApi.INSERT_API]({
  //       ...api,
  //       projectId,
  //       hostId,
  //     })
  //     rollBackApiId = apiId
  //     await Object.keys(method).forEach(async (key) => {

  //       const m = method[key]
  //       if (m.name) {
  //         const { params } = m
  //         const { id: methodId } = m.id ? m : await apiFunc[methodApi.INSERT_METHOD]({
  //           ...m,
  //           projectId,
  //           hostId,
  //           apiId,
  //         })
  //         rollBackMethods.push(methodId)
  //         await params.forEach(async (p) => {
  //           const { id: paramId } = await apiFunc[paramApi.INSERT_PARAM]({
  //             ...p,
  //             projectId,
  //             hostId,
  //             apiId,
  //             methodId,
  //           })
  //           rollBackParams.push(paramId)
  //         })
  //       }
  //     })
  //   } catch (error) {
  //     rollBackParams.length > 0 && await rollBackParams.forEach(async (id) => {
  //       await apiFunc[paramApi.DEL_PARAM]({ id })
  //     })
  //     rollBackMethods.length > 0 && await rollBackMethods.forEach(async (id) => {
  //       await apiFunc[methodApi.DEL_METHOD]({ id })
  //     })
  //     rollBackApiId && await apiFunc[apiApi.DEL_API]({ id: rollBackApiId })
  //     rollBackHostId && await apiFunc[hostApi.DEL_HOST]({ id: rollBackHostId })
  //     console.log(error)
  //   }
  // },
}

const mutations = {
  updateProjects(state, payload) {
    state.projects = payload
  },
  updateOverView(state, payload) {
    state.overView = payload
  },
}


const getters = {
  hosts(state) {
    return state.hosts
  },
  projects(state) {
    return state.projects
  },
  overview(state) {
    return state.overView
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
