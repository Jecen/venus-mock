import Handler from './Handler';
import * as MockModule from '../common/MockRules';
const mockModule: any = MockModule;
class HostHandler extends Handler{
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
        online = -1,
        id: projectId = '',
      } = params;
      const offset = (page - 1) * size;

      const sql = this.getQuerySQL('hosts', [
        ... (projectId ? [{ type: this.queryType.eq, key: 'projectId', value: projectId }] : []),
        { type: this.queryType.like, key: 'name', value: query },
        { type: this.queryType.like, key: 'host', value: query },
        ...(online > -1
          ? [{ type: this.queryType.eq, key: 'online', value: online }]
          : []),
      ]);

      try {
        const [list, total, protocolDict] = await Promise.all([
          this.queryTask(sql, size, offset),
          this.countTask(sql),
          this.getDict('protocol'),
        ]);
        const recordData = await this.recordTask(
          'hostId',
          list.map(itm => itm.id),
        );
        const recordMap = {};
        recordData.forEach((r) => {
          recordMap[r.hostId] = r.COUNT;
        });
        const rows = list.map((itm) => {
          const { protocol } = itm;
          return {
            ...itm,
            protocolName: protocolDict[protocol].name,
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
      const { name, host, path, port = 80, protocol, online, projectId } = params;
      const sql = `
        INSERT INTO hosts( name, host, port, path, protocol, online, projectId )
        VALUES(?, ?, ?, ?, ?, ?, ?)
      `;

      const checkRst = this.checkParams(
        params,
        ['name', 'host', 'path', 'protocol', 'online', 'projectId'],
       );

      if (checkRst.pass) {
        const data = await this.run(sql, [name, host, port, path, protocol, online, projectId]);
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
      const { id, name, host, path = '', protocol, online = 1 } = params;

      const sql = `
        UPDATE hosts
        SET (name, host, path, protocol, online) = (?, ?, ?, ?, ?)
        WHERE id = ?
      `;
      const paramKeys = ['name', 'host', 'protocol'];
      const checkRst = this.checkParams(params, paramKeys);
      if (checkRst.pass) {
        const data = await this.run(sql, [name, host, path, protocol, online, id]);
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

      const sql = this.getQuerySQL('hosts', [
        { type: this.queryType.eq, key: 'id', value: id },
      ]);

      try {
        const [
          [host],
          [{ COUNT: records }],
          [{ COUNT: apis }],
          [{ COUNT: methods }],
          [{ COUNT: successCount }],
          [{ COUNT: failureCount }],
        ] = await Promise.all([
          this.queryTask(sql),
          this.recordTask('hostId', [id]),
          this.task(`
            SELECT COUNT(*) as COUNT
            FROM apis
            WHERE hostId = ${id}
          `),
          this.task(`
            SELECT COUNT(*) as COUNT
            FROM methods
            WHERE hostId = ${id}
          `),
          this.task(`
            SELECT COUNT(*) as COUNT
            FROM records
            WHERE hostId = ${id} and success = 1
          `),
          this.task(`
            SELECT COUNT(*) as COUNT
            FROM records
            WHERE hostId = ${id} and success = 0
          `),
        ]);
        resolve({
          ...host,
          apis,
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
        DELETE FROM hosts
        WHERE id = ?;
      `;
      const extra = ['apis', 'methods', 'params'];
      try {
        await extra.forEach(async table => await this.run(
          `DELETE FROM ${table} WHERE hostId = ${id}`,
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
      case 'getHost':
        runner = this.obtain(params);
        break;
      case 'delHost':
        runner = this.del(params);
        break;
      default:
        runner = new Promise((resolve, reject) => reject());
        break;
    }
    return runner;
  }
}

export default HostHandler;
