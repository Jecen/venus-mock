import Handler from './Handler';
import * as MockModule from '../common/MockRules';
const mockModule: any = MockModule;
class ParamHandler extends Handler{
  constructor() {
    super();
  }

  /**
  * 获取Host列表
  * @param params 请求参数
  */
  public async getList(params: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const {
        query = '%',
        type = -1, // 参数类型
        mandatory = -1, // 是否强制 1 强制 0 不强制
        id: methodId = '',
      } = params;

      const sql = this.getQuerySQL('params', [
        ... (methodId ? [{ type: this.queryType.eq, key: 'methodId', value: methodId }] : []),
        { type: this.queryType.like, key: 'name', value: query },
        ...(type > -1
          ? [{ type: this.queryType.eq, key: 'type', value: type }]
          : []),
        ...(mandatory > -1
          ? [{ type: this.queryType.eq, key: 'mandatory', value: mandatory }]
          : []),
      ]);

      try {
        const [list, paramsTypeDict] = await Promise.all([
          this.queryTask(sql),
          this.getDict('paramsType'),
        ]);

        const rows = list.map((itm) => {
          const { type } = itm;
          return {
            ...itm,
            typeName: paramsTypeDict[type].name,
          };
        });
        resolve({ list: rows  });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  /**
   * 新增host
   * @param params 参数
   */
  public async insert(params: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { methodId, key, name, type, info, mandatory, projectId, hostId, apiId } = params;
      const sql = `
        INSERT INTO params( methodId, key, name, type, info, mandatory, projectId, hostId, apiId )
        VALUES(?, ?, ?, ?, ?, ?, ? ,?, ?)
      `;

      const checkRst = this.checkParams(
        params,
        ['methodId', 'key', 'name', 'type', 'info', 'mandatory',  'projectId', 'hostId', 'apiId'],
       );

      if (checkRst.pass) {
        const data =
          await this.run(sql,
                         [methodId, key, name, type, info, mandatory, projectId, hostId, apiId],
                         );
        if (data) {
          mockModule.update();
          resolve({ id: data.lastID });
        } else {
          reject('新增失败');
        }
      } else {
        reject(checkRst.message);
      }
    });
  }

  public async batchInsert (params: [any]): Promise<any> {
    // const sql =
    return new Promise(async (resolve, reject) => {
      const value = [];
      const cSqls = params.map((p) => {
        const { methodId, key, name, type, info, mandatory, projectId, hostId, apiId } = p;
        const checkRst = this.checkParams(
          p,
          ['methodId', 'key', 'name', 'type', 'info', 'mandatory',  'projectId', 'hostId', 'apiId'],
         );

        if (!checkRst.pass) {
          reject(`在 key 为${key}的参数信息中 [${checkRst.message}]`);
        }
        const valStr =
          value.push(
            methodId, key, name,
            type, info, mandatory ? 1 : 0,
            projectId, hostId, apiId);
        return `
          SELECT ?,?,?,?,?,?,?,?,?
        `;
      });
      let sql = `
        INSERT INTO params( methodId, key, name, type, info, mandatory, projectId, hostId, apiId )
      `;
      sql += cSqls.join(`
        UNION ALL
      `);
      const data = await this.run(sql, value);
      if (data.changes > 0) {
        mockModule.update();
        resolve(true);
      } else {
        reject('批量新增失败');
      }
    });
  }

   /**
   * 修改host信息
   * @param params 请求参数
   */
  public async update(params: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { id, key, name, type, info, mandatory } = params;

      const sql = `
        UPDATE params
        SET (key, name, type, info, mandatory) = (?, ?, ?, ?, ?)
        WHERE id = ?
      `;
      const paramKeys = ['key', 'name', 'type', 'info', 'mandatory'];
      const checkRst = this.checkParams(params, paramKeys);
      if (checkRst.pass) {
        const data = await this.run(sql, [key, name, type, info, mandatory, id]);
        if (data) {
          mockModule.update();
          resolve({ id: data.lastID });
        } else {
          reject('修改失败');
        }
      } else {
        reject(checkRst.message);
      }
    });
  }

  /**
   * 获取Host
   * @param params 请求参数
   */
  public async obtain(params: any): Promise<any > {
    return new Promise(async (resolve, reject) => {
      const { id } = params;

      const sql = this.getQuerySQL('params', [
        { type: this.queryType.eq, key: 'id', value: id },
      ]);

      try {
        const [param] = await this.queryTask(sql);
        resolve(param);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 删除Host
   * @param params 请求参数
   */
  public async del(params: any) : Promise < any > {
    return new Promise(async (resolve, reject) => {
      const { id } = params;

      const sql = `
        DELETE FROM params
        WHERE id = ?;
      `;
      try {
        const data = await this.run(sql, [id]);
        if (data) {
          mockModule.update();
          resolve({ id: data.lastID });
        } else {
          reject('删除失败');
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  public handle(action: string, params: any): Promise < any > {
    let runner = null;
    switch (action) {
      case 'getList':
        runner = this.getList(params);
        break;
      case 'insert':
        runner = this.insert(params);
        break;
      case 'update':
        runner = this.update(params);
        break;
      case 'getParam':
        runner = this.obtain(params);
        break;
      case 'delParam':
        runner = this.del(params);
        break;
      default:
        runner = new Promise((resolve, reject) => reject());
        break;
    }
    return runner;
  }
}

const handler:ParamHandler =  new ParamHandler();

export { handler, ParamHandler };
