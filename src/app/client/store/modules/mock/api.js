import { http } from 'root/app'

// 定义action type

// PROJECT - start
const FETCH_PROJECTS_LIST = 'FETCH_PROJECTS_LIST'
const INSERT_PROJECT = 'INSERT_PROJECT'
const UPDATE_PROJECT = 'UPDATE_PROJECT'
const GET_PROJECT = 'GET_PROJECT'
const DEL_PROJECT = 'DEL_PROJECT'
export const projectApi = {
  FETCH_PROJECTS_LIST,
  INSERT_PROJECT,
  UPDATE_PROJECT,
  GET_PROJECT,
  DEL_PROJECT,
}
// PROJECT - end

// HOST - start
const FETCH_HOST_LIST = 'FETCH_HOST_LIST'
const INSERT_HOST = 'INSERT_HOST'
const DEL_HOST = 'DEL_HOST'
const UPDATE_HOST = 'UPDATE_HOST'
const GET_HOST = 'GET_HOST'
export const hostApi = {
  FETCH_HOST_LIST,
  INSERT_HOST,
  DEL_HOST,
  UPDATE_HOST,
  GET_HOST,
}
// HOST - end

// API - start
const FETCH_API_LIST = 'FETCH_API_LIST'
const INSERT_API = 'INSERT_API'
const DEL_API = 'DEL_API'
const UPDATE_API = 'UPDATE_API'
const GET_API = 'GET_API'
export const apiApi = {
  FETCH_API_LIST,
  INSERT_API,
  DEL_API,
  UPDATE_API,
  GET_API,
}
// API - end

// METHOD - start
const FETCH_METHOD_LIST = 'FETCH_METHOD_LIST'
const INSERT_METHOD = 'INSERT_METHOD'
const DEL_METHOD = 'DEL_METHOD'
const UPDATE_METHOD = 'UPDATE_METHOD'
const GET_METHOD = 'GET_METHOD'
export const methodApi = {
  FETCH_METHOD_LIST,
  INSERT_METHOD,
  DEL_METHOD,
  UPDATE_METHOD,
  GET_METHOD,
}
// METHOD - end

// PARAM - start
const FETCH_PARAM_LIST = 'FETCH_PARAM_LIST'
const INSERT_PARAM = 'INSERT_PARAM'
const DEL_PARAM = 'DEL_PARAM'
const UPDATE_PARAM = 'UPDATE_PARAM'
const GET_PARAM = 'GET_PARAM'
export const paramApi = {
  FETCH_PARAM_LIST,
  INSERT_PARAM,
  DEL_PARAM,
  UPDATE_PARAM,
  GET_PARAM,
}
// PARAM - end

// 指定对应api
const api = {
  // PROJECT api
  [FETCH_PROJECTS_LIST]: {
    type: 'get',
    url: '/mock/project/getList',
  },
  [INSERT_PROJECT]: {
    type: 'post',
    url: '/mock/project/insert',
  },
  [UPDATE_PROJECT]: {
    type: 'put',
    url: '/mock/project/update',
  },
  [GET_PROJECT]: {
    type: 'get',
    url: '/mock/project/getProject',
  },
  [DEL_PROJECT]: {
    type: 'delete',
    url: '/mock/project/delProject',
  },
  // HOST api
  [FETCH_HOST_LIST]: {
    type: 'get',
    url: '/mock/host/getList',
  },
  [INSERT_HOST]: {
    type: 'post',
    url: '/mock/host/insert',
  },
  [DEL_HOST]: {
    type: 'delete',
    url: '/mock/host/delHost',
  },
  [UPDATE_HOST]: {
    type: 'put',
    url: '/mock/host/update',
  },
  [GET_HOST]: {
    type: 'get',
    url: '/mock/host/getHost',
  },
  // Api api
  [FETCH_API_LIST]: {
    type: 'get',
    url: '/mock/api/getList',
  },
  [INSERT_API]: {
    type: 'post',
    url: '/mock/api/insert',
  },
  [DEL_API]: {
    type: 'delete',
    url: '/mock/api/delApi',
  },
  [UPDATE_API]: {
    type: 'put',
    url: '/mock/api/update',
  },
  [GET_API]: {
    type: 'get',
    url: '/mock/api/getApi',
  },
  // METHOD api
  [FETCH_METHOD_LIST]: {
    type: 'get',
    url: '/mock/method/getList',
  },
  [INSERT_METHOD]: {
    type: 'post',
    url: '/mock/method/insert',
  },
  [DEL_METHOD]: {
    type: 'delete',
    url: '/mock/method/delMethod',
  },
  [UPDATE_METHOD]: {
    type: 'put',
    url: '/mock/method/update',
  },
  [GET_METHOD]: {
    type: 'get',
    url: '/mock/method/getMethod',
  },
  // PARAM api
  [FETCH_PARAM_LIST]: {
    type: 'get',
    url: '/mock/param/getList',
  },
  [INSERT_PARAM]: {
    type: 'post',
    url: '/mock/param/insert',
  },
  [DEL_PARAM]: {
    type: 'delete',
    url: '/mock/param/delParam',
  },
  [UPDATE_PARAM]: {
    type: 'put',
    url: '/mock/param/update',
  },
  [GET_PARAM]: {
    type: 'get',
    url: '/mock/param/getParam',
  },
}

const apis = {}
for (const key in api) {
  if (api.hasOwnProperty(key)) {
    const entry = api[key]
    apis[key] = (payload, commit, option = {}) => new Promise((resolve, reject) => {
      http[entry.type](entry.url, payload, { ...(entry.opt || {}), ...option })
        .then(rst => {
          const { success, data } = rst
          if (success) {
            resolve(data)
            commit && commit(data)
          } else {
            reject('服务错端误请联系管理员')
          }
        })
        .catch(e => console.log(e, 'error'))
    })
  }
}

export default apis