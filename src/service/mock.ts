import * as faker from 'faker';
import db from '../common/db';
import dbHelper from '../common/dbHelper';
import log from '../common/log';
import * as MockModule from '../common/MockRules';
import config from '../config';
import { Api, Host, Method, Param } from '../interface';
const fetch = require('node-fetch');
import * as venusFetch from 'venus-fetch';

import { handler as hostHandler } from '../handler/HostHandler';
import { handler as commonHandler } from '../handler/CommonHandler';
import { handler as apiHandler } from '../handler/ApiHandler';
import { handler as methodHandler } from '../handler/MethodHandler';
import io from '../common/io';

const mockModule: any = MockModule;
interface IMockRule {
  url: string;
  method: string;
  host: Host;
  api: Api;
  mtd: Method;
}
class MockService {
  /**
   * 数据库查询任务
   */
  static sqlTask: (sql: any) => Promise<any[]> = (sql = null) =>
    new Promise((resolve, reject) => {
      const dataBase: any = new db();
      dataBase.all(sql.sqlQuery, [100, 0], (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    })

  /**
   * 获取mock api 的 response
   * @param rule api 匹配的rule 对象
   * @param ctx 请求的上下文
   */
  public static async getResponse(rule: IMockRule, ctx: any): Promise<object> {
    const { mtd } = rule;
    const {
      params,
      query,
      request: { method, body },
    } = ctx;
    // 验证 mock api 的参数
    const checkRst = await this.checkParams(
      mtd.id,
      method === 'GET' ? query : body,
      method === 'GET',
    );
    if (!checkRst.success) {
      this.recordMock(rule, checkRst.msg, false);
      return {
        success: false,
        errorMessage: checkRst.msg,
        data: null,
      };
    }
    try {
      const data = JSON.parse(rule.mtd.result);
      this.recordMock(rule);
      return {
        data,
        success: true,
        errorMessage: '',
      };
    } catch (error) {
      this.recordMock(rule);
      return {
        success: true,
        errorMessage: '',
        data: rule.mtd.result,
      };
    }
  }

  /**
   * 获取字典项数据
   */
  private static async getDict(name) {
    const [d] = await this.sqlTask(dbHelper.getDict(name));
    const arr = d ? await this.sqlTask(dbHelper.getDictOption(d.id)) : [];
    const dict = {};
    arr.length > 0 &&
      arr.forEach((op) => {
        dict[op.id] = op;
      });
    return dict;
  }

  /**
   * 根据methodId获取请求阐述列表
   * @param id methodId
   */
  private static async getParams(id: number): Promise<Param[]> {
    const sql = dbHelper.getQuerySQL('params', [
      { type: dbHelper.queryType.eq, key: 'methodId', value: id }, // 查询全部 online 的 host
    ]);
    try {
      return await this.sqlTask(sql);
    } catch (error) {
      return [];
    }
  }

  /**
   * 验证mock api参数的方法
   * @param id 方法id
   * @param params 参数对象
   */
  private static async checkParams(
    id: number,
    params: any,
    isQuery: boolean,
  ): Promise<any> {
    const paramsDict = await this.getDict('paramsType');
    const paramsRules = await this.getParams(id);
    const error = [];
    const regPos = /^\d+(\.\d+)?$/; // 非负浮点数
    const regNeg =
      /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; // 负浮点数

    const isNumber = (val, isQuery) =>
      (isQuery && (regPos.test(val) || regNeg.test(val))) ||
      typeof val === 'number';

    const isBoolean = (val, isQuery) =>
      (isQuery && typeof val === 'boolean') ||
      (typeof val === 'string' && (val === 'true' || val === 'false'));

    paramsRules.forEach((rule) => {
      if (rule.mandatory) {
        if (!params[rule.key]) {
          error.push(`${rule.name}不能为空!`);
        } else {
          const paramType = paramsDict[rule.type];
          switch (paramType.name) {
            case 'String':
              if (typeof params[rule.key] !== 'string') {
                error.push(`${rule.name}参数需为字符串!`);
              }
              break;
            case 'Number':
              if (!isNumber(params[rule.key], isQuery)) {
                error.push(`${rule.name}参数需为数字!`);
              }
              break;
            case 'Boolean':
              if (!isBoolean(params[rule.key], isQuery)) {
                error.push(`${rule.name}参数需为Boolean类型!`);
              }
              break;
            default:
              break;
          }
        }
      }
    });
    return {
      success: error.length === 0,
      msg: error.length > 0 ? error.join(',') : '',
    };
  }

  /**
   * 记录mock次数
   * @param rule 匹配的mock规则
   */
  private static recordMock(rule: IMockRule, msg = '', success = true) {
    const { host, api, mtd: method, url } = rule;
    const params = {
      url,
      msg,
      projectId: host.projectId,
      methodId: method.id,
      hostId: host.id,
      apiId: api.id,
      success: success ? 1 : 0,
    };
    commonHandler.saveMockRecords(params);
  }
  dataBase: any;

  constructor() {
    faker.locale = 'zh_CN';

    const dataBase: any = new db();
    this.dataBase = dataBase;

    dataBase.serialize(() => {
      const updateRules = () => mockModule.update();
      let tableCount = 0;
      const cb = () => {
        tableCount += 1;
        if (tableCount === 7) {
          updateRules();
        }
      };
      const sqls = [
        `CREATE TABLE IF NOT EXISTS dicts (
          id          INTEGER   PRIMARY KEY AUTOINCREMENT
                                NOT NULL
                                UNIQUE,
          name        VARCHAR   NOT NULL
                                UNIQUE,
          crDate      TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
        )`,
        `CREATE TABLE IF NOT EXISTS options (
          id          INTEGER   PRIMARY KEY AUTOINCREMENT
                      NOT NULL
                      UNIQUE,
          dictId      INT       NOT NULL,
          name        VARCHAR   NOT NULL,
          crDate      TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
        )`,
        `CREATE TABLE IF NOT EXISTS projects (
			    id          INTEGER   PRIMARY KEY AUTOINCREMENT
			  						            NOT NULL
									              UNIQUE,
          name        VARCHAR   NOT NULL
                                UNIQUE,
				  description VARCHAR   NOT NULL,
				  img         VARCHAR   NOT NULL,
			    crDate      TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
        )`,
        `CREATE TABLE IF NOT EXISTS hosts (
			    id          INTEGER   PRIMARY KEY AUTOINCREMENT
			  						            NOT NULL
									              UNIQUE,
          projectId   INT       NOT NULL,
			    name        VARCHAR   NOT NULL,
          host        VARCHAR   NOT NULL,
          port        INT       NOT NULL
                                DEFAULT (80),
			    path        VARCHAR,
			    protocol    INT       NOT NULL,
				  online      BOOLEAN   NOT NULL
									              DEFAULT (0),
			    crDate      TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
        )`,
        `CREATE TABLE IF NOT EXISTS apis (
			    id          INTEGER   PRIMARY KEY AUTOINCREMENT
			  			     	            UNIQUE
									              NOT NULL,
          projectId   INT       NOT NULL,
			    hostId      INT       NOT NULL,
			    name        VARCHAR   NOT NULL,
			    url         VARCHAR   NOT NULL,
			    type        INT       NOT NULL
                                DEFAULT (0),
			    crDate      TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
        )`,
        `CREATE TABLE IF NOT EXISTS methods (
			    id          INTEGER   PRIMARY KEY AUTOINCREMENT
			  			   		            NOT NULL
										            UNIQUE,
				  projectId   INT       NOT NULL,
          hostId      INT       NOT NULL,
          apiId       INT       NOT NULL,
			    name        VARCHAR   NOT NULL,
          method      INT       NOT NULL,
          disable     BOOLEAN       NOT NULL
                                DEFAULT (0),
				  result      VARCHAR,
			    crDate      TIMESTAMP NOT NULL
								                DEFAULT (CURRENT_TIMESTAMP)
        )`,
        `CREATE TABLE IF NOT EXISTS params (
          id          INTEGER   PRIMARY KEY AUTOINCREMENT
                                NOT NULL
                                UNIQUE,
          projectId   INT       NOT NULL,
          hostId      INT       NOT NULL,
          apiId       INT       NOT NULL,
          methodId    INT       NOT NULL,
          key         VARCHAR   NOT NULL,
          name        VARCHAR   NOT NULL,
          type        INT       NOT NULL,
          info        VARCHAR,
          mandatory   BOOLEAN   NOT NULL
                                DEFAULT (0),
          crDate      TIMESTAMP NOT NULL
                                DEFAULT (CURRENT_TIMESTAMP)
        )`,
        `CREATE TABLE IF NOT EXISTS records (
          id          INTEGER   PRIMARY KEY AUTOINCREMENT
                                NOT NULL
                                UNIQUE,
          projectId   INT       NOT NULL,
          methodId    INT       NOT NULL,
          hostId	    INT		    NOT NULL,
          apiId       INT       NOT NULL,
          url			    VARCHAR   NOT NULL,
          success     BOOLEAN   NOT NULL
                                DEFAULT (1),
          msg			    VARCHAR,
          crDate      TIMESTAMP NOT NULL
                                DEFAULT (CURRENT_TIMESTAMP)
        )`,
        `CREATE TABLE IF NOT EXISTS records (
          id          INTEGER   PRIMARY KEY AUTOINCREMENT
                                NOT NULL
                                UNIQUE,
          projectId   INT       NOT NULL,
          hostId      INT       NOT NULL,
          apiId       INT       NOT NULL,
          methodId    INT       NOT NULL,
          url			    VARCHAR   NOT NULL,
          success     INT       NOT NULL
                                DEFAULT (1),
          msg			    VARCHAR,
          crDate      TIMESTAMP NOT NULL
                                DEFAULT (CURRENT_TIMESTAMP)
			  )`,
      ];

      let cursor = 0;
      const initTable = () => {
        const sql = sqls[cursor];
        dataBase.run(sql, () => {
          cb && cb();
          if (cursor < sqls.length - 1) {
            cursor += 1;
            initTable();
          }
        });
      };

      initTable();

      // TODO 字典项初始化
      // db.run(`INSERT INTO
      //   hosts(name,host,path,protocol,online)
      //   VALUES ("venus-mock","api.venus-mock.com","/web/v1/api",1,1)`)

      // db.run(`INSERT INTO
      //   apis(hostId,name,url,type)
      //   VALUES (2,"获取Venus-Mock信息","/info",7)`)

      // db.run(`INSERT INTO
      //   methods(apiId,name,method,result)
      //   VALUES (1,"GET:获取Venus-Mock信息",3,"VenusMock是一个能够提供mock功能的应用工具")`)
    });

    log.sysInfo('MOCK SERVICE IS READY');
  }

  /**
   * 根据代理过的请求进行匹配，并返回规则对象
   * @param path 路径
   * @param method 请求方法
   */
  matchRule(
    trueHost: string,
    path: string,
    method: string,
    protocol: string,
  ): object {
    let matchPath =
      path.indexOf('?') > -1 ? path.substr(0, path.indexOf('?')) : path;
    matchPath = matchPath.replace(config.proxyHandlePath, '');
    for (const rule of mockModule.rules) {
      const { host, api } = rule;
      if (
        `${`${host.protocol}` === '1' ? 'http' : 'https'}` === protocol &&
        `${host.host}` === trueHost &&
        `${host.path}${api.url}` === matchPath &&
        method === rule.method
      ) {
        return rule;
      }
    }
    return null;
  }

  public async runTestApis(hostId: number, timeStamp: number, io: io) {
    const opt = {
      conf: {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          mode: 'test',
        },
      },
      timeout: 5000,
    };
    const http = venusFetch(opt, fetch);
    const protocolDict = await commonHandler.getDict('protocol');
    const { id, host, port, protocol, path, name } = await hostHandler.obtain({
      id: hostId,
    });
    const { list: apis } = await apiHandler.getList({ id });
    const methods = [];
    for (const a of apis) {
      const { id, url } = a;
      const { list } = await methodHandler.getList({ id });
      list.forEach((m) => {
        methods.push({ ...m, url, api: a });
      });
    }

    if (methods.length > 0) {
      io.sendMsg('testStep', {
        timeStamp,
        data: {
          type: 'start-test',
          count: methods.length,
          hostName: name,
        },
      });
    }

    await methods.forEach(async (m) => {
      const { methodName, params, url } = m;
      console.log(`
        [${methodName.toUpperCase()}]
      `);
      const apiFullUrl = `${protocolDict[protocol].name}://${host}${
        port === 80 ? '' : `:${port}`
      }${path}${url}`;
      try {
        io.sendMsg('testStep', {
          timeStamp,
          data: {
            method: m,
            url: `${methodName.toUpperCase()} ${apiFullUrl}`,
            type: 'fetch-start',
          },
        });
        const rst = await http[methodName](apiFullUrl);
        io.sendMsg('testStep', {
          timeStamp,
          data: {
            rst,
            method: m,
            id: m.id,
            url: `${methodName.toUpperCase()} ${apiFullUrl}`,
            type: 'fetch-success',
          },
        });
      } catch (error) {
        console.log(error);
        const { httpStatus, message, code } = error;
        io.sendMsg('testStep', {
          timeStamp,
          data: {
            id: m.id,
            method: m,
            rst: { httpStatus, message, code },
            url: `${methodName.toUpperCase()} ${apiFullUrl}`,
            type: 'fetch-failure',
          },
        });
      }
    });
  }
}

const service: MockService = new MockService();

export { service, MockService as mockService };
