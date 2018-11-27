
import Handler from './Handler';
import * as DataLoader  from 'dataloader';

class ProjectHandler extends Handler{

  obtainLoader: any;

  constructor() {
    super();

    this.initObtainLoader();
  }

  private initObtainLoader() {
    this.obtainLoader = new DataLoader(async (ids) => {
      const params = ids.join(',');
      const projects = await this.task(`
        SELECT * FROM projects WHERE id IN (${params})
      `);
      return ids.map(
        id => projects.find(p => `${p.id}` === `${id}`) || new Error(`Row not found: ${id}`),
      );
    });
  }

  /**
   * 获取Host列表
   * @param params 请求参数
   */
  public async getList(params: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { page = 1, size = 10, query = '%' } = params;

      const sql = this.getQuerySQL('projects', [
        { type: this.queryType.like, key: 'name', value: query },
        { type: this.queryType.like, key: 'description', value: query },
      ]);

      try {
        const [list, total] = await this.listTask(sql, page, size);
        resolve({ page, size, total, list });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 新增项目
   * @param params 参数
   */
  public async insert(params: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { name, description, img } = params;

      const isRepeat = await this.checkRepeat('projects', 'name', name);
      if (isRepeat) {
        reject('项目名称重复,请重新输入');
      } else {
        const sql = `
        INSERT INTO projects( name, description, img )
        VALUES(?, ?, ?)
      `;

        const checkRst = this.checkParams(params, ['name', 'description']);

        if (checkRst.pass) {
          const data = await this.run(sql, [name, description, img]);
          if (data.changes > 0) {
            resolve({ id: data.lastID });
          } else {
            reject('新增失败');
          }
        } else {
          reject(checkRst.message);
        }
      }
    });
  }

  /**
   * 获取Project
   * @param params 请求参数
   */
  public async obtain(params: any): Promise<any> {
    return this.obtainLoader.load(params.id);
  }

  /**
   * 修改项目信息
   * @param params 请求参数
   */
  public async update(params: any): Promise< any > {
    return new Promise(async (resolve, reject) => {
      const { id, name, description, img } = params;
      const isRepeat = await this.checkRepeat('projects', 'name', name);
      if (isRepeat) {
        reject('项目名称重复,请重新输入');
      } else {
        const sql = 'UPDATE projects SET (name, description, img) = (?, ?, ?) WHERE id = ?';
        const paramKeys = ['name', 'description'];
        const checkRst = this.checkParams(params, paramKeys);
        if (checkRst.pass) {
          const data = await this.run(sql, [name, description, img, id]);
          if (data.changes > 0) {
            this.obtainLoader.clear(id);
            resolve({ id });
          } else {
            reject('修改失败');
          }
        } else {
          reject(checkRst.message);
        }
      }
    });
  }

  /**
   * 删除Project
   * @param params 请求参数
   */
  public async del(params: any) : Promise < any > {
    return new Promise(async (resolve, reject) => {
      const { id } = params;
      const sql = `
        DELETE FROM projects
        WHERE id = ${id}
      `;
      const extra = ['hosts', 'apis', 'methods', 'params'];
      try {
        await extra.forEach(async table => await this.run(
          `DELETE FROM ${table} WHERE projectId = ${id}`,
        ));
        const data = await this.run(sql);
        if (data) {
          this.obtainLoader.clear(id);
          resolve({ id: data.lastID });
        } else {
          reject('删除失败');
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  public handle(action: string, params: any): Promise<any > {
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
      case 'getProject':
        runner = this.obtain(params);
        break;
      case 'delProject':
        runner = this.del(params);
        break;
      default:
        runner = new Promise((resolve, reject) => reject());
        break;
    }
    return runner;
  }
}

const handler:ProjectHandler =  new ProjectHandler();

export { handler, ProjectHandler };
