import Handler from './Handler';
import * as MockModule from '../common/MockRules';
const mockModule: any = MockModule;
class ApiHandler extends Handler{
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
        type = -1, // mock or pass
        id: hostId = '',
      } = params;
      const offset = (page - 1) * size;

      const sql = this.getQuerySQL('apis', [
        ... (hostId ? [{ type: this.queryType.eq, key: 'hostId', value: hostId }] : []),
        { type: this.queryType.like, key: 'name', value: query },
        ...(type > -1
          ? [{ type: this.queryType.eq, key: 'type', value: type }]
          : []),
      ]);

      try {
        const [list, total, mockTypeDict] = await Promise.all([
          this.queryTask(sql, size, offset),
          this.countTask(sql),
          this.getDict('mockType'),
        ]);
        const recordData = await this.recordTask(
          'apiId',
          list.map(itm => itm.id),
        );
        const recordMap = {};
        recordData.forEach((r) => {
          recordMap[r.apiId] = r.COUNT;
        });
        const rows = list.map((itm) => {
          const { type } = itm;
          return {
            ...itm,
            typeName: mockTypeDict[type].name,
            recordCount: recordMap[itm.id] || 0,
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
      const { hostId, name, url, type, projectId } = params;
      const sql = `
        INSERT INTO apis( hostId, name, url, type, projectId )
        VALUES(?, ?, ?, ?, ?)
      `;

      const checkRst = this.checkParams(
        params,
        ['hostId', 'name', 'url', 'type', 'projectId'],
       );

      if (checkRst.pass) {
        const data = await this.run(sql, [hostId, name, url, type, projectId]);
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

   /**
   * 修改host信息
   * @param params 请求参数
   */
  public async update(params: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { id, name, url, type } = params;

      const sql = `
        UPDATE apis
        SET (name, url, type) = (?, ?, ?)
        WHERE id = ?
      `;
      const paramKeys = ['name', 'url', 'type'];
      const checkRst = this.checkParams(params, paramKeys);
      if (checkRst.pass) {
        const data = await this.run(sql, [name, url, type, id]);
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
  public async obtain(params: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { id } = params;

      const sql = this.getQuerySQL('apis', [
        { type: this.queryType.eq, key: 'id', value: id },
      ]);

      try {
        const [
          [apis],
          [{ COUNT: records }],
          [{ COUNT: methods }],
          [{ COUNT: successCount }],
          [{ COUNT: failureCount }],
        ] = await Promise.all([
          this.queryTask(sql),
          this.recordTask('apiId', [id]),
          this.task(`
            SELECT COUNT(*) as COUNT
            FROM methods
            WHERE apiId = ${id}
          `),
          this.task(`
            SELECT COUNT(*) as COUNT
            FROM records
            WHERE apiId = ${id} and success = 1
          `),
          this.task(`
            SELECT COUNT(*) as COUNT
            FROM records
            WHERE apiId = ${id} and success = 0
          `),
        ]);
        resolve({
          ...apis,
          failureCount,
          methods,
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
  public async del(params: any) : Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { id } = params;

      const sql = `
        DELETE FROM apis
        WHERE id = ?;
      `;
      const extra = ['methods', 'params'];
      try {
        await extra.forEach(async table => await this.run(
          `DELETE FROM ${table} WHERE apiId = ${id}`,
        ));
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

  public handle(action: string, params: any): Promise<any> {
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
      case 'getApi':
        runner = this.obtain(params);
        break;
      case 'delApi':
        runner = this.del(params);
        break;
      default:
        runner = new Promise((resolve, reject) => reject());
        break;
    }
    return runner;
  }
}

export default ApiHandler;
