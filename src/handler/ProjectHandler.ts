
import Handler from './Handler';

class ProjectHandler extends Handler{
  constructor() {
    super();
  }

  /**
   * 获取Host列表
   * @param params 请求参数
   */
  private async getProjectList(params: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { page = 1, size = 10, query = '%' } = params;

      const sql = this.getQuerySQL('projects', [
        { type: this.queryType.like, key: 'name', value: query },
        { type: this.queryType.like, key: 'description', value: query },
      ]);

      try {
        const [list, total] = await this.listTask(sql, page, size);

        const [rows, hosts, apis, methods] = await Promise.all([
          this.recordTask('projectId', list.map(itm => itm.id)),
          this.task(`
            SELECT projectId, COUNT(*) as COUNT
            FROM hosts
            WHERE projectId IN (${list.map(itm => itm.id).join(', ')})
            GROUP BY projectId
          `),
          this.task(`
            SELECT projectId, COUNT(*) as COUNT
            FROM apis
            WHERE projectId IN (${list.map(itm => itm.id).join(', ')})
            GROUP BY projectId
          `),
          this.task(`
            SELECT projectId, COUNT(*) as COUNT
            FROM methods
            WHERE projectId IN (${list.map(itm => itm.id).join(', ')})
            GROUP BY projectId
          `),
        ]);
        const mapFunc = (arr) => {
          const map = {};
          arr.forEach((r) => {
            map[r.projectId] = r.COUNT;
          });
          return map;
        };
        const recordMap = mapFunc(rows);
        const hostMap = mapFunc(hosts);
        const apiMap = mapFunc(apis);
        const methodMap = mapFunc(methods);
        resolve({
          page,
          size,
          total,
          list: list.map(itm => ({
            ...itm,
            apiCount: apiMap[itm.id] || 0,
            hostCount: hostMap[itm.id] || 0,
            methodCount: methodMap[itm.id] || 0,
            recordCount: recordMap[itm.id] || 0,
          })),
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 新增项目
   * @param params 参数
   */
  private async insertProject(params: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { name, description, img } = params;
      const dataBase = this.dataBase;
      const sql = `
        INSERT INTO projects( name, description, img )
        VALUES(?, ?, ?)
      `;

      const checkRst = this.checkParams(params, ['name', 'description']);

      if (checkRst.pass) {
        const success = await this.run(sql, [name, description, img]);
        resolve();
      } else {
        reject(checkRst.message);
      }
    });
  }

  /**
   * 获取Host列表
   * @param params 请求参数
   */
  private async getProject(params: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { id } = params;

      const sql = this.getQuerySQL('projects', [
        { type: this.queryType.eq, key: 'id', value: id },
      ]);

      try {
        const [
          [project],
          [{ COUNT: records }],
          [{ COUNT: hosts }],
          [{ COUNT: apis }],
          [{ COUNT: methods }],
          [{ COUNT: successCount }],
          [{ COUNT: failureCount }],
        ] = await Promise.all([
          this.queryTask(sql),
          this.recordTask('projectId', [id]),
          this.task(`
            SELECT COUNT(*) as COUNT
            FROM hosts
            WHERE projectId = ${id}
          `),
          this.task(`
            SELECT COUNT(*) as COUNT
            FROM apis
            WHERE projectId = ${id}
          `),
          this.task(`
            SELECT COUNT(*) as COUNT
            FROM methods
            WHERE projectId = ${id}
          `),
          this.task(`
            SELECT COUNT(*) as COUNT
            FROM records
            WHERE projectId = ${id} and success = 1
          `),
          this.task(`
            SELECT COUNT(*) as COUNT
            FROM records
            WHERE projectId = ${id} and success = 0
          `),
        ]);
        if (project.img) {
          project['img'] = `//${this.appConf.hostName}:${this.appConf.httpPort}${project.img}`;
        }
        resolve({
          ...project,
          apis,
          failureCount,
          hosts,
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
   * 修改项目信息
   * @param params 请求参数
   */
  private async updateProject(params: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { id, name, description, img } = params;

      const sql = 'UPDATE projects SET (name, description, img) = (?, ?, ?) WHERE id = ?';
      const paramKeys = ['name', 'description'];
      const checkRst = this.checkParams(params, paramKeys);
      if (checkRst.pass) {
        const success = await this.run(sql, [name, description, img, id]);
        resolve();
      } else {
        reject(checkRst.message);
      }
    });
  }

  public handle(action: string, params: any): Promise<any> {
    let runner = null;
    switch (action) {
      case 'getList':
        runner = this.getProjectList(params);
        break;
      case 'insert':
        runner = this.insertProject(params);
        break;
      case 'update':
        runner = this.updateProject(params);
        break;
      case 'getProject':
        runner = this.getProject(params);
        break;
      default:
        runner = new Promise((resolve, reject) => reject());
        break;
    }
    return runner;
  }
}

export default ProjectHandler;
