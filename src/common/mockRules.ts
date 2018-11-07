import * as appConfig from '../../config';
import log from '../common/log';
// interface
import { Api, Host, Method } from '../interface';
import db from './db';
import dbHelper from './dbHelper';

const proxyRules = new Set();

/**
 *  查询数据库 并生成规则名单列表
 */
async function  generateRules() {
  const dataBase: any = new db();

  const queryType = dbHelper.queryType;
  const hostSql = dbHelper.getQuerySQL('hosts', [
    { type: queryType.eq, key: 'online', value: 1 }, // 查询全部 online 的 host
  ]);
  const sqlTask:(sql: any) => Promise<any[]> = sql => new Promise((resolve, reject) => {
    dataBase.all(sql.sqlQuery, [100, 0],  (err, rows) => {
      if (err) { reject(err); }
      resolve(rows);
    });
  });

  const getDict = async (name) => {
    const [d] = await sqlTask(dbHelper.getDict(name));
    const arr = d ? await sqlTask(dbHelper.getDictOption(d.id)) : [];
    const dict = {};
    arr.length > 0 && arr.forEach((op) => {
      dict[op.id] = op;
    });
    return dict;
  };

  proxyRules.clear();

  try {
    const protocolDict = await getDict('protocol');
    const methodDict = await getDict('method');
    const mockTypeDict = await getDict('mockType');

    const hosts = await sqlTask(hostSql);
    for (const host of hosts) {
      const apiSql = dbHelper.getQuerySQL('apis', [
        { type: queryType.eq, key: 'hostId', value: host.id }, // 查询全部 online 的 host
        { type: queryType.eq, key: 'type', value: 7 }, // 查询全部 online 的 host
      ]);
      const apis = await sqlTask(apiSql);
      for (const api of apis) {
        const methodSql = dbHelper.getQuerySQL('methods', [
          { type: queryType.eq, key: 'apiId', value: api.id }, // 查询全部 online 的 host
        ]);
        const methods = await sqlTask(methodSql);
        methods.forEach((m) => {
          const { method } = m;
          const { protocol, host: hostUrl, path } = host;
          const { url } = api;
          proxyRules.add({
            host,
            api,
            url: `${protocolDict[protocol].name}://${hostUrl}${path}${url}`,
            method: methodDict[method].name.toUpperCase(),
            mtd: m,
          });
        });
      }
    }
  } catch (error) {
    log.sysError(error);
  }
}

module.exports = {
  *beforeSendRequest(req) {
    for (const rule of proxyRules) {
      if (req.url.indexOf(rule.url) === 0
        && rule.method === req.requestOptions.method) {
        const newReqOptions = req.requestOptions;
        newReqOptions.hostname = 'localhost';
        newReqOptions.port = appConfig.httpPort;
        newReqOptions.path = `/mockapi${newReqOptions.path}`;
        log.proxyLog(
          req.url,
          `//${newReqOptions.hostname}:${newReqOptions.port}${newReqOptions.path}`,
        );
        return {
          requestOptions: newReqOptions,
        };
      }
    }
  },
  get rules() {
    return proxyRules;
  },
  /**
   * 增删改文件之后需重新生成 proxyRules 和 configs
   */
  update() {
    generateRules();
  },
};
