import Handler from './Handler';
import ParamHandler from './ParamHandler';
import * as MockModule from '../common/MockRules';
const mockModule: any = MockModule;
class MethodHandler extends Handler{
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
        page = 1,
        size = 10,
        query = '%',
        method = -1, // HTTP METHOD
        id: apiId = '',
      } = params;
      const offset = (page - 1) * size;

      const sql = this.getQuerySQL('methods', [
        ... (apiId ? [{ type: this.queryType.eq, key: 'apiId', value: apiId }] : []),
        { type: this.queryType.like, key: 'name', value: query },
        ...(method > -1
          ? [{ type: this.queryType.eq, key: 'method', value: method }]
          : []),
      ]);

      try {
        const [list, total, methodDict] = await Promise.all([
          this.queryTask(sql, size, offset),
          this.countTask(sql),
          this.getDict('method'),
        ]);
        const recordData = await this.recordTask(
          'methodId',
          list.map(itm => itm.id),
        );
        const paramHander = new ParamHandler();
        const paramsData: any[] = await Promise.all(
          list.map(async (itm) => {
            const { list } = await paramHander.getList({ id: itm.id });
            return { [itm.id]: list };
          }),
        );
        console.log(paramsData);
        const recordMap = {};
        recordData.forEach((r) => {
          recordMap[r.methodId] = r.COUNT;
        });
        const paramsMap:any = {};
        paramsData.forEach((entry) => {
          const [key] = Object.keys(entry);
          paramsMap[key] = entry[key];
        });
        const rows = list.map((itm) => {
          const { method } = itm;
          return {
            ...itm,
            methodName: methodDict[method].name,
            recordCount: recordMap[itm.id] || 0,
            params: paramsMap[itm.id] || [],
          };
        });
        resolve({ total, page, size, list: rows  });
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
      const { apiId, name, method, result, projectId, hostId } = params;
      const sql = `
        INSERT INTO methods( apiId, name, method, result, projectId, hostId )
        VALUES(?, ?, ?, ?, ?, ?)
      `;

      const checkRst = this.checkParams(
        params,
        ['apiId', 'name', 'method', 'result', 'projectId', 'hostId'],
       );

      if (checkRst.pass) {
        const success = await this.run(sql, [apiId, name, method, result, projectId, hostId]);
        if (success) {
          resolve();
          mockModule.update();
        } else {
          reject('新增失败');
        }
      } else {
        reject(checkRst.message);
      }
    });
  }

   /**
   * 修改host信息
   * @param params 请求参数
   */
  public async update(params: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { id, name, method, result } = params;

      const sql = `
        UPDATE methods
        SET (name, method, result) = (?, ?, ?)
        WHERE id = ?
      `;
      const paramKeys = ['name', 'method', 'result'];
      const checkRst = this.checkParams(params, paramKeys);
      if (checkRst.pass) {
        const success = await this.run(sql, [name, method, result , id]);
        if (success) {
          resolve();
          mockModule.update();
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

      const sql = this.getQuerySQL('methods', [
        { type: this.queryType.eq, key: 'id', value: id },
      ]);

      try {
        const [
          [methods],
          [{ COUNT: records }],
          [{ COUNT: successCount }],
          [{ COUNT: failureCount }],
        ] = await Promise.all([
          this.queryTask(sql),
          this.recordTask('methodId', [id]),
          this.task(`
            SELECT COUNT(*) as COUNT
            FROM records
            WHERE methodId = ${id} and success = 1
          `),
          this.task(`
            SELECT COUNT(*) as COUNT
            FROM records
            WHERE methodId = ${id} and success = 0
          `),
        ]);
        resolve({
          ...methods,
          failureCount,
          records,
          successCount,
        });
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
        DELETE FROM methods
        WHERE id = ?;
      `;
      try {
        const success = await this.run(sql, [id]);
        if (success) {
          resolve();
          mockModule.update();
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
      case 'getMethod':
        runner = this.obtain(params);
        break;
      case 'delMethod':
        runner = this.del(params);
        break;
      default:
        runner = new Promise((resolve, reject) => reject());
        break;
    }
    return runner;
  }
}

export default MethodHandler;
