
const getQuerySql = (table:String,
  querys:Array<any> = []) => {

  let sqlQuery = `SELECT * FROM ${table}`
  let sqlCount = `SELECT COUNT(*) as COUNT FROM ${table}`
  const queryList = []

  let isQueryEmpty = true
  querys.map(query => {
    if (query.value !== '*' && query.value !== '%') {
      isQueryEmpty = false
    }
  })

  if (!isQueryEmpty) {
    queryList.push(' WHERE ')
  }

  let isAddedParam = false
  querys.map((query, index) => {
    let queryStr = ''

    if (query.value === '*' || query.value === '%') return 

    isAddedParam && queryList.push(' AND ')

    switch (query.type) {
      case 'LIKE':
        queryList.push(`${query.key} LIKE '%${query.value}%'`)
        break;
      case '=':
        queryList.push(`${query.key} = '${query.value}'`)
      default:
        break;
    }

    isAddedParam = true
  })

  sqlCount += queryList.join('')

  queryList.push(' LIMIT ? OFFSET ?')

  sqlQuery += queryList.join('')
  return {sqlQuery, sqlCount}
}

const queryType = {
  like: 'LIKE',
  eq: '='
}

export default {
  checkParams: (params, list = []) => {
    const rst:any = {pass: false}
    let checkDist = null
      console.log(params);
    // empty check
    for (let i in params) {
      checkDist = params[i]
      if (!checkDist) {
        rst.message = `${i} is empty`
        return rst
      } else {
        if (typeof checkDist === 'string' && !checkDist.length) {
          rst.message = `${i} is empty`
          return rst
        }
      }
    }
    // missing check
    for (let key of list) {
      if(!params.hasOwnProperty(key)){
        rst.message = `${key} is missing`
        return rst
      }
    }
    // check passed
    return {
      pass: true
    }
  },
  queryType,
  isQueryEmpty: (querys:Array<any>) : Boolean => {
    let isEmpty = true
    querys.map(query => {
      if (query.value !== '*' && query.value !== '%') {
        isEmpty = false
      }
    })

    return isEmpty
  },
  getDict: (dictName: string) => {
    return getQuerySql("dicts", [
      { type: queryType.eq, key: "name", value: dictName } // 查询全部 online 的 host
    ])
  },
  getDictOption: (id) => {
    return getQuerySql("options", [
      { type: queryType.eq, key: "dictId", value: id } // 查询全部 online 的 host
    ])
  },
  getQuerySql
}