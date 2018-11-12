
const getQuerySQL = (table:String, query:any[] = []) => {
  let sqlQuery = `SELECT * FROM ${table}`;
  let sqlCount = `SELECT COUNT(*) as COUNT FROM ${table}`;
  const queryList = [];

  let isQueryEmpty = true;
  query.map((query) => {
    if (query.value !== '*' && query.value !== '%') {
      isQueryEmpty = false;
    }
  });

  if (!isQueryEmpty) {
    queryList.push(' WHERE ');
  }

  let isAddedParam = false;
  query.map((query, index) => {

    if (query.value === '*' || query.value === '%') return;

    isAddedParam && queryList.push(' AND ');

    switch (query.type) {
      case 'LIKE':
        queryList.push(`${query.key} LIKE '%${query.value}%'`);
        break;
      case '=':
        queryList.push(`${query.key} = '${query.value}'`);
      default:
        break;
    }

    isAddedParam = true;
  });

  sqlCount += queryList.join('');

  queryList.push(' LIMIT ? OFFSET ?');

  sqlQuery += queryList.join('');
  return { sqlQuery, sqlCount };
};

const queryType = {
  like: 'LIKE',
  eq: '=',
};

const checkParams = (params: any, list: any[] = []): any => {
  const rst:any = { pass: false };
  let checkDist = null;
  // empty check
  for (const i in params) {
    if (list.indexOf(i) > -1) {
      checkDist = params[i];
      console.log(i, checkDist);
      if ((!checkDist && checkDist !== 0) || typeof checkDist === 'string' && !checkDist.length) {
        rst.message = `${i} is empty`;
        return rst;
      }
    }
  }
  // missing check
  for (const key of list) {
    if (!params.hasOwnProperty(key)) {
      rst.message = `${key} is missing`;
      return rst;
    }
  }
  // check passed
  return {
    pass: true,
  };
};

const isQueryEmpty = (query: any[]): Boolean => {
  let isEmpty = true;
  query.map((query) => {
    if (query.value !== '*' && query.value !== '%') {
      isEmpty = false;
    }
  });

  return isEmpty;
};

const getDict = (dictName: string): any => {
  return getQuerySQL('dicts', [
    { type: queryType.eq, key: 'name', value: dictName },
  ]);
};

const getDictOption = (id): any => {
  return getQuerySQL('options', [
    { type: queryType.eq, key: 'dictId', value: id }, // 查询全部 online 的 host
  ]);
};

export default {
  queryType,
  getQuerySQL,
  checkParams,
  isQueryEmpty,
  getDict,
  getDictOption,
};
