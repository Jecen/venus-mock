import { http } from 'root/app'

// 定义action type
const UPLOAD_IMG = 'UPLOAD_IMG'
const GET_DICT_BY_NAME = 'GET_DICT_BY_NAME'
export const commonApi = {
  UPLOAD_IMG,
  GET_DICT_BY_NAME,
}

// 指定对应api
const api = {
  // PROJECT api
  [UPLOAD_IMG]: {
    type: 'post',
    url: '/mock/common/upload',
    opt: {
      type: 'upload',
    },
  },
  [GET_DICT_BY_NAME]: {
    type: 'get',
    url: '/mock/common/dict',
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